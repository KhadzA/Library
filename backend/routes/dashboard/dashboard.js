const express = require('express');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const router = express.Router();

const JWT_SECRET = 'balls'; // Use .env in production

module.exports = (db) => {
    // Optional: Middleware to protect routes
    const authenticateAdmin = (req, res, next) => {
        const token = req.headers.authorization?.split(' ')[1];
        if (!token) return res.status(401).json({ message: 'No token provided' });

        try {
        const decoded = jwt.verify(token, JWT_SECRET);
        if (decoded.role !== 'admin' && decoded.role !== 'librarian') {
            return res.status(403).json({ message: 'Only admins can add users' });
        }
        req.user = decoded;
        next();
        } catch (err) {
        return res.status(401).json({ message: 'Invalid token' });
        }
    };
    
  // BOOKS ADDED PER MONTH ANALYTICS
  router.get('/analytics/books-per-month', authenticateAdmin, (req, res) => {
    const sql = `
      SELECT DATE_FORMAT(created_at, '%Y-%m') AS month, COUNT(*) AS count
      FROM books
      GROUP BY month
      ORDER BY month
    `;
    db.query(sql, (err, results) => {
      if (err) return res.status(500).json({ error: err });
      res.json(results);
    });
  });

    // USERS STATS
    router.get('/stats/users', authenticateAdmin, (req, res) => { 
        const totalUsers = 'SELECT COUNT(*) AS total FROM users';
        const activeUsers = "SELECT COUNT(*) AS active FROM users WHERE status = 'active'";
        const inactiveUsers = "SELECT COUNT(*) AS active FROM users WHERE status = 'inactive'";
        const suspendedUsers = "SELECT COUNT(*) AS suspended FROM users WHERE status = 'suspended'";
        const newUsers = `SELECT COUNT(*) AS newThisMonth FROM users WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`;
        const usersByRole = `SELECT role, COUNT(*) AS count FROM users GROUP BY role`;

        let stats = {};
        db.query(totalUsers, (err, totalRes) => {
          if (err) return res.status(500).json({ error: err });
          stats.total = totalRes[0].total;
          db.query(activeUsers, (err, activeRes) => {
            if (err) return res.status(500).json({ error: err });
            stats.active = activeRes[0].active;
            db.query(inactiveUsers, (err, inactiveRes) => {
              if (err) return res.status(500).json({ error: err });
              stats.inactive = inactiveRes[0].inactive;
              db.query(suspendedUsers, (err, suspendedRes) => {
                if (err) return res.status(500).json({ error: err });
                stats.suspended = suspendedRes[0].suspended;
                db.query(newUsers, (err, newRes) => {
                  if (err) return res.status(500).json({ error: err });
                  stats.newThisMonth = newRes[0].newThisMonth;
                  db.query(usersByRole, (err, roleRes) => {
                    if (err) return res.status(500).json({ error: err });
                    stats.byRole = roleRes;
                    res.json(stats);
                  });
                });
              });
            });
          });
        });
    });
  
  // TOP READERS (top 3 users with most reading time)
  router.get('/stats/top-reader', authenticateAdmin, (req, res) => {
    const topUserQuery = `
      SELECT u.id, u.name, SUM(r.duration_minutes) AS totalMinutes
      FROM reading_sessions r
      JOIN users u ON r.user_id = u.id
      GROUP BY r.user_id
      ORDER BY totalMinutes DESC
      LIMIT 3
    `;
    db.query(topUserQuery, (err, result) => {
      if (err) return res.status(500).json({ error: err });
      res.json(result || []);
    });
  });

  // BOOKS STATS
  router.get('/stats/books', authenticateAdmin, (req, res) =>  {
      const totalBooks = 'SELECT COUNT(*) AS total FROM books';
      const availableBooks = "SELECT COUNT(*) AS available FROM books WHERE availability = 'available'";
      const borrowedBooks = "SELECT COUNT(*) AS borrowed FROM books WHERE availability = 'borrowed'";
      const newBooks = `SELECT COUNT(*) AS newThisMonth FROM books WHERE MONTH(created_at) = MONTH(CURDATE()) AND YEAR(created_at) = YEAR(CURDATE())`;
      const booksByGenre = `SELECT genre, COUNT(*) AS count FROM books GROUP BY genre`;
      // Top genre by total reading time and unique users
      const topGenre = `
        SELECT b.genre, 
               SUM(r.duration_minutes) AS totalMinutes,
               COUNT(DISTINCT r.user_id) AS userCount
        FROM reading_sessions r
        JOIN books b ON r.book_id = b.id
        GROUP BY b.genre
        ORDER BY totalMinutes DESC
        LIMIT 1
      `;

      let stats = {};
      db.query(totalBooks, (err, totalRes) => {
          if (err) return res.status(500).json({ error: err });
          stats.total = totalRes[0].total;
          db.query(availableBooks, (err, availableRes) => {
              if (err) return res.status(500).json({ error: err });
              stats.available = availableRes[0].available;
              db.query(borrowedBooks, (err, borrowedRes) => {
                  if (err) return res.status(500).json({ error: err });
                  stats.borrowed = borrowedRes[0].borrowed;
                  db.query(newBooks, (err, newRes) => {
                      if (err) return res.status(500).json({ error: err });
                      stats.newThisMonth = newRes[0].newThisMonth;
                      db.query(booksByGenre, (err, genreRes) => {
                          if (err) return res.status(500).json({ error: err });
                          stats.byGenre = genreRes;
                          db.query(topGenre, (err, topGenreRes) => {
                              if (err) return res.status(500).json({ error: err });
                              // topGenreRes[0] will have: genre, totalMinutes, userCount
                              stats.topGenre = topGenreRes[0] || null;
                              res.json(stats);
                          });
                      });
                  });
              });
          });
      });
  });

  // READING STATS
  router.get('/stats/reading', authenticateAdmin, (req, res) => {
    const totalDuration = 'SELECT SUM(duration_minutes) AS totalTime FROM reading_sessions';
    const todayDuration = 'SELECT SUM(duration_minutes) AS todayTime FROM reading_sessions WHERE DATE(start_time) = CURDATE()';
    const activeSessions = 'SELECT COUNT(*) AS activeSessions FROM reading_sessions WHERE end_time IS NULL';
    const topReaders = `SELECT u.name, SUM(r.duration_minutes) AS totalMinutes FROM reading_sessions r JOIN users u ON r.user_id = u.id GROUP BY r.user_id ORDER BY totalMinutes DESC LIMIT 5`;
    const mostReadBooks = `SELECT b.title, COUNT(*) AS readCount FROM reading_sessions r JOIN books b ON r.book_id = b.id GROUP BY r.book_id ORDER BY readCount DESC LIMIT 5`;

    let stats = {};
    db.query(totalDuration, (err, totalRes) => {
        if (err) return res.status(500).json({ error: err });
        stats.totalTime = totalRes[0].totalTime || 0;
        db.query(todayDuration, (err, todayRes) => {
            if (err) return res.status(500).json({ error: err });
            // todayTime is total minutes read today
            stats.todayTime = todayRes[0].todayTime || 0;
            db.query(activeSessions, (err, activeRes) => {
                if (err) return res.status(500).json({ error: err });
                stats.activeSessions = activeRes[0].activeSessions;
                db.query(topReaders, (err, topRes) => {
                    if (err) return res.status(500).json({ error: err });
                    stats.topReaders = topRes;
                    db.query(mostReadBooks, (err, booksRes) => {
                        if (err) return res.status(500).json({ error: err });
                        stats.mostReadBooks = booksRes;
                        res.json(stats);
                    });
                });
            });
        });
    });
  });

  // RECENT ACTIVITY (unified array for frontend)
  router.get('/recent-activity', authenticateAdmin, (req, res) => {
    const recentUsers = 'SELECT id, name, role, created_at FROM users ORDER BY created_at DESC LIMIT 5';
    const recentBooks = 'SELECT id, title, author, created_at FROM books ORDER BY created_at DESC LIMIT 5';
    const recentSessions = `
      SELECT r.id, u.name AS user_name, b.title AS book_title, r.start_time
      FROM reading_sessions r
      JOIN users u ON r.user_id = u.id
      JOIN books b ON r.book_id = b.id
      ORDER BY r.start_time DESC
      LIMIT 5
    `;

    Promise.all([
      new Promise((resolve, reject) => {
        db.query(recentUsers, (err, usersRes) => {
          if (err) return reject(err);
          // Map to activity objects
          const userActivities = usersRes.map(u => ({
            type: 'user_created',
            details: { name: u.name, role: u.role },
            timestamp: u.created_at
          }));
          resolve(userActivities);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(recentBooks, (err, booksRes) => {
          if (err) return reject(err);
          const bookActivities = booksRes.map(b => ({
            type: 'book_added',
            details: { title: b.title, author: b.author },
            timestamp: b.created_at
          }));
          resolve(bookActivities);
        });
      }),
      new Promise((resolve, reject) => {
        db.query(recentSessions, (err, sessionsRes) => {
          if (err) return reject(err);
          const sessionActivities = sessionsRes.map(s => ({
            type: 'book_read',
            details: { userName: s.user_name, bookTitle: s.book_title },
            timestamp: s.start_time
          }));
          resolve(sessionActivities);
        });
      })
    ]).then(([userActs, bookActs, sessionActs]) => {
      // Merge and sort by timestamp descending
      const allActivities = [...userActs, ...bookActs, ...sessionActs].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
      res.json(allActivities);
    }).catch(err => {
      res.status(500).json({ error: err });
    });
  });

  return router;
};
