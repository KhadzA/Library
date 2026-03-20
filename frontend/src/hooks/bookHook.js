import { useEffect, useState } from "react";
import { viewBook } from "../api/book";
import socket, { connectSocket } from "../socket";

export const useBookConnection = () => {
  const [books, setBooks] = useState([]);

  useEffect(() => {
    connectSocket();

    const fetchBooks = async () => {
      const res = await viewBook();
      if (res?.success) {
        setBooks(res.data.books); // .books because the API returns { books, total, page, limit }
      } else {
        console.error("Failed to fetch books");
      }
    };

    fetchBooks();

    socket.on("bookAdded", (newBook) => {
      setBooks((prev) => [...prev, newBook]);
    });

    socket.on("bookUpdated", (updatedBook) => {
      setBooks((prev) =>
        prev.map((book) => (book.id === updatedBook.id ? updatedBook : book)),
      );
    });

    socket.on("bookDeleted", ({ id }) => {
      // id comes as { id } object from io.emit("bookDeleted", { id })
      setBooks((prev) => prev.filter((book) => book.id !== parseInt(id)));
    });

    socket.on("bookAvailabilityUpdated", ({ bookId, availability }) => {
      setBooks((prev) =>
        prev.map((book) =>
          book.id === parseInt(bookId) ? { ...book, availability } : book,
        ),
      );
    });

    return () => {
      socket.off("bookAdded");
      socket.off("bookUpdated");
      socket.off("bookDeleted");
      socket.off("bookAvailabilityUpdated");
    };
  }, []);

  return books;
};
