import socket from './socket.js';
import axios from 'axios';

socket.on('connect', () => {
  console.log('Connected to WebSocket server');
});

socket.on('new-book-notify', (book) => {
  alert(`New book uploaded: ${book.title}`);
});

document.getElementById('sendBtn').addEventListener('click', async () => {
  const title = document.getElementById('bookTitle').value;
  const author = document.getElementById('bookAuthor').value;
  const genre = document.getElementById('bookGenre').value;

  if (!title || !author || !genre) {
    alert('Please fill in all fields');
    return;
  }

  const newBook = { title, author, genre };

  try {
    // Send to backend via REST API (to insert into MySQL)
    await axios.post('http://localhost:3000/api/books', newBook);

    // Emit through WebSocket to notify others
    socket.emit('new-book', newBook);

    alert('Book added successfully!');
  } catch (err) {
    console.error(err);
    alert('Error adding book.');
  }
});
