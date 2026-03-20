import axios from "axios";

const API_URL = import.meta.env.VITE_API_URL;

export const startRead = async (book) => {
  try {
    const token = localStorage.getItem("token");
    const res = await axios.post(
      `${API_URL}/api/books/start-read`,
      { book_id: book.id },
      { headers: { Authorization: `Bearer ${token}` } },
    );
    return res.data.sessionId;
  } catch (err) {
    console.error("Failed to start reading session:", err);
    alert("Could not start session.");
    return null;
  }
};

export const endRead = async (sessionId) => {
  if (!sessionId) return;
  try {
    const token = localStorage.getItem("token");
    await axios.post(
      `${API_URL}/api/books/end-read`,
      { session_id: sessionId },
      { headers: { Authorization: `Bearer ${token}` } },
    );
  } catch (err) {
    console.error("Failed to end reading session:", err);
  }
};
