const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const router = express.Router();

module.exports = (db) => {
  const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });
    try {
      req.user = jwt.verify(token, process.env.JWT_SECRET);
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  // GET profile
  router.get("/profile", authenticate, async (req, res) => {
    const { data, error } = await db
      .from("users")
      .select("id, name, email, department, role")
      .eq("id", req.user.id)
      .single();

    if (error) return res.status(500).json({ message: "Server error" });
    if (!data) return res.status(404).json({ message: "User not found" });

    res.json(data);
  });

  // PUT update profile
  router.put("/profile", authenticate, async (req, res) => {
    const { name, email, department } = req.body;
    if (!name || !email)
      return res.status(400).json({ message: "Name and email are required" });

    // Check if email is taken by another user
    const { data: existing } = await db
      .from("users")
      .select("id")
      .eq("email", email)
      .neq("id", req.user.id);

    if (existing && existing.length > 0)
      return res.status(409).json({ message: "Email already in use" });

    const { error } = await db
      .from("users")
      .update({ name, email, department })
      .eq("id", req.user.id);

    if (error) return res.status(500).json({ message: "Server error" });

    res.json({ message: "Profile updated successfully" });
  });

  // PUT change password
  router.put("/password", authenticate, async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "All fields required" });
    if (newPassword.length < 8)
      return res
        .status(400)
        .json({ message: "Password must be at least 8 characters" });

    const { data, error } = await db
      .from("users")
      .select("password")
      .eq("id", req.user.id)
      .single();

    if (error) return res.status(500).json({ message: "Server error" });
    if (!data) return res.status(404).json({ message: "User not found" });

    const match = await bcrypt.compare(currentPassword, data.password);
    if (!match)
      return res.status(401).json({ message: "Current password is incorrect" });

    const hashed = await bcrypt.hash(newPassword, 10);

    const { error: updateError } = await db
      .from("users")
      .update({ password: hashed })
      .eq("id", req.user.id);

    if (updateError) return res.status(500).json({ message: "Server error" });

    res.json({ message: "Password updated successfully" });
  });

  // GET avatar color
  router.get("/avatar-color", authenticate, async (req, res) => {
    const { data, error } = await db
      .from("users")
      .select("avatar_color")
      .eq("id", req.user.id)
      .single();

    if (error) return res.status(500).json({ message: "Server error" });
    if (!data) return res.status(404).json({ message: "User not found" });

    res.json({ color: data.avatar_color || "#3b82f6" });
  });

  // PUT avatar color
  router.put("/avatar-color", authenticate, async (req, res) => {
    const { color } = req.body;
    if (!color) return res.status(400).json({ message: "Color is required" });

    const { error } = await db
      .from("users")
      .update({ avatar_color: color })
      .eq("id", req.user.id);

    if (error) return res.status(500).json({ message: "Server error" });

    res.json({ message: "Avatar color updated successfully" });
  });

  return router;
};
