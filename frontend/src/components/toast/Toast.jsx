"use client"

import { useState } from "react"
import "./Toast.css"
import { CheckCircle, XCircle, Info } from "lucide-react"

let toastId = 0

const Toast = ({ toasts, removeToast }) => {
    return (
        <div className="toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`toast toast-${toast.type}`}>
                    <div className="toast-content">
                        <div className="toast-icon-wrapper">
                            {toast.type === "success" && <CheckCircle size={18} />}
                            {toast.type === "error" && <XCircle size={18} />}
                            {toast.type === "info" && <Info size={18} />}
                        </div>
                        <div className="toast-text">
                            <span className="toast-title">{toast.title}</span>
                            <span className="toast-message">{toast.message}</span>
                        </div>
                    </div>
                    <button className="toast-close" onClick={() => removeToast(toast.id)}>×</button>
                </div>
            ))}
        </div>
    )
}

export const useToast = () => {
    const [toasts, setToasts] = useState([])

    const addToast = (title, message, type = "info", duration = 4000) => {
        const id = ++toastId
        setToasts((prev) => [...prev, { id, title, message, type }])
        setTimeout(() => removeToast(id), duration)
    }

    const removeToast = (id) => {
        setToasts((prev) => prev.filter((t) => t.id !== id))
    }

    const toast = {
        success: (title, message, duration) => addToast(title, message, "success", duration),
        error: (title, message, duration) => addToast(title, message, "error", duration),
        info: (title, message, duration) => addToast(title, message, "info", duration),
    }

    return { toast, toasts, removeToast }
}

export default Toast