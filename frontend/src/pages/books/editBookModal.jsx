"use client"

import { useState, useRef, useEffect } from "react"
import AuthGuard from "../../components/AuthGuard"
import { editBook } from "../../api/book"
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

    useEffect(() => {
        if (book) {
            setIsbn(book.isbn || ""); setTitle(book.title || "")
            setAuthor(book.author || ""); setGenre(book.genre || "")
            setDescription(book.description || ""); setDepartment(book.department || "")
            setAvailability(book.availability || ""); setPublishedYear(book.published_year || "")
            setCoverFile(null); setContentFile(null)
            if (coverRef.current) coverRef.current.value = ""
            if (contentRef.current) contentRef.current.value = ""
        }
    }, [book])

    const resetForm = () => {
        setIsbn(""); setTitle(""); setAuthor(""); setGenre("")
        setDescription(""); setDepartment(""); setAvailability(""); setPublishedYear("")
        setCoverFile(null); setContentFile(null)
        if (coverRef.current) coverRef.current.value = ""
        if (contentRef.current) contentRef.current.value = ""
    }

    const handleClose = () => { if (!isLoading) onClose() }

    const handleSaveBook = async () => {
        if (!isbn || !title || !author || !genre || !department) {
            bookToast.error("Missing Fields", "Please fill in all required fields"); return
        }
        if (!availability) {
            bookToast.error("Missing Availability", "Please select availability status"); return
        }
        setIsLoading(true)
        const formData = new FormData()
        formData.append("id", book.id); formData.append("isbn", isbn)
        formData.append("title", title); formData.append("author", author)
        formData.append("genre", genre); formData.append("description", description)
        formData.append("department", department)
        formData.append("availability", availability.toLowerCase())
        formData.append("published_year", publishedYear)
        if (coverFile) formData.append("cover", coverFile)
        if (contentFile) formData.append("content", contentFile)
        try {
            const bookEdit = await editBook(formData, book.id)
            if (bookEdit?.success) {
                resetForm(); onClose()
                bookToast.book("Book Edited Successfully", `"${title}" has been edited`)
                if (onSave) onSave()
            } else {
                bookToast.error("Edit Failed", "Failed to edit book. Please try again.")
            }
        } catch (error) {
            bookToast.error("Error", "An error occurred while editing the book")
            console.error(error)
        }
        setIsLoading(false)
    }

    if (!isOpen || !book) return null

    const inputClass = "w-full px-3.5 py-3 border border-slate-300 dark:border-slate-600 rounded-lg text-sm bg-white dark:bg-slate-700 text-slate-800 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 disabled:bg-slate-50 dark:disabled:bg-slate-800 disabled:text-slate-400 disabled:cursor-not-allowed transition-colors"
    const labelClass = "text-sm font-medium text-slate-700 dark:text-slate-300 mb-1.5 block"

    return (
        <AuthGuard allowedRoles={['admin', 'librarian']}>
            <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5" onClick={handleClose}>
                <div
                    className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
                    onClick={(e) => e.stopPropagation()}
                >
                    {/* Header */}
                    <div className="flex items-center justify-between px-7 py-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-t-2xl">
                        <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300">Edit Book</h2>
                        <button
                            onClick={handleClose}
                            disabled={isLoading}
                            className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Content */}
                    <div className="p-7">
                        <form onSubmit={(e) => e.preventDefault()} className="flex flex-col gap-6">
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>ISBN *</label>
                                    <input type="text" placeholder="Enter ISBN" value={isbn} onChange={(e) => setIsbn(e.target.value)} disabled={isLoading} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Title *</label>
                                    <input type="text" placeholder="Enter book title" value={title} onChange={(e) => setTitle(e.target.value)} disabled={isLoading} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Author *</label>
                                    <input type="text" placeholder="Enter author name" value={author} onChange={(e) => setAuthor(e.target.value)} disabled={isLoading} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Genre *</label>
                                    <input type="text" placeholder="Enter genre" value={genre} onChange={(e) => setGenre(e.target.value)} disabled={isLoading} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Department *</label>
                                    <input type="text" placeholder="Enter department" value={department} onChange={(e) => setDepartment(e.target.value)} disabled={isLoading} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Published Year</label>
                                    <input type="text" placeholder="Enter published year" value={publishedYear} onChange={(e) => setPublishedYear(e.target.value)} disabled={isLoading} className={inputClass} />
                                </div>
                                <div>
                                    <label className={labelClass}>Availability *</label>
                                    <select value={availability} onChange={(e) => setAvailability(e.target.value)} disabled={isLoading} className={inputClass}>
                                        <option value="" disabled>Select availability</option>
                                        <option value="available">Available</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>
                            </div>

                            <div>
                                <label className={labelClass}>Description</label>
                                <textarea
                                    placeholder="Enter book description (optional)"
                                    value={description} onChange={(e) => setDescription(e.target.value)}
                                    disabled={isLoading} rows={3}
                                    className={`${inputClass} resize-y min-h-20 font-[inherit]`}
                                />
                            </div>

                            {/* File Uploads */}
                            <div className="grid grid-cols-2 gap-5">
                                <div>
                                    <label className={labelClass}>Book Cover</label>
                                    {book.cover && (
                                        <div className="flex items-center gap-3 p-2 mb-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-lg">
                                            <img src={`http://localhost:3000/covers/${book.cover}`} alt="Current cover" className="w-10 h-12 object-cover rounded" />
                                            <span className="text-xs text-sky-700 dark:text-sky-400 font-medium">Current cover</span>
                                        </div>
                                    )}
                                    <div className="relative">
                                        <input type="file" accept="image/*" ref={coverRef} onChange={(e) => setCoverFile(e.target.files[0])} disabled={isLoading} id="edit-cover-upload" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                                        <label htmlFor="edit-cover-upload" className="flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm text-slate-500 dark:text-slate-400">
                                            <ImageIcon size={20} className="flex-shrink-0" />
                                            <span className="truncate">{coverFile ? <span className="text-emerald-600 font-medium">{coverFile.name}</span> : (book.cover ? "Replace cover image" : "Choose cover image")}</span>
                                        </label>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelClass}>Book Content (PDF)</label>
                                    {book.content && (
                                        <div className="flex items-center gap-2 p-2 mb-2 bg-sky-50 dark:bg-sky-900/20 border border-sky-200 dark:border-sky-700 rounded-lg">
                                            <FileText size={16} className="text-sky-600 dark:text-sky-400" />
                                            <span className="text-xs text-sky-700 dark:text-sky-400 font-medium">Current PDF available</span>
                                        </div>
                                    )}
                                    <div className="relative">
                                        <input type="file" accept="application/pdf" ref={contentRef} onChange={(e) => setContentFile(e.target.files[0])} disabled={isLoading} id="edit-content-upload" className="absolute inset-0 opacity-0 w-full h-full cursor-pointer z-10" />
                                        <label htmlFor="edit-content-upload" className="flex items-center gap-3 px-4 py-3.5 border-2 border-dashed border-slate-300 dark:border-slate-600 rounded-lg bg-slate-50 dark:bg-slate-700/50 cursor-pointer hover:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all text-sm text-slate-500 dark:text-slate-400">
                                            <FileText size={20} className="flex-shrink-0" />
                                            <span className="truncate">{contentFile ? <span className="text-emerald-600 font-medium">{contentFile.name}</span> : (book.content ? "Replace PDF file" : "Choose PDF file")}</span>
                                        </label>
                                    </div>
                                </div>
                            </div>

                            <p className="text-xs text-slate-400 italic">* Required fields</p>

                            <div className="flex gap-3 justify-end pt-6 border-t border-slate-200 dark:border-slate-700">
                                <button type="button" onClick={handleClose} disabled={isLoading} className="px-5 py-2.5 bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-300 dark:border-slate-600 rounded-lg text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors">
                                    Cancel
                                </button>
                                <button type="button" onClick={handleSaveBook} disabled={isLoading} className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium disabled:bg-slate-400 disabled:cursor-not-allowed transition-colors min-w-36 justify-center">
                                    {isLoading ? <><Upload size={18} className="animate-spin" /> Updating...</> : <><Save size={18} /> Save Changes</>}
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