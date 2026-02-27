const express = require('express');
const http = require('http');
const socketIo = require('socket.io');
const cors = require('cors');
const mysql = require('mysql2');
const jwt = require('jsonwebtoken');

// Import routes
const registerRoutes = require('./routes/auth/register');
const loginRoutes = require('./routes/auth/login');
const dashboardRoutes = require('./routes/dashboard/dashboard');
const statusRoutes = require('./routes/auth/user');
const booksRoutes = require('./routes/books/book');
const readRoutes = require('./routes/books/read');
const userRoutes = require('./routes/users/user');
const settingsRoutes = require('./routes/settings/setting');

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'http://localhost:5173'
];

const io = require('socket.io')(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  }
});

const JWT_SECRET = 'balls'; // In production, put this in .env

app.use(cors());
app.use(express.json());

// DB connection
const db = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'library'
});

db.connect((err) => {
  if (err) throw err;
  console.log('Connected to MySQL DB');
});

// Use routes
app.use('/api/login', loginRoutes(db)); // <-- pass db connection
app.use('/api/user', statusRoutes(db));
app.use('/api/register', registerRoutes(db));
app.use('/api/dashboard', dashboardRoutes(db));
app.use('/api/books', booksRoutes(db, io));
app.use('/api/books', readRoutes(db));
app.use('/api/users', userRoutes(db));
app.use('/api/settings', settingsRoutes(db));
app.use('/covers', express.static('uploads/covers'));
app.use('/contents', express.static('uploads/contents'));


// WebSocket
io.use((socket, next) => {
  const token = socket.handshake.auth.token;
  if (!token) return next(new Error('Authentication error'));

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    socket.user = decoded;

    // Calculate remaining time and emit expiration
    const expiresIn = decoded.exp * 1000 - Date.now();
    if (expiresIn > 0) {
      setTimeout(() => {
        socket.emit('tokenExpired');
        socket.disconnect(); // optional
      }, expiresIn);
    }

    next();
  } catch (err) {
    return next(new Error('Invalid token'));
  }
});

server.listen(3000, () => console.log('Server running on port 3000'));
