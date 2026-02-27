const express = require('express');
const http = require('http');
const socketIO = require('socket.io');
const cors = require('cors');
const booksRoute = require('./routes/books');
const db = require('./db'); // assuming this is your db connection

const app = express();
const server = http.createServer(app);
const io = socketIO(server, {
  cors: {
    origin: 'http://localhost:5173', // or your frontend origin
    methods: ['GET', 'POST'],
  },
});

app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));
app.use('/api/books', booksRoute(db, io)); // <-- pass io here

// Socket connection
io.on('connection', (socket) => {
  console.log('Client connected:', socket.id);
});

server.listen(3000, () => {
  console.log('Server running on http://localhost:3000');
});
