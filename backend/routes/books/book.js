const express = require("express");
const multer = require("multer");
const router = express.Router();

// Use memory storage instead of disk — files go to Supabase Storage
const upload = multer({ storage: multer.memoryStorage() });

module.exports = (db, io) => {
  // GET books with pagination + search
  router.get("/view-book", async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    // Get paginated results
    const { data: books, error } = await db
      .from("books")
      .select("*")
      .or(
        `title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`,
      )
      .range(offset, offset + limit - 1);

    if (error) return res.status(500).send(error);

    // Get total count
    const { count, error: countError } = await db
      .from("books")
      .select("*", { count: "exact", head: true })
      .or(
        `title.ilike.%${search}%,author.ilike.%${search}%,isbn.ilike.%${search}%`,
      );

    if (countError) return res.status(500).send(countError);

    res.json({ books, total: count, page, limit });
  });

  // Helper to upload a file buffer to Supabase Storage
  const uploadToStorage = async (db, bucket, file) => {
    const filename = `${Date.now()}-${Math.round(Math.random() * 1e9)}${require("path").extname(file.originalname)}`;
    const { error } = await db.storage
      .from(bucket)
      .upload(filename, file.buffer, { contentType: file.mimetype });

    if (error) throw error;

    // Get public URL (for covers) or just the filename (for private contents)
    const { data } = db.storage.from(bucket).getPublicUrl(filename);
    return { filename, publicUrl: data?.publicUrl };
  };

  // POST a new book
  router.post(
    "/add-book",
    upload.fields([
      { name: "cover", maxCount: 1 },
      { name: "content", maxCount: 1 },
    ]),
    async (req, res) => {
      const {
        isbn,
        title,
        author,
        genre,
        description,
        department,
        availability,
        published_year,
      } = req.body;

      try {
        let coverPath = null;
        let contentPath = null;

        if (req.files["cover"]?.[0]) {
          const { publicUrl } = await uploadToStorage(
            db,
            "covers",
            req.files["cover"][0],
          );
          coverPath = publicUrl;
        }
        if (req.files["content"]?.[0]) {
          const { filename } = await uploadToStorage(
            db,
            "contents",
            req.files["content"][0],
          );
          contentPath = filename; // store filename only for private access
        }

        const { data: insertResult, error } = await db
          .from("books")
          .insert([
            {
              isbn,
              title,
              author,
              genre,
              description,
              department,
              availability,
              published_year,
              cover: coverPath,
              content: contentPath,
            },
          ])
          .select()
          .single();

        if (error) return res.status(500).send(error);

        io.emit("bookAdded", insertResult);
        res.json({ message: "Book added successfully!", book: insertResult });
      } catch (err) {
        console.error("Add book error:", err);
        res.status(500).json({ message: "Failed to add book" });
      }
    },
  );

  // EDIT a book
  router.post(
    "/edit-book/:id",
    upload.fields([
      { name: "cover", maxCount: 1 },
      { name: "content", maxCount: 1 },
    ]),
    async (req, res) => {
      const { id } = req.params;
      const {
        isbn,
        title,
        author,
        genre,
        description,
        department,
        availability,
        published_year,
      } = req.body;

      try {
        // Fetch existing book
        const { data: existing, error: fetchError } = await db
          .from("books")
          .select("*")
          .eq("id", id)
          .single();

        if (fetchError || !existing)
          return res
            .status(404)
            .json({ success: false, message: "Book not found" });

        // Upload new files if provided
        let coverPath = existing.cover;
        let contentPath = existing.content;

        if (req.files["cover"]?.[0]) {
          const { publicUrl } = await uploadToStorage(
            db,
            "covers",
            req.files["cover"][0],
          );
          coverPath = publicUrl;
        }
        if (req.files["content"]?.[0]) {
          const { filename } = await uploadToStorage(
            db,
            "contents",
            req.files["content"][0],
          );
          contentPath = filename;
        }

        const updates = {
          ...(isbn && { isbn }),
          ...(title && { title }),
          ...(author && { author }),
          ...(genre && { genre }),
          ...(description && { description }),
          ...(department && { department }),
          ...(availability && { availability }),
          ...(published_year && { published_year }),
          cover: coverPath,
          content: contentPath,
        };

        const { data: updatedBook, error: updateError } = await db
          .from("books")
          .update(updates)
          .eq("id", id)
          .select()
          .single();

        if (updateError) return res.status(500).send(updateError);

        io.emit("bookUpdated", updatedBook);
        res.json({
          success: true,
          message: "Book updated successfully.",
          book: updatedBook,
        });
      } catch (err) {
        console.error("Edit book error:", err);
        res.status(500).json({ message: "Failed to edit book" });
      }
    },
  );

  // DELETE a book
  router.delete("/delete-book/:id", async (req, res) => {
    const { id } = req.params;

    const { error, count } = await db
      .from("books")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) return res.status(500).send(error);

    if (count > 0) {
      io.emit("bookDeleted", { id });
      res.json({ message: "Book deleted successfully." });
    } else {
      res.status(404).json({ message: "Book not found." });
    }
  });

  // Toggle availability
  router.put("/:id/availability", async (req, res) => {
    const { id } = req.params;
    const { availability } = req.body;

    const { error, count } = await db
      .from("books")
      .update({ availability })
      .eq("id", id);

    if (error) return res.status(500).send(error);

    io.emit("bookAvailabilityUpdated", { bookId: id, availability });
    res.json({ success: true });
  });

  return router;
};
