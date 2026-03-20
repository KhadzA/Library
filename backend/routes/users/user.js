const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

module.exports = (db) => {
  const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin") {
        return res.status(403).json({ message: "Only admins can do this" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  // GET all users — paginated + searchable
  router.get("/all", async (req, res) => {
    const limit = parseInt(req.query.limit) || 10;
    const page = parseInt(req.query.page) || 1;
    const search = req.query.search || "";
    const offset = (page - 1) * limit;

    const { data: users, error } = await db
      .from("users")
      .select("*")
      .or(
        `name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`,
      )
      .order("created_at", { ascending: false })
      .range(offset, offset + limit - 1);

    if (error) return res.status(500).json({ message: "DB error", error });

    const { count, error: countError } = await db
      .from("users")
      .select("*", { count: "exact", head: true })
      .or(
        `name.ilike.%${search}%,email.ilike.%${search}%,department.ilike.%${search}%`,
      );

    if (countError)
      return res.status(500).json({ message: "DB error", error: countError });

    res.json({ users, total: count, page, limit });
  });

  // POST add user manually (admin only)
  router.post("/add", authenticateAdmin, async (req, res) => {
    const { email, name, department, password, role, status } = req.body;

    if (!email || !name || !department || !password || !role) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    try {
      const hashedPassword = await bcrypt.hash(password, 10);

      const { data, error } = await db
        .from("users")
        .insert([
          {
            email,
            name,
            department,
            password: hashedPassword,
            role,
            status: status || "inactive",
          },
        ])
        .select("id")
        .single();

      if (error)
        return res.status(500).json({ message: "Failed to add user", error });

      res
        .status(201)
        .json({ message: "User added successfully", userId: data.id });
    } catch (err) {
      res.status(500).json({ message: "Server error", error: err });
    }
  });

  // PUT edit user
  router.put("/:id/edit", async (req, res) => {
    const { id } = req.params;
    const { email, name, department, password, role, status } = req.body;

    if (!email || !name || !department || !role || !status) {
      return res
        .status(400)
        .json({ success: false, message: "Missing required fields." });
    }

    try {
      const updates = { email, name, department, role, status };

      // Only hash and update password if a new one was actually provided
      if (password && password.trim() !== "") {
        updates.password = await bcrypt.hash(password, 10);
      }

      const { error, count } = await db
        .from("users")
        .update(updates)
        .eq("id", id);

      if (error) return res.status(500).json({ success: false, error });

      res.json({ success: true, message: "User updated successfully" });
    } catch (err) {
      res
        .status(500)
        .json({ success: false, message: "Server error", error: err });
    }
  });

  // DELETE user
  router.delete("/:id/delete", async (req, res) => {
    const { error, count } = await db
      .from("users")
      .delete({ count: "exact" })
      .eq("id", id);

    if (error) return res.status(500).json({ success: false, error });

    if (count > 0) {
      res.json({ success: true, message: "User deleted successfully" });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });

  // PUT toggle user status
  router.put("/:id/status", async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    const { error, count } = await db
      .from("users")
      .update({ status })
      .eq("id", id);

    if (error) return res.status(500).json({ success: false, error });

    if (count > 0) {
      res.json({ success: true });
    } else {
      res.status(404).json({ success: false, message: "User not found" });
    }
  });

  return router;
};
