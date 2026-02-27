"use client"

import { useState, useRef, useEffect } from "react"
import AuthGuard from "../../components/AuthGuard"
import { editBook } from "../../api/book"
import "./editBookModal.css"
import { Upload, FileText, ImageIcon, X, Save } from "lucide-react"

function EditBookModal({ isOpen, onClose, book, onSave, bookToast }) {
    const coverRef = useRef()
    const contentRef = useRef()

    const [isbn, setIsbn] = useState("")
    const [title, setTitle] = useState("")
    const [author, setAuthor] = useState("")
    const [genre, setGenre] = useState("")
    const [description, setDescription] = useState("")
    const [department, setDepartment] = useState("")
    const [availability, setAvailability] = useState("")
    const [publishedYear, setPublishedYear] = useState("")
    const [coverFile, setCoverFile] = useState(null)
    const [contentFile, setContentFile] = useState(null)
    const [isLoading, setIsLoading] = useState(false)

    // Populate form when book changes
    useEffect(() => {
        if (book) {
            setIsbn(book.isbn || "")
            setTitle(book.title || "")
            setAuthor(book.author || "")
            setGenre(book.genre || "")
            setDescription(book.description || "")
            setDepartment(book.department || "")
            setAvailability(book.availability || "")
            setPublishedYear(book.published_year || "")
            setCoverFile(null)
            setContentFile(null)

            // Reset file inputs
            if (coverRef.current) coverRef.current.value = ""
            if (contentRef.current) contentRef.current.value = ""
        }
    }, [book])

    // eslint-disable-next-line no-unused-vars
    const resetForm = () => {
        setIsbn("")
        setTitle("")
        setAuthor("")
        setGenre("")
        setDescription("")
        setDepartment("")
        setAvailability("")
        setPublishedYear("")
        setCoverFile(null)
        setContentFile(null)

        // Reset file input elements
        if (coverRef.current) coverRef.current.value = ""
        if (contentRef.current) contentRef.current.value = ""
    }

    const handleClose = () => {
        if (!isLoading) {
            onClose()
        }
    }

    const handleSaveBook = async () => {
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
        formData.append("id", book.id)
        formData.append("isbn", isbn)
        formData.append("title", title)
        formData.append("author", author)
        formData.append("genre", genre)
        formData.append("description", description)
        formData.append("department", department)
        formData.append("availability", availability.toLowerCase())
        formData.append("published_year", publishedYear)
        if (coverFile) formData.append("cover", coverFile)
        if (contentFile) formData.append("content", contentFile)

        try {
            const bookEdit = await editBook(formData, book.id)

            if (bookEdit?.success) {
                resetForm()
                onClose()
                bookToast.book("Book Edited Successfully", `"${title}" has been edited`)
                if (onSave) onSave()
            } else {
                bookToast.error("Edit Failed", "Failed to edit book. Please try again.")
            }
        } catch (error) {
            bookToast.error("Error", "An error occurred while editing the book")
            console.error("Edit book error:", error)
        }

        setIsLoading(false)
    }

    if (!isOpen || !book) return null

    return (
        <AuthGuard allowedRoles={['admin', 'librarian']}>
            <div className="editModalOverlay" onClick={handleClose}>
                <div className="editBookModal" onClick={(e) => e.stopPropagation()}>
                    <div className="editModalHeader">
                        <h2>Edit Book</h2>
                        <button className="editCloseBtn" onClick={handleClose} disabled={isLoading}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="editModalContent">
                        <form className="editBookForm" onSubmit={(e) => e.preventDefault()}>
                            <div className="editFormGrid">
                                <div className="editFormGroup">
                                    <label>ISBN *</label>
                                    <input
                                        type="text"
                                        placeholder="Enter ISBN"
                                        value={isbn}
                                        onChange={(e) => setIsbn(e.target.value)}
                                        disabled={isLoading}
                                        required
                                    />
                                </div>
                                <div className="editFormGroup">
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
                                <div className="editFormGroup">
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
                                <div className="editFormGroup">
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
                                <div className="editFormGroup">
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
                                <div className="editFormGroup">
                                    <label>Published Year</label>
                                    <input
                                        type="text"
                                        placeholder="Enter published year"
                                        value={publishedYear}
                                        onChange={(e) => setPublishedYear(e.target.value)}
                                        disabled={isLoading}
                                    />
                                </div>
                                <div className="editFormGroup">
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

                            <div className="editFormGroup editFullWidth">
                                <label>Description</label>
                                <textarea
                                    placeholder="Enter book description (optional)"
                                    value={description}
                                    onChange={(e) => setDescription(e.target.value)}
                                    disabled={isLoading}
                                    rows={3}
                                />
                            </div>

                            <div className="editFileUploads">
                                <div className="editFormGroup">
                                    <label>Book Cover</label>
                                    <div className="editCurrentFile">
                                        {book.cover && (
                                            <div className="currentCover">
                                                <img src={`http://localhost:3000/covers/${book.cover}`} alt="Current cover" />
                                                <span>Current cover</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="editFileInputWrapper">
                                        <input
                                            type="file"
                                            accept="image/*"
                                            ref={coverRef}
                                            onChange={(e) => setCoverFile(e.target.files[0])}
                                            disabled={isLoading}
                                            id="edit-cover-upload"
                                        />
                                        <label htmlFor="edit-cover-upload" className="editFileLabel">
                                            <ImageIcon size={20} />
                                            <span className="editFileText">
                                                {coverFile ? (
                                                    <span className="editFileSelected">{coverFile.name}</span>
                                                ) : (
                                                    <span className="editFilePlaceholder">
                                                        {book.cover ? "Replace cover image" : "Choose cover image"}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                                <div className="editFormGroup">
                                    <label>Book Content (PDF)</label>
                                    <div className="editCurrentFile">
                                        {book.content && (
                                            <div className="currentContent">
                                                <FileText size={16} />
                                                <span>Current PDF available</span>
                                            </div>
                                        )}
                                    </div>
                                    <div className="editFileInputWrapper">
                                        <input
                                            type="file"
                                            accept="application/pdf"
                                            ref={contentRef}
                                            onChange={(e) => setContentFile(e.target.files[0])}
                                            disabled={isLoading}
                                            id="edit-content-upload"
                                        />
                                        <label htmlFor="edit-content-upload" className="editFileLabel">
                                            <FileText size={20} />
                                            <span className="editFileText">
                                                {contentFile ? (
                                                    <span className="editFileSelected">{contentFile.name}</span>
                                                ) : (
                                                    <span className="editFilePlaceholder">
                                                        {book.content ? "Replace PDF file" : "Choose PDF file"}
                                                    </span>
                                                )}
                                            </span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <div className="editFormNote">
                                <p>* Required fields</p>
                            </div>

                            <div className="editModalActions">
                                <button type="button" className="editCancelBtn" onClick={handleClose} disabled={isLoading}>
                                    Cancel
                                </button>
                                <button type="button" className="editSaveBtn" onClick={handleSaveBook} disabled={isLoading}>
                                    {isLoading ? (
                                        <>
                                            <Upload size={18} className="editSpinner" />
                                            Updating Book...
                                        </>
                                    ) : (
                                        <>
                                            <Save size={18} />
                                            Save Changes
                                        </>
                                    )}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}

export default EditBookModal
