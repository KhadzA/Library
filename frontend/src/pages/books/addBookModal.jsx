"use client"

import { useState, useRef } from "react"
import AuthGuard from "../../components/AuthGuard"
import { addBook, getBookMetadataByISBN } from "../../api/book"
import "./addBookModal.css"
import { Upload, FileText, ImageIcon, X } from "lucide-react"

function AddBookModal({ isOpen, onClose, onSuccess, bookToast }) {
    const coverRef = useRef()
    const contentRef = useRef()

    const [isbn, setIsbn] = useState("")
    const [title, setTitle] = useState("")
    const [author, setAuthor] = useState("")
    const [genre, setGenre] = useState("")
    const [description, setDescription] = useState("")
    const [department, setDepartment] = useState("")
    const [availability, setAvailability] = useState("")
    const [published_year, setPublished_year] = useState("")
    const [coverFile, setCoverFile] = useState(null)
    const [contentFile, setContentFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    const resetForm = () => {
        setIsbn("")
        setTitle("")
        setAuthor("")
        setGenre("")
        setDescription("")
        setDepartment("")
        setAvailability("")
        setPublished_year("")
        setCoverFile(null)
        setContentFile(null)

        // Reset file input elements
        if (coverRef.current) coverRef.current.value = ""
        if (contentRef.current) contentRef.current.value = ""
    }

    const handleClose = () => {
        if (!isLoading) {
            resetForm()
            onClose()
        }
    }

    const handleAddbook = async () => {
        if (!isbn || !title || !author || !genre || !department) {
            bookToast.error("Missing Fields", "Please fill in all required fields")
            return
        }

        if (!availability) {
            bookToast.error("Missing Availability", "Please select availability status")
            return
        }

        setIsLoading(true)

        const formData = new FormData()
        formData.append("isbn", isbn)
        formData.append("title", title)
        formData.append("author", author)
        formData.append("genre", genre)
        formData.append("description", description)
        formData.append("department", department)
        formData.append("availability", availability.toLowerCase())
        formData.append("published_year", published_year)
        if (coverFile) formData.append("cover", coverFile)
        if (contentFile) formData.append("content", contentFile)

        try {
            const bookAdd = await addBook(formData)

            if (bookAdd?.success) {
                resetForm()
                onClose()
                bookToast.book("Book Added Successfully", `"${title}" has been added to the library`)
                if (onSuccess) onSuccess()
            } else {
                bookToast.error("Add Failed", "Failed to add book. Please try again.")
            }
        } catch (error) {
            bookToast.error("Error", "An error occurred while adding the book")
            console.error("Add book error:", error)
        }

        setIsLoading(false)
    }

    const handleISBNBlur = async () => {
        if (isbn.length !== 10 && isbn.length !== 13) return;

        const result = await getBookMetadataByISBN(isbn);
        if (result.success) {
            const { title, author, genre, description, published_year } = result.data;
            if (!title && !author) return; // no valid data
            setTitle(title);
            setAuthor(author);
            setGenre(genre);
            setDescription(description);
            setPublished_year(published_year);
            bookToast.info("Auto-filled", "Book details loaded from ISBN");
        } else {
            bookToast.error("Not found", "Could not fetch book info");
        }
    };


    if (!isOpen) return null

    return (
        <AuthGuard allowedRoles={['admin', 'librarian']}>
            <div className="modal-overlay" onClick={handleClose}>
                <div className="add-book-modal" onClick={(e) => e.stopPropagation()}>
                    <div className="modal-header">
                        <h2>Add New Book</h2>
                        <button className="close-btn" onClick={handleClose} disabled={isLoading}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="add-modal-content">
                        <form className="book-form" onSubmit={(e) => e.preventDefault()}>
                            <div className="form-grid">
                                <div className="form-group">
                                    <label>ISBN *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter ISBN"
                                        value={isbn}
                                        onChange={(e) => setIsbn(e.target.value)}
                                        onBlur={handleISBNBlur}
                                        onKeyDown={(e) => {
                                            if (e.key === 'Enter') {
                                                e.preventDefault(); // Prevent form submission
                                                handleISBNBlur();   // Manually trigger autofill
                                                e.target.blur();    // Optionally remove focus (like tabbing out)
                                            }
                                        }}
                                        disabled={isLoading}
                                        required
                                    />


                                </div>
                                <div className="form-group">
                                    <label>Title *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter book title"
                                        value={title}
                                        onChange={(e) => setTitle(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Author *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter author name"
                                        value={author}
                                        onChange={(e) => setAuthor(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Genre *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter genre"
                                        value={genre}
                                        onChange={(e) => setGenre(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Department *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter department"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Published Year *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter Published Year"
                                        value={published_year}
                                        onChange={(e) => setPublished_year(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="form-group">
                                    <label>Availability *</label>
                                    <select
                                        value={availability}
                                        onChange={(e) => setAvailability(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    >
                                        <option value="" disabled>
                                            Select availability
                                        </option>
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-group full-width">
                                <label>Description</label>
                                <textarea
                                    placeholder="Enter book description (optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isLoading}
                                    rows={3}
                                />
                            </div>

                            <div className="file-uploads">
                                <div className="form-group">
                                    <label>Book Cover</label>
                                    <div className="file-input-wrapper">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={coverRef}
                                            onChange={(e) => setCoverFile(e.target.files[0])}
                                            disabled={isLoading}
                                            id="cover-upload"
                                        />
                                        <label htmlFor="cover-upload" className="file-label">
                                            <ImageIcon size={20} />
                                            <span className="file-text">
                                                {coverFile ? (
                                                    <span className="file-selected">{coverFile.name}</span>
                                                ) : (
                                                    <span className="file-placeholder">Choose cover image</span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Book Content (PDF)</label>
                                    <div className="file-input-wrapper">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            ref={contentRef}
                                            onChange={(e) => setContentFile(e.target.files[0])}
                                            disabled={isLoading}
                                            id="content-upload"
                                        />
                                        <label htmlFor="content-upload" className="file-label">
                                            <FileText size={20} />
                                            <span className="file-text">
                                                {contentFile ? (
                                                    <span className="file-selected">{contentFile.name}</span>
                                                ) : (
                                                    <span className="file-placeholder">Choose PDF file</span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="form-note">
                                <p>* Required fields</p>
                            </div>

                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={handleClose} disabled={isLoading}>
                                    Cancel
                                </button>
                                <button type="button" className="submit-btn" onClick={handleAddbook} disabled={isLoading}>
                                    <Upload size={18} />
                                    {isLoading ? "Adding Book..." : "Add Book"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}

export default AddBookModal
