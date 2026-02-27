"use client"

import { useState } from "react"
import "./Toast.css"

let toastId = 0

const Toast = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
                    <div className="toast-content">
                        <span className="toast-icon">{toast.type === "success" ? "✓" : toast.type === "error" ? "✕" : "ℹ"}</span>
                        <span className="toast-message">{toast.message}</span>
                    </div>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>
                        ×
                    </button>
                </div>
            ))}
        </div>
    )
}

// Toast hook
export const useToast = () => {
    const [toasts, setToasts] = useState([])

    const addToast = (message, type = "info", duration = 4000) => {
        const id = ++toastId
        const toast = { id, message, type }

        setToasts((prev) => [...prev, toast])

        setTimeout(() => {
            removeToast(id)
        }, duration)
    }

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((toast) => toast.id !== id))
    }

    const toast = {
        success: (message, duration) => addToast(message, "success", duration),
        error: (message, duration) => addToast(message, "error", duration),
        info: (message, duration) => addToast(message, "info", duration),
    }

    return { toast, toasts, removeToast }
}

export default Toast
