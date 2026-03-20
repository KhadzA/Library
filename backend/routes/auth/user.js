const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

module.exports = (db) => {
  const authenticateToken = (req, res, next) => {
    const authHeader = req.headers["authorization"];
    const token = authHeader?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    jwt.verify(token, process.env.JWT_SECRET, (err, user) => {
      if (err)
        return res.status(403).json({ message: "Token invalid or expired" });
      req.user = user;
      next();
    });
  };

  router.post("/active-status", authenticateToken, async (req, res) => {
    const { error } = await db
      .from("users")
      .update({ status: "active" })
      .eq("id", req.user.id);

    if (error) return res.status(500).send("Database error");
    res.json({ success: true, message: "Status updated!" });
  });

  router.post("/inactive-status", authenticateToken, async (req, res) => {
    const { error } = await db
      .from("users")
      .update({ status: "inactive" })
      .eq("id", req.user.id);

    if (error) return res.status(500).send("Database error");
    res.json({ success: true, message: "Status updated!" });
  });

  return router;
};
