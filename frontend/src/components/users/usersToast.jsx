"use client"

import { useState } from "react"
import "./usersToast.css"
import { CheckCircle, XCircle, Info, Users } from "lucide-react"

let toastId = 0

const UsersToast = ({ toasts, removeToast }) => {
    return (
        <div className="users-toast-container">
            {toasts.map((toast) => (
                <div key={toast.id} className={`users-toast users-toast-${toast.type}`} onClick={() => removeToast(toast.id)}>
                    <div className="users-toast-content">
                        <div className="users-toast-icon-wrapper">
                            {toast.type === "success" && <CheckCircle size={20} />}
                            {toast.type === "error" && <XCircle size={20} />}
                            {toast.type === "info" && <Info size={20} />}
                            {toast.type === "users" && <Users size={20} />}
                        </div>
                        <div className="users-toast-text">
                            <span className="users-toast-title">{toast.title}</span>
                            <span className="users-toast-message">{toast.message}</span>
                        </div>
                    </div>
                    <button
                        className="users-toast-close"
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

// Users Toast hook
export const useUsersToast = () => {
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

    const usersToast = {
        success: (title, message, duration) => addToast(title, message, "success", duration),
        error: (title, message, duration) => addToast(title, message, "error", duration),
        info: (title, message, duration) => addToast(title, message, "info", duration),
        users: (title, message, duration) => addToast(title, message, "users", duration),
    }

    return { usersToast, toasts, removeToast }
}

export default UsersToast
