"use client"

import { useState } from "react"
import AuthGuard from "../../components/AuthGuard"
import { deleteBook } from "../../api/book"
import "./deleteBookModal.css"
import { X, Trash2, AlertTriangle, Loader2, BookOpen } from "lucide-react"

function DeleteBookModal({ isOpen, onClose, book, onSuccess, bookToast }) {
    const [isDeleting, setIsDeleting] = useState(false)

    const handleDelete = async () => {
        if (!book) return;

        setIsDeleting(true);

        try {
            const response = await deleteBook(book.id); // use book.id here

            if (response?.success) {
                onClose();
                bookToast.book("Book Deleted", `"${book.title}" has been removed from the library.`);
                if (onSuccess) onSuccess();
            } else {
                bookToast.error("Delete Failed", "Failed to delete book. Please try again.");
            }
        } catch (error) {
            bookToast.error("Error", "An error occurred while deleting the book.");
            console.error("Delete book error:", error);
        }

        setIsDeleting(false);
    };


    const handleClose = () => {
        if (!isDeleting) {
            onClose()
        }
    }

    if (!isOpen || !book) return null

    return (
        <AuthGuard allowedRoles={['admin', 'librarian']}>
            <div className="deleteModalOverlay" onClick={handleClose}>
                <div className="deleteBookModal" onClick={(e) => e.stopPropagation()}>
                    <div className="deleteModalHeader">
                        <div className="warningIconWrapper">
                            <AlertTriangle size={24} className="warningIcon" />
                        </div>
                        <h2>Delete Book</h2>
                        <button className="deleteCloseBtn" onClick={handleClose} disabled={isDeleting}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="deleteModalContent">
                        <div className="deleteWarningMessage">
                            <p className="warningText">Are you sure you want to delete this book? This action cannot be undone.</p>
                        </div>

                        <div className="bookPreview">
                            <div className="bookPreviewCover">
                                {book.cover ? (
                                    <img
                                        src={`http://localhost:3000/covers/${encodeURIComponent(book.cover)}`}
                                        alt={`${book.title} cover`}
                                        onError={(e) => {
                                            e.target.onerror = null;
                                            e.target.src = 'http://localhost:3000/covers/Lorem Ipsum.png';
                                        }}
                                    />
                                ) : (
                                    <div className="cover-placeholder">
                                        <BookOpen size={48} />
                                    </div>
                                )}
                            </div>
                            <div className="bookPreviewInfo">
                                <h3 className="previewTitle">{book.title}</h3>
                                <p className="previewAuthor">by {book.author}</p>
                                <div className="previewMeta">
                                    <span className="previewGenre">{book.genre}</span>
                                    <span className="previewIsbn">ISBN: {book.isbn}</span>
                                </div>
                            </div>
                        </div>

                        <div className="deleteConsequences">
                            <h4>This will permanently remove:</h4>
                            <ul>
                                <li>Book information and metadata</li>
                                <li>Cover image (if uploaded)</li>
                                <li>PDF content (if uploaded)</li>
                                <li>All associated records</li>
                            </ul>
                        </div>
                    </div>

                    <div className="deleteModalActions">
                        <button type="button" className="deleteCancelBtn" onClick={handleClose} disabled={isDeleting}>
                            Cancel
                        </button>
                        <button type="button" className="deleteConfirmBtn" onClick={handleDelete} disabled={isDeleting}>
                            {isDeleting ? (
                                <>
                                    <Loader2 size={16} className="deleteSpinner" />
                                    Deleting...
                                </>
                            ) : (
                                <>
                                    <Trash2 size={16} />
                                    Delete Book
                                </>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}

export default DeleteBookModal
