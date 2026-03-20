const express = require("express");
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

  // Start reading
  router.post("/start-read", authenticate, async (req, res) => {
    const { book_id } = req.body;
    const user_id = req.user.id;
    const now = new Date();

    // Find latest session for this user + book
    const { data: results, error } = await db
      .from("reading_sessions")
      .select("id, start_time, end_time")
      .eq("user_id", user_id)
      .eq("book_id", book_id)
      .order("start_time", { ascending: false })
      .limit(1);

    if (error) return res.status(500).json({ message: "DB error", error });

    if (results && results.length > 0) {
      const session = results[0];
      const sessionStart = new Date(session.start_time);
      const sessionEnd = session.end_time ? new Date(session.end_time) : null;

      // Active session still open
      if (!sessionEnd) {
        const diff = (now - sessionStart) / (1000 * 60);
        if (diff <= 300) {
          return res.json({
            message: "Resuming active session",
            sessionId: session.id,
          });
        }
      }

      // Closed session within 5 hours — reopen it
      if (sessionEnd) {
        const diff = (now - sessionEnd) / (1000 * 60);
        if (diff <= 300) {
          const { error: updateError } = await db
            .from("reading_sessions")
            .update({ end_time: null })
            .eq("id", session.id);

          if (updateError)
            return res.status(500).json({
              message: "Failed to reopen session",
              error: updateError,
            });
          return res.json({
            message: "Reopened previous session",
            sessionId: session.id,
          });
        }
      }
    }

    // Create new session
    const { data: newSession, error: insertError } = await db
      .from("reading_sessions")
      .insert([{ user_id, book_id, start_time: now }])
      .select("id")
      .single();

    if (insertError)
      return res
        .status(500)
        .json({ message: "Insert failed", error: insertError });

    res.json({ message: "New session started", sessionId: newSession.id });
  });

  // End reading
  router.post("/end-read", authenticate, async (req, res) => {
    const { session_id } = req.body;
    const end_time = new Date();

    const { data: results, error } = await db
      .from("reading_sessions")
      .select("start_time")
      .eq("id", session_id)
      .is("end_time", null)
      .single();

    if (error || !results)
      return res
        .status(404)
        .json({ message: "Session not found or already ended" });

    const duration_minutes = Math.round(
      (end_time - new Date(results.start_time)) / 60000,
    );

    const { error: updateError } = await db
      .from("reading_sessions")
      .update({ end_time, duration_minutes })
      .eq("id", session_id);

    if (updateError)
      return res
        .status(500)
        .json({ message: "Failed to end session", error: updateError });

    res.json({ message: "Reading session ended", duration_minutes });
  });

  return router;
};
