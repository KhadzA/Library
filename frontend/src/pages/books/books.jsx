"use client"
// import { useNavigate } from "react-router-dom"
import { useState, useEffect } from "react"
import { useSocketConnection } from "../../hooks/useSocketConnection"
// Remove the existing useBookConnection import since we're not using it for pagination 😢
// import { useBookConnection } from "../../hooks/bookHook"
import { viewBook, toggleAvailability } from "../../api/book"
import { startRead, endRead } from "../../api/readBook"
import BookToast, { useBookToast } from "../../components/books/bookToast"
import AddBookModal from "./addBookModal"
import ReadBookModal from "./readBookModal"
import EditBookModal from "./editBookModal"
import DeleteBookModal from "./deleteBookModal"
import InfoBookModal from "./infoBookModal"
import "./books.css"
import {
    BookOpen,
    Plus,
    Eye,
    Search,
    Filter,
    Grid,
    List,
    EllipsisVertical,
    Edit,
    Trash2,
    ChevronLeft,
    ChevronRight,
} from "lucide-react"

// Add socket import
import socket, { connectSocket } from "../../socket"

function Books() {
    //   const navigate = useNavigate()

    useSocketConnection()

    // Pagination state
    const [books, setBooks] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalBooks, setTotalBooks] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const [userRole, setUserRole] = useState(null)

    const [showAddForm, setShowAddForm] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterGenre, setFilterGenre] = useState("")
    const [viewMode, setViewMode] = useState("grid")
    const [openDropdown, setOpenDropdown] = useState(null)

    const { bookToast, toasts, removeToast } = useBookToast()

    const [selectedBook, setSelectedBook] = useState(null)
    const [showReadModal, setShowReadModal] = useState(false)
    const [showInfoModal, setShowInfoModal] = useState(false)
    const [sessionId, setSessionId] = useState(null)
    const [startTimer, setStartTimer] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    // Fetch books with pagination
    const fetchBooks = async (page = 1, searchTerm = "") => {
        setIsLoading(true);
        try {
            const result = await viewBook(page, 10, searchTerm);
            if (result.success) {
                const responseData = result.data;

                setBooks(responseData.books || []);
                setTotalPages(responseData.totalPages || Math.ceil((responseData.total || 0) / 10));
                setTotalBooks(responseData.total || 0);
                setCurrentPage(page);
            } else {
                bookToast.error("Error", "Failed to fetch books");
            }
        } catch (error) {
            console.error("Error fetching books:", error);
            bookToast.error("Error", "An error occurred while fetching books");
        }
        setIsLoading(false);

    };

    useEffect(() => {
        fetchBooks(currentPage, searchTerm);
    }, [currentPage, searchTerm]);

    // Socket neto sa olo 😢
    // In the Books component, replace the existing useEffect with this:
    useEffect(() => {
        const role = localStorage.getItem("userRole")
        setUserRole(role)

        // Connect socket for real-time updates
        connectSocket()

        // Initial fetch
        fetchBooks(1)

        // realtime event listeners for socket updates
        socket.on("bookAdded", (newBook) => {
            // Refresh current page to show new book
            fetchBooks(currentPage)
            bookToast.book("New Book Added", `"${newBook.title}" has been added to the library`)
        })

        socket.on("bookUpdated", (updatedBook) => {
            // Update the book in current page if it exists
            setBooks((prevBooks) => prevBooks.map((book) => (book.id === updatedBook.id ? updatedBook : book)))
            bookToast.success("Book Updated", `"${updatedBook.title}" has been updated`)
        })

        socket.on("bookDeleted", (bookId) => {
            // Remove book from current page and update total count
            setBooks((prevBooks) => {
                const filteredBooks = prevBooks.filter((book) => book.id !== Number.parseInt(bookId))

                // If current page becomes empty and we're not on page 1, go to previous page
                if (filteredBooks.length === 0 && currentPage > 1) {
                    fetchBooks(currentPage - 1)
                } else if (filteredBooks.length < prevBooks.length) {
                    // Update total count
                    setTotalBooks((prev) => prev - 1)
                    // Recalculate total pages
                    setTotalPages(Math.ceil((totalBooks - 1) / 10))
                }

                return filteredBooks
            })
            bookToast.success("Book Deleted", "Book has been removed from the library")
        })

        socket.on("bookAvailabilityUpdated", ({ bookId, availability }) => {
            // Update availability in current page
            setBooks((prevBooks) =>
                prevBooks.map((book) => (book.id === Number.parseInt(bookId) ? { ...book, availability } : book)),
            )
            bookToast.success("Availability Updated", `Book status changed to ${availability}`)
        })

        // cleanup listeners
        return () => {
            socket.off("bookAdded")
            socket.off("bookUpdated")
            socket.off("bookDeleted")
            socket.off("bookAvailabilityUpdated")
        }
    }, []) // Remove currentPage and totalBooks from dependencies to avoid infinite loops

    // Update the handleAddSuccess function to not duplicate the socket event
    const handleAddSuccess = () => {
        console.log("Book added successfully via socket...")
        // The socket event will handle the refresh, so we don't need to call fetchBooks here
        // fetchBooks(1) // Remove this line
        // setCurrentPage(1) // Remove this line
    }

    // Update handleSaveBook to not duplicate the socket event
    const handleSaveBook = () => {
        console.log("Book saved successfully via socket...")
        // The socket event will handle the update, so we don't need to call fetchBooks here
        // fetchBooks(currentPage) // Remove this line
    }

    const handleToggleAvailability = async (bookId, bookAvailability) => {
        try {
            const result = await toggleAvailability(bookId, bookAvailability)
            if (result?.success) {
                // Don't show toast here as socket event will handle it
                // The socket event 'bookAvailabilityUpdated' will update the UI and show toast
            } else {
                bookToast.error("Update Failed", "Failed to update book availability")
            }
        } catch (err) {
            bookToast.error("Error", "An error occurred while updating availability")
            console.error("Failed to toggle availability:", err)
        }
    }

    const handleBookClick = (book) => {
        setSelectedBook(book)
        setShowInfoModal(true)
    }

    const handleCloseInfoModal = () => {
        setShowInfoModal(false)
        setSelectedBook(null)
    }

    const handleReadBook = (book) => {
        setSelectedBook(book)
        setShowReadModal(true)

        const timer = setTimeout(async () => {
            const session = await startRead(book)
            if (session) {
                setSessionId(session)
            }
        }, 30 * 1000) // 30 seconds delay (adjustable)

        setStartTimer(timer)
    }

    const handleCloseReadModal = async () => {
        if (startTimer) {
            clearTimeout(startTimer)
            setStartTimer(null)
        }

        if (sessionId) {
            await endRead(sessionId)
        }

        setShowReadModal(false)
        setSelectedBook(null)
        setSessionId(null)
    }

    const handleDropdownToggle = (bookId) => {
        setOpenDropdown(openDropdown === bookId ? null : bookId)
    }

    const handleEditBook = (book) => {
        setSelectedBook(book)
        setShowEditModal(true)
        setOpenDropdown(null)
    }

    const handleCloseEditModal = () => {
        setShowEditModal(false)
        setSelectedBook(null)
    }

    const handleDeleteBook = (book) => {
        setSelectedBook(book)
        setShowDeleteModal(true)
        setOpenDropdown(null)
    }

    const handleCloseDeleteModal = () => {
        setShowDeleteModal(false)
        setSelectedBook(null)
    }

    // Close dropdown when clicking outside
    const handleClickOutside = () => {
        setOpenDropdown(null)
    }

    // Pagination handlers
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            fetchBooks(page)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1)
        }
    }

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push("...")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }

    // Filter books based on search and genre (client-side for current page)
    const filteredBooks = books.filter((book) => {
        // Make sure book properties exist before searching
        const title = book.title ? book.title.toLowerCase() : ""
        const author = book.author ? book.author.toLowerCase() : ""
        const isbn = book.isbn ? book.isbn.toLowerCase() : ""
        const publishedYear = book.published_year ? book.published_year.toString().toLowerCase() : ""
        const genre = book.genre ? book.genre.toLowerCase() : ""

        const searchLower = searchTerm.toLowerCase()

        const matchesSearch =
            searchTerm === "" ||
            title.includes(searchLower) ||
            author.includes(searchLower) ||
            isbn.includes(searchLower) ||
            publishedYear.includes(searchLower)

        const matchesGenre = !filterGenre || genre === filterGenre.toLowerCase()

        return matchesSearch && matchesGenre
    })

    // Gets unique genres for filter (from current page books)
    const uniqueGenres = [...new Set(books.map((book) => book.genre))]

    return (
        <div className="books-page" onClick={handleClickOutside}>
            {/* Page Header */}
            <div className="page-header">
                <div className="header-title">
                    <BookOpen size={28} className="title-icon" />
                    <div>
                        <h1>Library Books</h1>
                        <p>Manage your book collection</p>
                    </div>
                </div>
                {userRole !== "student" && (
                    <button className="add-book-btn" onClick={() => setShowAddForm(true)}>
                        <Plus size={20} />
                        Add New Book
                    </button>
                )}
            </div>

            {/* Add Book Modal */}
            <AddBookModal
                isOpen={showAddForm}
                onClose={() => setShowAddForm(false)}
                onSuccess={handleAddSuccess}
                bookToast={bookToast}
            />

            {/* Info Book Modal */}
            <InfoBookModal isOpen={showInfoModal} onClose={handleCloseInfoModal} book={selectedBook} />

            {/* Edit Book Modal */}
            <EditBookModal
                isOpen={showEditModal}
                onClose={handleCloseEditModal}
                book={selectedBook}
                onSave={handleSaveBook}
                bookToast={bookToast}
            />

            {/* Delete Book Modal */}
            <DeleteBookModal
                isOpen={showDeleteModal}
                onClose={handleCloseDeleteModal}
                book={selectedBook}
                bookToast={bookToast}
            />

            {/* Search and Filters */}
            <div className="search-section">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search books by title, author, or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <div className="filter-dropdown">
                        <Filter size={16} />
                        <select value={filterGenre} onChange={(e) => setFilterGenre(e.target.value)}>
                            <option value="">All Genres</option>
                            {uniqueGenres.map((genre) => (
                                <option key={genre} value={genre}>
                                    {genre}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="view-toggle">
                        <button className={viewMode === "grid" ? "active" : ""} onClick={() => setViewMode("grid")}>
                            <Grid size={16} />
                        </button>
                        <button className={viewMode === "list" ? "active" : ""} onClick={() => setViewMode("list")}>
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Books Collection */}
            <div className="books-collection">
                <div className="collection-header">
                    <h2>Book Collection</h2>
                    <div className="collection-info">
                        <span className="book-count">
                            {filteredBooks.length} of {totalBooks} books
                        </span>
                        <span className="page-info">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading books...</p>
                    </div>
                ) : (
                    <div className={`books-grid ${viewMode}`}>
                        {filteredBooks.length > 0 ? (
                            filteredBooks.map((book) => (
                                <div
                                    key={book.id}
                                    className="book-card"
                                    onClick={() => handleBookClick(book)}
                                    style={{ cursor: "pointer" }}
                                >
                                    <div className="book-cover">
                                        {book.cover ? (
                                            <img
                                                src={`http://localhost:3000/covers/${encodeURIComponent(book.cover)}`}
                                                alt={`${book.title} cover`}
                                                onError={(e) => {
                                                    e.target.onerror = null
                                                    e.target.src = "http://localhost:3000/covers/Lorem Ipsum.png"
                                                }}
                                            />
                                        ) : (
                                            <div className="cover-placeholder">
                                                <BookOpen size={48} />
                                            </div>
                                        )}
                                    </div>
                                    <div className="book-info">
                                        <div className="book-header">
                                            <h3 className="book-title">{book.title}</h3>
                                            <div className="book-menu">
                                                {userRole !== "student" && (
                                                    <>
                                                        <button
                                                            className="menu-trigger"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDropdownToggle(book.id)
                                                            }}
                                                        >
                                                            <EllipsisVertical size={16} />
                                                        </button>
                                                        {openDropdown === book.id && (
                                                            <div className="dropdown-menu">
                                                                <button
                                                                    className="dropdown-item"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleEditBook(book)
                                                                    }}
                                                                >
                                                                    <Edit size={14} />
                                                                    Edit Book
                                                                </button>
                                                                <button
                                                                    className="dropdown-item delete"
                                                                    onClick={(e) => {
                                                                        e.stopPropagation()
                                                                        handleDeleteBook(book)
                                                                    }}
                                                                >
                                                                    <Trash2 size={14} />
                                                                    Delete Book
                                                                </button>
                                                            </div>
                                                        )}
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                        <p className="book-author">by {book.author}</p>
                                        <div className="book-meta">
                                            <span className="book-genre">{book.genre}</span>
                                            <span className="book-isbn">ISBN: {book.isbn}</span>
                                            {book.published_year && <span className="book-isbn">Published Year: {book.published_year}</span>}
                                        </div>
                                        {book.description && <p className="book-description">{book.description}</p>}
                                        <div className="book-actions">
                                            {userRole !== "student" ? (
                                                <div
                                                    className={`availability-status ${book.availability}`}
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleToggleAvailability(book.id, book.availability)
                                                    }}
                                                >
                                                    <span className="status-dot"></span>
                                                    {book.availability === "available" ? "Available" : "Unavailable"}
                                                </div>
                                            ) : (
                                                <div className={`availability-status ${book.availability}`}>
                                                    <span className="status-dot"></span>
                                                    {book.availability === "available" ? "Available" : "Unavailable"}
                                                </div>
                                            )}
                                            {book.content && (
                                                <button
                                                    onClick={(e) => {
                                                        e.stopPropagation()
                                                        handleReadBook(book)
                                                    }}
                                                    className="view-content-btn"
                                                >
                                                    <Eye size={16} />
                                                    Read Book
                                                </button>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="empty-state">
                                <BookOpen size={64} />
                                <h3>No books found</h3>
                                <p>Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isLoading && (
                    <div className="pagination">
                        <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
                            <ChevronLeft size={16} />
                            Previous
                        </button>

                        <div className="pagination-numbers">
                            {generatePageNumbers().map((page, index) => (
                                <button
                                    key={index}
                                    className={`pagination-number ${page === currentPage ? "active" : ""} ${page === "..." ? "dots" : ""}`}
                                    onClick={() => typeof page === "number" && handlePageChange(page)}
                                    disabled={page === "..." || page === currentPage}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>

                        <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                            Next
                            <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            <ReadBookModal
                isOpen={showReadModal}
                onClose={handleCloseReadModal}
                book={selectedBook}
                FOLDER_URL="http://localhost:3000"
            />
            <BookToast toasts={toasts} removeToast={removeToast} />
        </div>
    )
}

export default Books
