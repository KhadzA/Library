const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = "balls";

module.exports = (db) => {
  const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  // GET profile
  router.get("/profile", authenticate, (req, res) => {
    const sql =
      "SELECT id, name, email, department, role FROM users WHERE id = ?";
    db.query(sql, [req.user.id], (err, results) => {
      if (err) return res.status(500).json({ message: "Server error" });
      if (results.length === 0)
        return res.status(404).json({ message: "User not found" });
      res.json(results[0]);
    });
  });

  // PUT update profile
  router.put("/profile", authenticate, (req, res) => {
    const { name, email, department } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "Name and email are required" });

    // Check if email is taken by another user
    db.query(
      "SELECT id FROM users WHERE email = ? AND id != ?",
      [email, req.user.id],
      (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (results.length > 0)
          return res.status(409).json({ message: "Email already in use" });

        db.query(
          "UPDATE users SET name = ?, email = ?, department = ? WHERE id = ?",
          [name, email, department, req.user.id],
          (err) => {
            if (err) return res.status(500).json({ message: "Server error" });
            res.json({ message: "Profile updated successfully" });
          },
        );
      },
    );
  });

  // PUT change password
  router.put("/password", authenticate, (req, res) => {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "All fields required" });
    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    db.query(
      "SELECT password FROM users WHERE id = ?",
      [req.user.id],
      async (err, results) => {
        if (err) return res.status(500).json({ message: "Server error" });
        if (results.length === 0)
          return res.status(404).json({ message: "User not found" });

        const match = await bcrypt.compare(
          currentPassword,
          results[0].password,
        );
        if (!match)
          return res
            .status(401)
            .json({ message: "Current password is incorrect" });

        const hashed = await bcrypt.hash(newPassword, 10);
        db.query(
          "UPDATE users SET password = ? WHERE id = ?",
          [hashed, req.user.id],
          (err) => {
            if (err) return res.status(500).json({ message: "Server error" });
            res.json({ message: "Password updated successfully" });
          },
        );
      },
    );
  });

  return router;
};
