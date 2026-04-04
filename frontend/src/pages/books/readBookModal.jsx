"use client"

import { useState, useEffect } from "react"
import { X, BookOpen, Maximize2, Minimize2 } from "lucide-react"

function ReadBookModal({ isOpen, onClose, book }) {
    const [isFullscreen, setIsFullscreen] = useState(false)
    const [zoomLevel] = useState(100)
    const [pdfExists, setPdfExists] = useState(null)

    useEffect(() => {
        if (book?.content) {
            fetch(`http://localhost:3000/contents/${book.content}`, { method: "HEAD" })
                .then((res) => setPdfExists(res.ok))
                .catch(() => setPdfExists(false))
        } else {
            setPdfExists(false)
        }
    }, [book])

    useEffect(() => {
        const handleEscape = (e) => { if (e.key === "Escape" && isOpen) onClose() }
        if (isOpen) {
            document.addEventListener("keydown", handleEscape)
            document.body.style.overflow = "hidden"
        }
        return () => {
            document.removeEventListener("keydown", handleEscape)
            document.body.style.overflow = "unset"
        }
    }, [isOpen, onClose])

    if (!isOpen || !book) return null

    return (
        <div className="fixed inset-0 bg-black/85 backdrop-blur-sm flex items-center justify-center z-[1002] p-5" onClick={onClose}>
            <div
                className={`bg-white dark:bg-slate-900 flex flex-col shadow-2xl overflow-hidden transition-all ${isFullscreen ? "w-screen h-screen max-w-none rounded-none" : "w-[90vw] h-[85vh] max-w-7xl rounded-xl"}`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-slate-50 dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 flex-shrink-0">
                    <div className="flex items-center gap-3 flex-1 min-w-0">
                        <BookOpen size={20} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
                        <div className="min-w-0">
                            <h3 className="text-base font-semibold text-slate-800 dark:text-slate-100 truncate">{book.title}</h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 truncate">by {book.author}</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                        <div className="w-px h-6 bg-slate-200 dark:bg-slate-600 mx-1" />
                        <button
                            onClick={() => setIsFullscreen(!isFullscreen)}
                            title={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
                            className="p-2 bg-white dark:bg-slate-700 border border-slate-200 dark:border-slate-600 rounded-lg text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-600 hover:text-slate-700 dark:hover:text-slate-300 transition-colors"
                        >
                            {isFullscreen ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                        </button>
                        <button
                            onClick={onClose}
                            title="Close"
                            className="p-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors"
                        >
                            <X size={20} />
                        </button>
                    </div>
                </div>

                {/* PDF Content */}
                <div className="flex-1 relative bg-slate-100 dark:bg-slate-900 overflow-auto">
                    {pdfExists === null ? (
                        <div className="absolute inset-0 flex items-center justify-center bg-white/90 dark:bg-slate-900/90">
                            <div className="text-center">
                                <div className="w-10 h-10 border-3 border-slate-200 border-t-indigo-500 rounded-full animate-spin mx-auto mb-4" />
                                <p className="text-sm text-slate-500 dark:text-slate-400">Loading PDF...</p>
                            </div>
                        </div>
                    ) : pdfExists ? (
                        <div className="w-full h-full" style={{ transform: `scale(${zoomLevel / 100})`, transformOrigin: "center top" }}>
                            <embed
                                src={`http://localhost:3000/contents/${book.content}#toolbar=0&navpanes=0&scrollbar=0`}
                                type="application/pdf"
                                width="100%"
                                height="100%"
                                className="border-none bg-white shadow-md"
                            />
                        </div>
                    ) : (
                        <div className="absolute inset-0 flex items-center justify-center bg-slate-50 dark:bg-slate-900">
                            <div className="text-center p-10">
                                <BookOpen size={64} className="text-slate-300 dark:text-slate-600 mx-auto mb-4" />
                                <h3 className="text-xl font-semibold text-slate-600 dark:text-slate-300 mb-2">No content available</h3>
                                <p className="text-slate-400 dark:text-slate-500 mb-6">This book doesn't have a readable file.</p>
                                <button
                                    onClick={onClose}
                                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-medium transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default ReadBookModal