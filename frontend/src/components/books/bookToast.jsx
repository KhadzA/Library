"use client"

import { useState } from "react"
import { CheckCircle, XCircle, Info, BookOpen } from "lucide-react"

let toastId = 0

const toastConfig = {
    success: {
        border: "border-l-emerald-500",
        bg: "bg-gradient-to-r from-emerald-50 to-emerald-50/80 dark:from-emerald-900/30 dark:to-emerald-900/20",
        iconBg: "bg-emerald-100 dark:bg-emerald-900/50 text-emerald-600 dark:text-emerald-400",
        bar: "bg-emerald-500",
    },
    error: {
        border: "border-l-red-500",
        bg: "bg-gradient-to-r from-red-50 to-red-50/80 dark:from-red-900/30 dark:to-red-900/20",
        iconBg: "bg-red-100 dark:bg-red-900/50 text-red-600 dark:text-red-400",
        bar: "bg-red-500",
    },
    info: {
        border: "border-l-blue-500",
        bg: "bg-gradient-to-r from-blue-50 to-blue-50/80 dark:from-blue-900/30 dark:to-blue-900/20",
        iconBg: "bg-blue-100 dark:bg-blue-900/50 text-blue-600 dark:text-blue-400",
        bar: "bg-blue-500",
    },
    book: {
        border: "border-l-violet-500",
        bg: "bg-gradient-to-r from-slate-50 to-slate-50/80 dark:from-slate-800/80 dark:to-slate-800/60",
        iconBg: "bg-violet-100 dark:bg-violet-900/50 text-violet-600 dark:text-violet-400",
        bar: "bg-violet-500",
    },
}

const BookToast = ({ toasts, removeToast }) => {
    return (
        <div className="fixed top-20 right-6 z-[1001] flex flex-col gap-3 max-w-sm w-full pointer-events-none">
            {toasts.map((toast) => {
                const cfg = toastConfig[toast.type] || toastConfig.info
                return (
                    <div
                        key={toast.id}
                        onClick={() => removeToast(toast.id)}
                        className={`relative pointer-events-auto rounded-xl shadow-lg border-l-4 px-5 py-4 flex items-start justify-between cursor-pointer backdrop-blur-sm hover:-translate-y-0.5 hover:shadow-xl transition-all overflow-hidden ${cfg.border} ${cfg.bg}`}
                        style={{ animation: "slideInRight 0.4s cubic-bezier(0.16,1,0.3,1)" }}
                    >
                        {/* Progress bar */}
                        <div
                            className={`absolute bottom-0 left-0 h-0.5 opacity-40 ${cfg.bar}`}
                            style={{ animation: "shrinkWidth 5s linear forwards" }}
                        />

                        <div className="flex items-start gap-3 flex-1 min-w-0">
                            <div className={`flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-lg mt-0.5 ${cfg.iconBg}`}>
                                {toast.type === "success" && <CheckCircle size={18} />}
                                {toast.type === "error" && <XCircle size={18} />}
                                {toast.type === "info" && <Info size={18} />}
                                {toast.type === "book" && <BookOpen size={18} />}
                            </div>
                            <div className="flex flex-col gap-0.5 min-w-0">
                                <span className="text-sm font-semibold text-slate-800 dark:text-slate-100 leading-snug">{toast.title}</span>
                                <span className="text-xs text-slate-500 dark:text-slate-400 leading-snug break-words">{toast.message}</span>
                            </div>
                        </div>
                        <button
                            onClick={(e) => { e.stopPropagation(); removeToast(toast.id) }}
                            className="ml-3 text-lg leading-none text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 flex-shrink-0 rounded px-0.5 transition-colors"
                        >
                            ×
                        </button>
                    </div>
                )
            })}

            <style>{`
                @keyframes slideInRight {
                    from { transform: translateX(110%) scale(0.95); opacity: 0; }
                    to { transform: translateX(0) scale(1); opacity: 1; }
                }
                @keyframes shrinkWidth {
                    from { width: 100%; }
                    to { width: 0%; }
                }
            `}</style>
        </div>
    )
}

export const useBookToast = () => {
    const [toasts, setToasts] = useState([])

    const addToast = (title, message, type = "info", duration = 5000) => {
        const id = ++toastId
        setToasts((prev) => [...prev, { id, title, message, type }])
        setTimeout(() => removeToast(id), duration)
    }

    const removeToast = (id) => setToasts((prev) => prev.filter((t) => t.id !== id))

    const bookToast = {
        success: (title, message, duration) => addToast(title, message, "success", duration),
        error: (title, message, duration) => addToast(title, message, "error", duration),
        info: (title, message, duration) => addToast(title, message, "info", duration),
        book: (title, message, duration) => addToast(title, message, "book", duration),
    }

    return { bookToast, toasts, removeToast }
}

export default BookToast