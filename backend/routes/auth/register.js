const express = require("express");
const bcrypt = require("bcrypt");
const validator = require("validator");
const router = express.Router();

module.exports = (db) => {
  router.post("/", async (req, res) => {
    const { email, username, department, password } = req.body;

    if (!validator.isEmail(email)) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid email format" });
    }

    if (!password || password.length < 6) {
      return res.status(400).json({
        success: false,
        message: "Password must be at least 6 characters long",
      });
    }

    try {
      // Check if email already exists
      const { data: existing, error: findError } = await db
        .from("users")
        .select("id")
        .eq("email", email);

      if (findError)
        return res
          .status(500)
          .json({ success: false, message: "Server error" });

      if (existing && existing.length > 0) {
        return res
          .status(400)
          .json({ success: false, message: "Email already in use" });
      }

      const hashedPassword = await bcrypt.hash(password, 10);

      // Insert the new user
      const { data: insertResult, error: insertError } = await db
        .from("users")
        .insert([
          { email, name: username, department, password: hashedPassword },
        ])
        .select("id")
        .single();

      if (insertError)
        return res
          .status(500)
          .json({ success: false, message: "Insert failed" });

      res.json({ success: true, id: insertResult.id });
    } catch (error) {
      console.error("Registration failed:", error);
      res.status(500).send("Internal server error");
    }
  });

  return router;
};
