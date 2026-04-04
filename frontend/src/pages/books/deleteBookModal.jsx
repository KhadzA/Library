"use client"

import { useState } from "react"
import AuthGuard from "../../components/AuthGuard"
import { deleteBook } from "../../api/book"
import { X, Trash2, AlertTriangle, Loader2, BookOpen } from "lucide-react"

function DeleteBookModal({ isOpen, onClose, book, onSuccess, bookToast }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!book) return
        setIsDeleting(true)
        try {
            const response = await deleteBook(book.id)
            if (response?.success) {
                onClose()
                bookToast.book("Book Deleted", `"${book.title}" has been removed from the library.`)
                if (onSuccess) onSuccess()
            } else {
                bookToast.error("Delete Failed", "Failed to delete book. Please try again.")
            }
        } catch (error) {
            bookToast.error("Error", "An error occurred while deleting the book.")
            console.error(error)
        }
        setIsDeleting(false)
    }

    const handleClose = () => { if (!isDeleting) onClose() }

    if (!isOpen || !book) return null

    return (
        <AuthGuard allowedRoles={['admin', 'librarian']}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5" onClick={handleClose}>
                <div
                    className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center gap-3 px-7 pt-6 pb-4 border-b border-red-100 dark:border-red-900/30 bg-gradient-to-r from-red-50 to-red-100/50 dark:from-red-900/20 dark:to-red-800/10 rounded-t-2xl">
                        <div className="flex items-center justify-center w-10 h-10 bg-red-100 dark:bg-red-900/40 rounded-full flex-shrink-0">
                            <AlertTriangle size={22} className="text-red-500" />
                        </div>
                        <h2 className="text-xl font-semibold text-red-700 dark:text-red-400 flex-1">Delete Book</h2>
                        <button
                            onClick={handleClose}
                            disabled={isDeleting}
                            className="p-2 rounded-lg text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-100/50 dark:hover:bg-red-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="px-7 py-6">
                        <p className="text-base text-slate-600 dark:text-slate-300 text-center mb-6 leading-relaxed">
                            Are you sure you want to delete this book? This action cannot be undone.
                        </p>

                        {/* Book Preview */}
                        <div className="flex gap-4 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600 mb-5">
                            <div className="w-16 h-20 flex-shrink-0 rounded-lg overflow-hidden bg-slate-200 dark:bg-slate-600">
                                {book.cover ? (
                                    <img
                                        src={`http://localhost:3000/covers/${encodeURIComponent(book.cover)}`}
                                        alt={book.title}
                                        className="w-full h-full object-cover"
                                        onError={(e) => { e.target.onerror = null; e.target.src = "http://localhost:3000/covers/Lorem Ipsum.png" }}
                                    />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-slate-400">
                                        <BookOpen size={32} />
                                    </div>
                                )}
                            </div>
                            <div className="flex-1 min-w-0">
                                <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 mb-1 leading-snug">{book.title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 mb-3">by {book.author}</p>
                                <div className="flex flex-wrap gap-2">
                                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">{book.genre}</span>
                                    <span className="text-xs text-slate-500 dark:text-slate-400 bg-slate-200 dark:bg-slate-600 px-2 py-0.5 rounded">ISBN: {book.isbn}</span>
                                </div>
                            </div>
                        </div>

                        {/* Consequences */}
                        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/50 rounded-xl p-4 mb-6">
                            <h4 className="text-sm font-semibold text-red-700 dark:text-red-400 mb-3">This will permanently remove:</h4>
                            <ul className="list-disc pl-5 space-y-1">
                                {["Book information and metadata", "Cover image (if uploaded)", "PDF content (if uploaded)", "All associated records"].map((item) => (
                                    <li key={item} className="text-sm text-red-700/80 dark:text-red-400/80">{item}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Actions */}
                    <div className="flex gap-3 justify-end px-7 pb-7 pt-1 border-t border-slate-200 dark:border-slate-700 mt-0 pt-5">
                        <button
                            type="button"
                            onClick={handleClose}
                            disabled={isDeleting}
                            className="px-5 py-2.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            Cancel
                        </button>
                        <button
                            type="button"
                            onClick={handleDelete}
                            disabled={isDeleting}
                            className="flex items-center gap-2 px-5 py-2.5 bg-red-500 hover:bg-red-600 text-white rounded-lg text-sm font-medium disabled:bg-slate-400 disabled:cursor-not-allowed transition-all min-w-32 justify-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/20 active:translate-y-0"
                        >
                            {isDeleting ? (
                                <><Loader2 size={16} className="animate-spin" /> Deleting...</>
                            ) : (
                                <><Trash2 size={16} /> Delete Book</>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}

export default DeleteBookModal