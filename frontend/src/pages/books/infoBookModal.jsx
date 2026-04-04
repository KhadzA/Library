"use client"

import { useEffect, useState } from "react"
import { getBookMetadataByISBN } from "../../api/book"
import {
    X, BookOpen, Calendar, User, Tag, Hash,
    Building, FileText, ToggleLeft, ToggleRight, Loader2,
} from "lucide-react"

function InfoBookModal({ isOpen, onClose, book }) {
    const [googleData, setGoogleData] = useState(null)
    const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

    useEffect(() => {
        const fetchGoogle = async () => {
            if (!book?.isbn) { setGoogleData(null); return }
            setIsLoadingGoogle(true)
            try {
                const result = await getBookMetadataByISBN(book.isbn)
                setGoogleData(result.success && result.data ? result.data : null)
            } catch {
                setGoogleData(null)
            } finally {
                setIsLoadingGoogle(false)
            }
        }
        if (isOpen && book) fetchGoogle()
        else setGoogleData(null)
    }, [isOpen, book])

    if (!isOpen || !book) return null

    const displayData = {
        title: googleData?.title || book.title,
        author: googleData?.author || book.author,
        genre: googleData?.genre || book.genre,
        description: googleData?.description || book.description,
        published_year: googleData?.published_year || book.published_year,
        published_date: googleData?.published_date || null,
        isbn: book.isbn, department: book.department, availability: book.availability,
        content: book.content, added_by: book.added_by, id: book.id,
        created_at: book.created_at, updated_at: book.updated_at, cover: book.cover,
    }

    const formatDate = (d) => {
        if (!d) return null
        try {
            if (d.length === 4) return d
            if (d.length === 7) return new Date(d + "-01").toLocaleDateString("en-US", { year: "numeric", month: "long" })
            return new Date(d).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })
        } catch { return d }
    }

    const enhanced = (original, google) => google && google !== original

    const detailItems = [
        { icon: Hash, label: "ISBN", value: displayData.isbn, star: false },
        { icon: Tag, label: "Genre", value: displayData.genre, star: enhanced(book.genre, googleData?.genre) },
        { icon: Building, label: "Department", value: displayData.department, star: false },
        ...(displayData.published_date || displayData.published_year ? [{
            icon: Calendar,
            label: "Published Date",
            value: displayData.published_date ? formatDate(displayData.published_date) : displayData.published_year,
            star: !!googleData?.published_date
        }] : []),
        { icon: FileText, label: "Content Available", value: displayData.content ? "Yes" : "No", star: false },
        { icon: User, label: "Added By", value: displayData.added_by || "Admin", star: false },
    ]

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[1000] p-5" onClick={onClose}>
            <div
                className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto shadow-2xl border border-slate-200 dark:border-slate-700"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-7 py-6 border-b border-slate-200 dark:border-slate-700 bg-gradient-to-r from-sky-50 to-blue-50 dark:from-sky-900/20 dark:to-blue-900/20 rounded-t-2xl">
                    <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/40 rounded-full flex items-center justify-center flex-shrink-0">
                        <BookOpen size={22} className="text-blue-600 dark:text-blue-400" />
                    </div>
                    <h2 className="text-xl font-semibold text-blue-800 dark:text-blue-300 flex-1">Book Information</h2>
                    {isLoadingGoogle && (
                        <div className="flex items-center gap-2 text-slate-500 text-xs">
                            <Loader2 size={14} className="animate-spin" />
                            <span>Fetching details...</span>
                        </div>
                    )}
                    <button onClick={onClose} className="p-2 rounded-lg text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-100/50 dark:hover:bg-blue-900/30 transition-colors">
                        <X size={20} />
                    </button>
                </div>

                <div className="p-7">
                    {/* Book overview */}
                    <div className="flex gap-6 mb-8 pb-6 border-b border-slate-100 dark:border-slate-700">
                        <div className="w-40 h-56 flex-shrink-0 rounded-xl overflow-hidden bg-slate-100 dark:bg-slate-700 shadow-md">
                            {displayData.cover ? (
                                <img
                                    src={`http://localhost:3000/covers/${encodeURIComponent(displayData.cover)}`}
                                    alt={displayData.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => { e.target.onerror = null; e.target.src = "http://localhost:3000/covers/Lorem Ipsum.png" }}
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-300 dark:text-slate-500">
                                    <BookOpen size={56} />
                                </div>
                            )}
                        </div>
                        <div className="flex-1 flex flex-col gap-3">
                            <h3 className="text-2xl font-bold text-slate-800 dark:text-slate-100 leading-snug">
                                {displayData.title}
                                {enhanced(book.title, googleData?.title) && <span className="ml-2 text-amber-400">✨</span>}
                            </h3>
                            <p className="text-lg italic text-slate-500 dark:text-slate-400">
                                by {displayData.author}
                                {enhanced(book.author, googleData?.author) && <span className="ml-1 text-amber-400">✨</span>}
                            </p>
                            <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium w-fit ${displayData.availability === "available" ? "bg-emerald-100 dark:bg-emerald-900/40 text-emerald-700 dark:text-emerald-400" : "bg-red-100 dark:bg-red-900/40 text-red-600 dark:text-red-400"}`}>
                                {displayData.availability === "available" ? <ToggleRight size={16} /> : <ToggleLeft size={16} />}
                                {displayData.availability === "available" ? "Available" : "Unavailable"}
                            </div>
                        </div>
                    </div>

                    {/* Google Badge */}
                    {googleData && (
                        <div className="flex justify-center mb-6">
                            <span className="inline-flex items-center gap-1.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-700 px-4 py-2 rounded-full text-xs font-medium">
                                ✨ Enhanced with Google Books data
                            </span>
                        </div>
                    )}

                    {/* Detail Grid */}
                    <div className="grid grid-cols-2 gap-4 mb-8">
                        {detailItems.map(({ icon: label, value, star }) => (
                            <div key={label} className="flex items-center gap-3 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-600">
                                <div className="w-8 h-8 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center flex-shrink-0">
                                    <Icon size={16} className="text-slate-500 dark:text-slate-400" />
                                </div>
                                <div className="flex flex-col gap-0.5 min-w-0">
                                    <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wide">{label}</span>
                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 break-words">
                                        {value}
                                        {star && <span className="ml-1 text-amber-400 text-xs">✨</span>}
                                    </span>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Description */}
                    {displayData.description && (
                        <div className="mb-8">
                            <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3 flex items-center gap-2">
                                Description
                                {enhanced(book.description, googleData?.description) && <span className="text-xs text-amber-500 font-normal">✨ Enhanced</span>}
                            </h4>
                            <p className="text-sm leading-relaxed text-slate-600 dark:text-slate-300 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl border-l-4 border-blue-400">
                                {displayData.description}
                            </p>
                        </div>
                    )}

                    {/* Library Info */}
                    <div className="mb-6">
                        <h4 className="text-lg font-semibold text-slate-800 dark:text-slate-100 mb-3">Library Information</h4>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                ["Book ID", displayData.id],
                                displayData.created_at ? ["Added on", new Date(displayData.created_at).toLocaleDateString()] : null,
                                displayData.updated_at ? ["Last updated", new Date(displayData.updated_at).toLocaleDateString()] : null,
                            ].filter(Boolean).map(([label, val]) => (
                                <div key={label} className="flex justify-between items-center px-4 py-3 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg">
                                    <span className="text-sm text-slate-500 dark:text-slate-400">{label}</span>
                                    <span className="text-sm font-semibold text-slate-800 dark:text-slate-100">{val}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Enhancement comparison */}
                    {googleData && (
                        <div className="p-5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-700/50 rounded-xl">
                            <h4 className="text-base font-semibold text-amber-800 dark:text-amber-400 mb-4">Data Enhancement Details</h4>
                            <div className="flex flex-col gap-4">
                                {[
                                    enhanced(book.title, googleData.title) && ["Title", book.title, googleData.title],
                                    enhanced(book.author, googleData.author) && ["Author", book.author, googleData.author],
                                    enhanced(book.genre, googleData.genre) && ["Genre", book.genre, googleData.genre],
                                    googleData?.published_date && googleData.published_date !== book.published_year && ["Published Date", book.published_year || "Not specified", formatDate(googleData.published_date)],
                                ].filter(Boolean).map(([label, orig, enhanced]) => (
                                    <div key={label}>
                                        <p className="text-xs font-semibold text-amber-700 dark:text-amber-400 uppercase tracking-wide mb-2">{label}</p>
                                        <div className="flex flex-col gap-1">
                                            <span className="text-sm px-3 py-2 bg-slate-100 dark:bg-slate-700 rounded-lg text-slate-500 dark:text-slate-400">Original: {orig}</span>
                                            <span className="text-sm px-3 py-2 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-800 dark:text-amber-300 font-medium">Enhanced: {enhanced} ✨</span>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-center px-7 pb-7 pt-3 border-t border-slate-200 dark:border-slate-700">
                    <button
                        onClick={onClose}
                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-all hover:-translate-y-0.5 hover:shadow-lg hover:shadow-blue-500/20 active:translate-y-0"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default InfoBookModal