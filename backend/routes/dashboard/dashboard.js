const express = require("express");
const jwt = require("jsonwebtoken");
const router = express.Router();

module.exports = (db) => {
  const authenticateAdmin = (req, res, next) => {
    const token = req.headers.authorization?.split(" ")[1];
    if (!token) return res.status(401).json({ message: "No token provided" });

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      if (decoded.role !== "admin" && decoded.role !== "librarian") {
        return res.status(403).json({ message: "Only admins can access this" });
      }
      req.user = decoded;
      next();
    } catch (err) {
      return res.status(401).json({ message: "Invalid token" });
    }
  };

  // BOOKS ADDED PER MONTH
  router.get(
    "/analytics/books-per-month",
    authenticateAdmin,
    async (req, res) => {
      const { data, error } = await db.rpc("get_books_per_month");
      if (error) return res.status(500).json({ error });
      res.json(data);
    },
  );

  // USER STATS
  router.get("/stats/users", authenticateAdmin, async (req, res) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    try {
      const [total, active, inactive, suspended, newThisMonth, byRole] =
        await Promise.all([
          db.from("users").select("*", { count: "exact", head: true }),
          db
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("status", "active"),
          db
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("status", "inactive"),
          db
            .from("users")
            .select("*", { count: "exact", head: true })
            .eq("status", "suspended"),
          db
            .from("users")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth.toISOString()),
          db.rpc("get_users_by_role"),
        ]);

      res.json({
        total: total.count,
        active: active.count,
        inactive: inactive.count,
        suspended: suspended.count,
        newThisMonth: newThisMonth.count,
        byRole: byRole.data,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // TOP READERS
  router.get("/stats/top-reader", authenticateAdmin, async (req, res) => {
    const { data, error } = await db.rpc("get_top_readers", {
      reader_limit: 3,
    });
    if (error) return res.status(500).json({ error });
    res.json(data || []);
  });

  // BOOK STATS
  router.get("/stats/books", authenticateAdmin, async (req, res) => {
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    try {
      const [total, available, borrowed, newThisMonth, byGenre, topGenre] =
        await Promise.all([
          db.from("books").select("*", { count: "exact", head: true }),
          db
            .from("books")
            .select("*", { count: "exact", head: true })
            .eq("availability", "available"),
          db
            .from("books")
            .select("*", { count: "exact", head: true })
            .eq("availability", "borrowed"),
          db
            .from("books")
            .select("*", { count: "exact", head: true })
            .gte("created_at", startOfMonth.toISOString()),
          db.rpc("get_books_by_genre"),
          db.rpc("get_top_genre"),
        ]);

      res.json({
        total: total.count,
        available: available.count,
        borrowed: borrowed.count,
        newThisMonth: newThisMonth.count,
        byGenre: byGenre.data,
        topGenre: topGenre.data?.[0] || null,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // READING STATS
  router.get("/stats/reading", authenticateAdmin, async (req, res) => {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);

    try {
      const [
        totalDuration,
        todayDuration,
        activeSessions,
        topReaders,
        mostReadBooks,
      ] = await Promise.all([
        db.from("reading_sessions").select("duration_minutes"),
        db
          .from("reading_sessions")
          .select("duration_minutes")
          .gte("start_time", startOfToday.toISOString()),
        db
          .from("reading_sessions")
          .select("*", { count: "exact", head: true })
          .is("end_time", null),
        db.rpc("get_top_readers", { reader_limit: 5 }),
        db.rpc("get_most_read_books"),
      ]);

      const totalTime =
        totalDuration.data?.reduce(
          (sum, r) => sum + (r.duration_minutes || 0),
          0,
        ) || 0;
      const todayTime =
        todayDuration.data?.reduce(
          (sum, r) => sum + (r.duration_minutes || 0),
          0,
        ) || 0;

      res.json({
        totalTime,
        todayTime,
        activeSessions: activeSessions.count,
        topReaders: topReaders.data,
        mostReadBooks: mostReadBooks.data,
      });
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  // RECENT ACTIVITY
  router.get("/recent-activity", authenticateAdmin, async (req, res) => {
    try {
      const [recentUsers, recentBooks, recentSessions] = await Promise.all([
        db
          .from("users")
          .select("id, name, role, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        db
          .from("books")
          .select("id, title, author, created_at")
          .order("created_at", { ascending: false })
          .limit(5),
        db
          .from("reading_sessions")
          .select("id, start_time, users(name), books(title)")
          .order("start_time", { ascending: false })
          .limit(5),
      ]);

      const userActivities = (recentUsers.data || []).map((u) => ({
        type: "user_created",
        details: { name: u.name, role: u.role },
        timestamp: u.created_at,
      }));

      const bookActivities = (recentBooks.data || []).map((b) => ({
        type: "book_added",
        details: { title: b.title, author: b.author },
        timestamp: b.created_at,
      }));

      const sessionActivities = (recentSessions.data || []).map((s) => ({
        type: "book_read",
        details: { userName: s.users?.name, bookTitle: s.books?.title },
        timestamp: s.start_time,
      }));

      const allActivities = [
        ...userActivities,
        ...bookActivities,
        ...sessionActivities,
      ].sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));

      res.json(allActivities);
    } catch (err) {
      res.status(500).json({ error: err.message });
    }
  });

  return router;
};
