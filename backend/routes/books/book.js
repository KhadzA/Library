const express = require('express');
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'balls'; // In production, put this in .env

module.exports = (db, io) => {
  const allowedRoles = ['admin', 'librarian'];

  // GET books with pagination
router.get('/view-book', (req, res) => {
  const limit = parseInt(req.query.limit) || 10;
  const page = parseInt(req.query.page) || 1;
  const search = req.query.search || '';
  const offset = (page - 1) * limit;

  const searchQuery = `%${search}%`;

  const booksQuery = `
    SELECT * FROM books 
    WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?
    LIMIT ? OFFSET ?
  `;
  const countQuery = `
    SELECT COUNT(*) AS total FROM books 
    WHERE title LIKE ? OR author LIKE ? OR isbn LIKE ?
  `;

  db.query(booksQuery, [searchQuery, searchQuery, searchQuery, limit, offset], (err, books) => {
    if (err) return res.status(500).send(err);

    db.query(countQuery, [searchQuery, searchQuery, searchQuery], (err, countResult) => {
      if (err) return res.status(500).send(err);

      res.json({
        books,
        total: countResult[0].total,
        page,
        limit
      });
    });
  });
});




  // Set storage engine
  const storage = multer.diskStorage({
      destination: (req, file, cb) => {
          if (file.fieldname === 'cover') {
              cb(null, 'uploads/covers/');
          } else if (file.fieldname === 'content') {
              cb(null, 'uploads/contents/');
          }
      },
      filename: (req, file, cb) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
          cb(null, uniqueSuffix + path.extname(file.originalname));
      }
  });

  const upload = multer({ storage: storage });


  
// router.get('/read/:filename', (req, res) => {
//   const token = req.headers.authorization?.split(' ')[1];
//   const { filename } = req.params;

//   if (!token) return res.status(401).json({ message: 'Unauthorized' });

//   try {
//     const decoded = jwt.verify(token, JWT_SECRET);
    
//     if (decoded.role === 'student') {
//       return res.status(403).json({ message: 'Access denied for this role' });
//     }

//     const filePath = path.join(__dirname, '../../uploads/contents/', filename);
//     if (!fs.existsSync(filePath)) return res.status(404).json({ message: 'File not found' });

//     res.setHeader('Content-Type', 'application/pdf');
//     fs.createReadStream(filePath).pipe(res);
//   } catch (err) {
//     return res.status(401).json({ message: 'Invalid token' });
//   }
// });


  // POST a new book
  router.post('/add-book', upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'content', maxCount: 1 },
  ]), (req, res) => {
    const { isbn, title, author, genre, description, department, availability, published_year } = req.body;
    const coverPath = req.files['cover']?.[0]?.filename || null;
    const contentPath = req.files['content']?.[0]?.filename || null;

    const sql = `INSERT INTO books (isbn, title, author, genre, description, department, availability, published_year, cover, content) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`;
    const values = [isbn, title, author, genre, description, department, availability, published_year, coverPath, contentPath];

    db.query(sql, values, (err, results) => {
      if (err) return res.status(500).send(err);

      // Emit the real-time event
      const insertedBook = {
        id: results.insertId,
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
      };

      io.emit('bookAdded', insertedBook); //  emit to all connected clients    THAT'S RIGHT INNIT

      res.json({ message: 'Book added successfully!', book: insertedBook });
    });
  });

  // EDIT a book
  router.post('/edit-book/:id', upload.fields([
    { name: 'cover', maxCount: 1 },
    { name: 'content', maxCount: 1 },
  ]), (req, res) => {
    const { id } = req.params;
    const { isbn, title, author, genre, description, department, availability, published_year } = req.body;

    const coverPath = req.files['cover']?.[0]?.filename;
    const contentPath = req.files['content']?.[0]?.filename;

    // Step 1: Fetch existing book first
    const selectSql = `SELECT * FROM books WHERE id = ?`;
    db.query(selectSql, [id], (selectErr, selectResults) => {
      if (selectErr) return res.status(500).json({ success: false, message: 'Failed to fetch book', error: selectErr });
      if (selectResults.length === 0) return res.status(404).json({ success: false, message: 'Book not found' });

      const existingBook = selectResults[0];
      const existingCover = existingBook.cover;
      const existingContent = existingBook.content;

      // Step 2: Prepare update SQL
      const fields = [];
      const values = [];

      if (isbn) { fields.push('isbn = ?'); values.push(isbn); }
      if (title) { fields.push('title = ?'); values.push(title); }
      if (author) { fields.push('author = ?'); values.push(author); }
      if (genre) { fields.push('genre = ?'); values.push(genre); }
      if (description) { fields.push('description = ?'); values.push(description); }
      if (department) { fields.push('department = ?'); values.push(department); }
      if (availability) { fields.push('availability = ?'); values.push(availability); }
      if (published_year) { fields.push('published_year = ?'); values.push(published_year); }
      if (coverPath) { fields.push('cover = ?'); values.push(coverPath); }
      if (contentPath) { fields.push('content = ?'); values.push(contentPath); }

      if (fields.length === 0) {
        return res.status(400).json({ success: false, message: 'No fields to update.' });
      }

      const updateSql = `UPDATE books SET ${fields.join(', ')} WHERE id = ?`;
      values.push(id);

      db.query(updateSql, values, (updateErr, updateResult) => {
        if (updateErr) return res.status(500).send(updateErr);

        const updatedBook = {
          id: parseInt(id),
          isbn: isbn || existingBook.isbn,
          title: title || existingBook.title,
          author: author || existingBook.author,
          genre: genre || existingBook.genre,
          description: description || existingBook.description,
          department: department || existingBook.department,
          availability: availability || existingBook.availability,
          published_year: published_year || existingBook.published_year,
          cover: coverPath || existingCover,
          content: contentPath || existingContent
        };

        io.emit('bookUpdated', updatedBook); // emit real-time update
        res.json({ success: true, message: 'Book updated successfully.', book: updatedBook });
      });
    });
  });


  // DELETE a book
  router.delete('/delete-book/:id', (req, res) => {
    const { id } = req.params;

    const sql = 'DELETE FROM books WHERE id = ?';
    db.query(sql, [id], (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.affectedRows > 0) {
        io.emit('bookDeleted', { id });
        res.json({ message: 'Book deleted successfully.' });
      } else {
        res.status(404).json({ message: 'Book not found.' });
      }
    });
  });



  router.put('/:id/availability', (req, res) => {
    const { id } = req.params;
    const { availability } = req.body;

    const sql = 'UPDATE books SET availability = ? WHERE id = ?';
    db.query(sql, [availability, id], (err, result) => {
      if (err) return res.status(500).send(err);

      if (result.affectedRows > 0) {
        // Broadcast update via socket
        io.emit('bookAvailabilityUpdated', { bookId: id, availability });
        res.json({ success: true });
      } else {
        res.status(404).json({ success: false, message: 'Book not found' });
      }
    });
  });

  


  return router;
};
