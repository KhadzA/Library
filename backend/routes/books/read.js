const express = require('express');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'balls'; // Use .env in production

module.exports = (db) => {
  // Middleware to verify token and attach user
  const authenticate = (req, res, next) => {
    const token = req.headers.authorization?.split(' ')[1];
    if (!token) return res.status(401).json({ message: 'No token provided' });

    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: 'Invalid token' });
    }
  };

  // Start reading
router.post('/start-read', authenticate, (req, res) => {
  const { book_id } = req.body;
  const user_id = req.user.id;
  const now = new Date();

  // Find latest session for this user + book
  const sql = `
    SELECT id, start_time, end_time
    FROM reading_sessions
    WHERE user_id = ? AND book_id = ?
    ORDER BY start_time DESC
    LIMIT 1
  `;

  db.query(sql, [user_id, book_id], (err, results) => {
    if (err) return res.status(500).json({ message: 'DB error', error: err });

    if (results.length > 0) {
      const session = results[0];
      const sessionStart = new Date(session.start_time);
      const sessionEnd = session.end_time ? new Date(session.end_time) : null;

      // If session is active (end_time is null)
      if (!sessionEnd) {
        const diff = (now - sessionStart) / (1000 * 60); // in minutes
        if (diff <= 300) {
          return res.json({ message: 'Resuming active session', sessionId: session.id });
        }
      }

      // If session is ended, but ended less than 5 hours ago, stack it
      if (sessionEnd) {
        const diff = (now - sessionEnd) / (1000 * 60);
        if (diff <= 300) {
          // Reopen the session
          const updateSql = `
            UPDATE reading_sessions
            SET end_time = NULL
            WHERE id = ?
          `;

          db.query(updateSql, [session.id], (updateErr) => {
            if (updateErr) return res.status(500).json({ message: 'Failed to reopen session', error: updateErr });

            return res.json({ message: 'Reopened previous session', sessionId: session.id });
          });

          return; // prevent falling through
        }
      }
    }

    // No stackable session found — create new
    const insertSql = `
      INSERT INTO reading_sessions (user_id, book_id, start_time)
      VALUES (?, ?, ?)
    `;
    db.query(insertSql, [user_id, book_id, now], (insertErr, insertResult) => {
      if (insertErr) return res.status(500).json({ message: 'Insert failed', error: insertErr });

      res.json({
        message: 'New session started',
        sessionId: insertResult.insertId
      });
    });
  });
});



  // End reading
  router.post('/end-read', authenticate, (req, res) => {
    const { session_id } = req.body;
    const end_time = new Date();

    // Fetch session to calculate duration
    const selectSql = `SELECT start_time FROM reading_sessions WHERE id = ? AND end_time IS NULL`;

    db.query(selectSql, [session_id], (err, results) => {
      if (err) return res.status(500).json({ message: 'Error fetching session', error: err });
      if (results.length === 0) return res.status(404).json({ message: 'Session not found or already ended' });

      const start_time = new Date(results[0].start_time);
      const duration_minutes = Math.round((end_time - start_time) / 60000); // ms to minutes

      const updateSql = `
        UPDATE reading_sessions
        SET end_time = ?, duration_minutes = ?
        WHERE id = ?
      `;

      db.query(updateSql, [end_time, duration_minutes, session_id], (updateErr) => {
        if (updateErr) return res.status(500).json({ message: 'Failed to end session', error: updateErr });

        res.json({ message: 'Reading session ended', duration_minutes });
      });
    });
  });

  return router;
};
