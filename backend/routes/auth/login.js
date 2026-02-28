const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = "balls"; // In production, put this in .env

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { identifier, password, rememberMe } = req.body;

    // Check by name or email
    const sql = "SELECT * FROM users WHERE name = ? OR email = ?";
    db.query(sql, [identifier, identifier], async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error", err });
      if (results.length === 0)
        return res.status(401).json({ message: "User not found" });

      const user = results[0];

      const match = await bcrypt.compare(password, user.password);
      if (!match)
        return res.status(401).json({ message: "Incorrect password" });

      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: rememberMe ? "30d" : "7d" },
      );

      res.json({ success: true, token });
    });
  });

  return router;
};
