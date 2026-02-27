const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

const JWT_SECRET = "balls"; // In production, put this in .env

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { username, password, rememberMe } = req.body;

    // Check if user exists
    const sql = "SELECT * FROM users WHERE name = ?";
    db.query(sql, [username], async (err, results) => {
      if (err) return res.status(500).json({ message: "Server error", err });
      if (results.length === 0)
        return res.status(401).json({ message: "User not found" });

      const user = results[0];
      console.log("Found user:", user); // <-- add this
      console.log("Input password:", password); // <-- add this
      console.log("Stored hash:", user.password); // <-- add this

      const match = await bcrypt.compare(password, user.password);
      console.log("Password match:", match); // <-- add this

      if (!match)
        return res.status(401).json({ message: "Incorrect password" });

      // Create JWT token
      const token = jwt.sign(
        {
          id: user.id,
          role: user.role,
          name: user.name,
          email: user.email,
        },
        JWT_SECRET,
        { expiresIn: rememberMe ? "30d" : "7d" }, // <-- dynamic expiration
      );

      // Return token to frontend
      res.json({ success: true, token });
    });
  });

  return router;
};
