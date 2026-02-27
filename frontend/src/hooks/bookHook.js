import { useEffect, useState } from 'react';
import { viewBook } from '../api/book';
import socket, { connectSocket } from '../socket';

export const useBookConnection = () => {
    const [books, setBooks] = useState([]);

    useEffect(() => {
        connectSocket(); // ensure socket is connected

        const fetchBooks = async () => {
            const res = await viewBook();
            if (res?.success) {
                setBooks(res.data);
            } else {
                console.error('Failed to fetch books');
            }
        };

        fetchBooks(); // initial fetch

        // 🔁 Real-time event listeners
        socket.on('bookAdded', (newBook) => {
            setBooks((prevBooks) => [...prevBooks, newBook]);
        });

        socket.on('bookUpdated', (updatedBook) => {
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === updatedBook.id ? updatedBook : book
                )
            );
        });

        socket.on('bookDeleted', (bookId) => {
            setBooks((prevBooks) =>
                prevBooks.filter((book) => book.id !== bookId)
            );
        });

        // 👇 Add this for availability toggle
        socket.on('bookAvailabilityUpdated', ({ bookId, availability }) => {
            setBooks((prevBooks) =>
                prevBooks.map((book) =>
                    book.id === parseInt(bookId) ? { ...book, availability } : book
                )
            );
        });

        // 🧼 Cleanup listeners
        return () => {
            socket.off('bookAdded');
            socket.off('bookUpdated');
            socket.off('bookDeleted');
            socket.off('bookAvailabilityUpdated'); // cleanup added listener
        };
    }, []);

    return books;
};
