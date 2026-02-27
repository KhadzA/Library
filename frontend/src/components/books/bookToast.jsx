"use client"

import { useState } from "react"
import "./bookToast.css"
import { CheckCircle, XCircle, Info, BookOpen } from "lucide-react"

let toastId = 0

const BookToast = ({ toasts, removeToast }) => {
    return (
        <div className="book-toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`book-toast book-toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
                    <div className="book-toast-content">
                        <div className="toast-icon-wrapper">
                            {toast.type === "success" && <CheckCircle size={20} />}
                            {toast.type === "error" && <XCircle size={20} />}
                            {toast.type === "info" && <Info size={20} />}
                            {toast.type === "book" && <BookOpen size={20} />}
                        </div>
                        <div className="toast-text">
                            <span className="toast-title">{toast.title}</span>
                            <span className="toast-message">{toast.message}</span>
                        </div>
                    </div>
                    <button
                        className="book-toast-close"
                        onClick={(e) => {
                            e.stopPropagation()
                            removeToast(toast.id)
                        }}
                    >
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}

// Book Toast hook
export const useBookToast = () => {
    const [toasts, setToasts] = useState([])

    const addToast = (title, message, type = "info", duration = 5000) => {
        const id = ++toastId
        const toast = { id, title, message, type }

        setToasts((prev) => [...prev, toast])

        setTimeout(() => {
            removeToast(id)
        }, duration)
    }

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const bookToast = {
        success: (title, message, duration) => addToast(title, message, "success", duration),
        error: (title, message, duration) => addToast(title, message, "error", duration),
        info: (title, message, duration) => addToast(title, message, "info", duration),
        book: (title, message, duration) => addToast(title, message, "book", duration),
    }

    return { bookToast, toasts, removeToast }
}

export default BookToast
