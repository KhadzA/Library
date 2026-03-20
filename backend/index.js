const express = require("express");
const http = require("http");
const jwt = require("jsonwebtoken");
const cors = require("cors");

// Import routes
const registerRoutes = require("./routes/auth/register");
const loginRoutes = require("./routes/auth/login");
const dashboardRoutes = require("./routes/dashboard/dashboard");
const statusRoutes = require("./routes/auth/user");
const booksRoutes = require("./routes/books/book");
const readRoutes = require("./routes/books/read");
const userRoutes = require("./routes/users/user");
const settingsRoutes = require("./routes/settings/setting");

const db = require("./db"); // Supabase client

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  "http://localhost:5173", // local dev
  process.env.FRONTEND_URL, // your Vercel URL e.g. https://your-app.vercel.app
];

const io = require("socket.io")(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
});

app.use(cors({ origin: allowedOrigins }));
app.use(express.json());

// Use routes
app.use("/api/login", loginRoutes(db));
app.use("/api/user", statusRoutes(db));
app.use("/api/register", registerRoutes(db));
app.use("/api/dashboard", dashboardRoutes(db));
app.use("/api/books", booksRoutes(db, io));
app.use("/api/books", readRoutes(db));
app.use("/api/users", userRoutes(db));
app.use("/api/settings", settingsRoutes(db));

// WebSocket auth middleware
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error("Authentication error"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded;

    // Emit token expiration to client
    const expiresIn = decoded.exp * 1000 - Date.now();
    if (expiresIn > 0) {
      setTimeout(() => {
        socket.emit("tokenExpired");
        socket.disconnect();
      }, expiresIn);
    }

    next();
  } catch (err) {
    return next(new Error("Invalid token"));
  }
});

io.on("connection", (socket) => {
  console.log("Client connected:", socket.id);
});

const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
