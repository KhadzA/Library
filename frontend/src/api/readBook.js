import axios from 'axios';

export const startRead = async (book) => {
  try {
    const token = localStorage.getItem('token');
    const res = await axios.post(
      'http://localhost:3000/api/books/start-read',
      { book_id: book.id },
      { headers: { Authorization: `Bearer ${token}` } }
    );

    return res.data.sessionId; // Return session ID
  } catch (err) {
    console.error('Failed to start reading session:', err);
    alert('Could not start session.');
    return null;
  }
};

export const endRead = async (sessionId) => {
  if (sessionId) {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:3000/api/books/end-read',
        { session_id: sessionId },
        { headers: { Authorization: `Bearer ${token}` } }
      );
    } catch (err) {
      console.error('Failed to end reading session:', err);
    }
  }
};
