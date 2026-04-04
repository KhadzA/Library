"use client"
import { useState, useEffect } from "react"
import { useSocketConnection } from "../../hooks/useSocketConnection"
import { viewBook, toggleAvailability } from "../../api/book"
import { startRead, endRead } from "../../api/readBook"
import BookToast, { useBookToast } from "../../components/books/bookToast"
import AddBookModal from "./addBookModal"
import ReadBookModal from "./readBookModal"
import EditBookModal from "./editBookModal"
import DeleteBookModal from "./deleteBookModal"
import InfoBookModal from "./infoBookModal"
import {
    BookOpen, Plus, Eye, Search, Filter, Grid, List,
    EllipsisVertical, Edit, Trash2, ChevronLeft, ChevronRight,
} from "lucide-react"
import socket, { connectSocket } from "../../socket"

function Books() {
    useSocketConnection()

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

    const fetchBooks = async (page = 1, searchTerm = "") => {
        setIsLoading(true)
        try {
            const result = await viewBook(page, 10, searchTerm)
            if (result.success) {
                const responseData = result.data
                setBooks(responseData.books || [])
                setTotalPages(responseData.totalPages || Math.ceil((responseData.total || 0) / 10))
                setTotalBooks(responseData.total || 0)
                setCurrentPage(page)
            } else {
                bookToast.error("Error", "Failed to fetch books")
            }
        } catch (error) {
            console.error("Error fetching books:", error)
            bookToast.error("Error", "An error occurred while fetching books")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchBooks(currentPage, searchTerm)
    }, [currentPage, searchTerm])

    useEffect(() => {
        const role = localStorage.getItem("userRole")
        setUserRole(role)
        connectSocket()
        fetchBooks(1)

        socket.on("bookAdded", (newBook) => {
            fetchBooks(currentPage)
            bookToast.book("New Book Added", `"${newBook.title}" has been added to the library`)
        })
        socket.on("bookUpdated", (updatedBook) => {
            setBooks((prev) => prev.map((b) => (b.id === updatedBook.id ? updatedBook : b)))
            bookToast.success("Book Updated", `"${updatedBook.title}" has been updated`)
        })
        socket.on("bookDeleted", (bookId) => {
            setBooks((prev) => {
                const filtered = prev.filter((b) => b.id !== parseInt(bookId))
                if (filtered.length === 0 && currentPage > 1) fetchBooks(currentPage - 1)
                else if (filtered.length < prev.length) {
                    setTotalBooks((p) => p - 1)
                    setTotalPages(Math.ceil((totalBooks - 1) / 10))
                }
                return filtered
            })
        })
        socket.on("bookAvailabilityUpdated", ({ bookId, availability }) => {
            setBooks((prev) =>
                prev.map((b) => (b.id === parseInt(bookId) ? { ...b, availability } : b))
            )
        })

        return () => {
            socket.off("bookAdded")
            socket.off("bookUpdated")
            socket.off("bookDeleted")
            socket.off("bookAvailabilityUpdated")
        }
    }, [])

    const handleAddSuccess = () => { }
    const handleSaveBook = () => { }

    const handleToggleAvailability = async (bookId, bookAvailability) => {
        try {
            const result = await toggleAvailability(bookId, bookAvailability)
            if (!result?.success) bookToast.error("Update Failed", "Failed to update book availability")
        } catch {
            bookToast.error("Error", "An error occurred while updating availability")
        }
    }

    const handleBookClick = (book) => { setSelectedBook(book); setShowInfoModal(true) }
    const handleCloseInfoModal = () => { setShowInfoModal(false); setSelectedBook(null) }

    const handleReadBook = (book) => {
        setSelectedBook(book)
        setShowReadModal(true)
        const timer = setTimeout(async () => {
            const session = await startRead(book)
            if (session) setSessionId(session)
        }, 30 * 1000)
        setStartTimer(timer)
    }

    const handleCloseReadModal = async () => {
        if (startTimer) { clearTimeout(startTimer); setStartTimer(null) }
        if (sessionId) await endRead(sessionId)
        setShowReadModal(false)
        setSelectedBook(null)
        setSessionId(null)
    }

    const handleDropdownToggle = (bookId) => setOpenDropdown(openDropdown === bookId ? null : bookId)
    const handleEditBook = (book) => { setSelectedBook(book); setShowEditModal(true); setOpenDropdown(null) }
    const handleCloseEditModal = () => { setShowEditModal(false); setSelectedBook(null) }
    const handleDeleteBook = (book) => { setSelectedBook(book); setShowDeleteModal(true); setOpenDropdown(null) }
    const handleCloseDeleteModal = () => { setShowDeleteModal(false); setSelectedBook(null) }
    const handleClickOutside = () => setOpenDropdown(null)

    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) fetchBooks(page)
    }

    const generatePageNumbers = () => {
        const pages = []
        const max = 5
        if (totalPages <= max) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) pages.push(i)
                pages.push("..."); pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1); pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i)
            } else {
                pages.push(1); pages.push("...")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i)
                pages.push("..."); pages.push(totalPages)
            }
        }
        return pages
    }

    const filteredBooks = books.filter((book) => {
        const s = searchTerm.toLowerCase()
        const match = !s || [book.title, book.author, book.isbn, book.published_year?.toString()]
            .some((v) => v?.toLowerCase().includes(s))
        const matchGenre = !filterGenre || book.genre?.toLowerCase() === filterGenre.toLowerCase()
        return match && matchGenre
    })

    const uniqueGenres = [...new Set(books.map((b) => b.genre))]

    return (
        <div className="p-6 bg-slate-50 dark:bg-slate-900 min-h-screen" onClick={handleClickOutside}>

            {/* Page Header */}
            <div className="flex items-center justify-between mb-6 bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700">
                <div className="flex items-center gap-4">
                    <BookOpen size={28} className="text-indigo-600 dark:text-indigo-400" />
                    <div>
                        <h1 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">Library Books</h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your book collection</p>
                    </div>
                </div>
                {userRole !== "student" && (
                    <button
                        onClick={() => setShowAddForm(true)}
                        className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-lg text-sm font-medium transition-colors"
                    >
                        <Plus size={20} />
                        Add New Book
                    </button>
                )}
            </div>

            {/* Modals */}
            <AddBookModal isOpen={showAddForm} onClose={() => setShowAddForm(false)} onSuccess={handleAddSuccess} bookToast={bookToast} />
            <InfoBookModal isOpen={showInfoModal} onClose={handleCloseInfoModal} book={selectedBook} />
            <EditBookModal isOpen={showEditModal} onClose={handleCloseEditModal} book={selectedBook} onSave={handleSaveBook} bookToast={bookToast} />
            <DeleteBookModal isOpen={showDeleteModal} onClose={handleCloseDeleteModal} book={selectedBook} bookToast={bookToast} />

            {/* Search & Filters */}
            <div className="flex gap-4 mb-6 items-center">
                <div className="flex-1 relative flex items-center">
                    <Search size={20} className="absolute left-3 text-slate-400 z-10 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search books by title, author, or ISBN..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-10 pr-4 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20"
                    />
                </div>
                <div className="flex gap-3 items-center">
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                        <Filter size={16} />
                        <select
                            value={filterGenre}
                            onChange={(e) => setFilterGenre(e.target.value)}
                            className="py-2 px-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 focus:outline-none focus:border-indigo-500"
                        >
                            <option value="">All Genres</option>
                            {uniqueGenres.map((g) => <option key={g} value={g}>{g}</option>)}
                        </select>
                    </div>
                    <div className="flex border border-slate-200 dark:border-slate-600 rounded-lg overflow-hidden">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={`p-2 transition-colors ${viewMode === "grid" ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={`p-2 transition-colors ${viewMode === "list" ? "bg-indigo-600 text-white" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                        >
                            <List size={16} />
                        </button>
                    </div>
                </div>
            </div>

            {/* Books Collection */}
            <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 p-6">
                <div className="flex items-center justify-between mb-6 pb-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-lg font-semibold text-slate-800 dark:text-slate-100">Book Collection</h2>
                    <div className="flex flex-col items-end gap-1">
                        <span className="text-sm text-slate-500 dark:text-slate-400">{filteredBooks.length} of {totalBooks} books</span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">Page {currentPage} of {totalPages}</span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 text-slate-500 dark:text-slate-400">
                        <div className="w-10 h-10 border-3 border-slate-200 dark:border-slate-600 border-t-indigo-500 rounded-full animate-spin mb-4" />
                        <p className="text-sm">Loading books...</p>
                    </div>
                ) : (
                    <div className={viewMode === "grid"
                        ? "flex flex-wrap justify-center gap-5"
                        : "grid grid-cols-1 gap-4"
                    }>
                        {filteredBooks.length > 0 ? filteredBooks.map((book) => (
                            <div
                                key={book.id}
                                onClick={() => handleBookClick(book)}
                                className={`border border-slate-200 dark:border-slate-700 rounded-lg overflow-hidden transition-all bg-white dark:bg-slate-800 hover:-translate-y-0.5 hover:shadow-md cursor-pointer ${viewMode === "grid" ? "flex flex-col w-72" : "flex flex-row"}`}
                            >
                                {/* Cover */}
                                <div className={`flex-shrink-0 bg-slate-100 dark:bg-slate-700 ${viewMode === "grid" ? "h-48 w-full" : "h-36 w-28"}`}>
                                    {book.cover ? (
                                        <img
                                            src={`http://localhost:3000/covers/${encodeURIComponent(book.cover)}`}
                                            alt={book.title}
                                            className="w-full h-full object-cover"
                                            onError={(e) => { e.target.onerror = null; e.target.src = "http://localhost:3000/covers/Lorem Ipsum.png" }}
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-slate-400 dark:text-slate-500">
                                            <BookOpen size={48} />
                                        </div>
                                    )}
                                </div>

                                {/* Info */}
                                <div className="p-4 flex-1">
                                    <div className="flex items-start justify-between mb-1">
                                        <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 leading-snug flex-1 min-w-0 pr-2">{book.title}</h3>
                                        {userRole !== "student" && (
                                            <div className="relative flex-shrink-0 ml-2">
                                                <button
                                                    onClick={(e) => { e.stopPropagation(); handleDropdownToggle(book.id) }}
                                                    className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                >
                                                    <EllipsisVertical size={16} />
                                                </button>
                                                {openDropdown === book.id && (
                                                    <div className="absolute top-full right-0 mt-1 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-lg shadow-lg z-50 min-w-36 py-1 animate-in fade-in slide-in-from-top-2">
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleEditBook(book) }}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                        >
                                                            <Edit size={14} /> Edit Book
                                                        </button>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); handleDeleteBook(book) }}
                                                            className="flex items-center gap-2 w-full px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20"
                                                        >
                                                            <Trash2 size={14} /> Delete Book
                                                        </button>
                                                    </div>
                                                )}
                                            </div>
                                        )}
                                    </div>

                                    <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">by {book.author}</p>

                                    <div className="flex flex-wrap gap-2 mb-3">
                                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">{book.genre}</span>
                                        <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">ISBN: {book.isbn}</span>
                                        {book.published_year && (
                                            <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 px-2 py-0.5 rounded">Year: {book.published_year}</span>
                                        )}
                                    </div>

                                    {book.description && (
                                        <p className="text-sm text-slate-500 dark:text-slate-400 leading-snug mb-4 line-clamp-2">{book.description}</p>
                                    )}

                                    <div className="flex items-center justify-between gap-3">
                                        {userRole !== "student" ? (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleToggleAvailability(book.id, book.availability) }}
                                                className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded transition-opacity hover:opacity-80 ${book.availability === "available" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"}`}
                                            >
                                                <span className={`w-1.5 h-1.5 rounded-full ${book.availability === "available" ? "bg-emerald-500" : "bg-red-500"}`} />
                                                {book.availability === "available" ? "Available" : "Unavailable"}
                                            </button>
                                        ) : (
                                            <span className={`flex items-center gap-1.5 text-xs font-medium px-2 py-1 rounded ${book.availability === "available" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"}`}>
                                                <span className={`w-1.5 h-1.5 rounded-full ${book.availability === "available" ? "bg-emerald-500" : "bg-red-500"}`} />
                                                {book.availability === "available" ? "Available" : "Unavailable"}
                                            </span>
                                        )}
                                        {book.content && (
                                            <button
                                                onClick={(e) => { e.stopPropagation(); handleReadBook(book) }}
                                                className="flex items-center gap-1 text-xs text-indigo-600 dark:text-indigo-400 font-medium px-2 py-1 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                                            >
                                                <Eye size={14} /> Read Book
                                            </button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        )) : (
                            <div className="col-span-full text-center py-16 text-slate-400 dark:text-slate-500">
                                <BookOpen size={64} className="mx-auto mb-4 opacity-30" />
                                <h3 className="text-lg font-semibold text-slate-600 dark:text-slate-300 mb-2">No books found</h3>
                                <p className="text-sm">Try adjusting your search or filter criteria</p>
                            </div>
                        )}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && !isLoading && (
                    <div className="flex items-center justify-center gap-2 mt-8 pt-6 border-t border-slate-200 dark:border-slate-700">
                        <button
                            onClick={() => handlePageChange(currentPage - 1)}
                            disabled={currentPage === 1}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <div className="flex gap-1 mx-4">
                            {generatePageNumbers().map((page, i) => (
                                <button
                                    key={i}
                                    onClick={() => typeof page === "number" && handlePageChange(page)}
                                    disabled={page === "..." || page === currentPage}
                                    className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors ${page === currentPage ? "bg-indigo-600 text-white border border-indigo-600" : page === "..." ? "border-none bg-transparent text-slate-400 cursor-default" : "bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700"}`}
                                >
                                    {page}
                                </button>
                            ))}
                        </div>
                        <button
                            onClick={() => handlePageChange(currentPage + 1)}
                            disabled={currentPage === totalPages}
                            className="flex items-center gap-1.5 px-3 py-2 bg-white dark:bg-slate-800 text-slate-500 dark:text-slate-400 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors"
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                )}
            </div>

            <ReadBookModal isOpen={showReadModal} onClose={handleCloseReadModal} book={selectedBook} FOLDER_URL="http://localhost:3000" />
            <BookToast toasts={toasts} removeToast={removeToast} />
        </div>
    )
}

export default Books