"use client"

import { useState } from "react"
import { deleteUser } from "../../api/users"
import { X, Trash2, AlertTriangle, Loader2, User, Building, Shield, GraduationCap } from "lucide-react"

function DeleteUserModal({ isOpen, onClose, user, onSuccess, usersToast }) {
    const [isDeleting, setIsDeleting] = useState(false)
    const [confirmText, setConfirmText] = useState("")

    const handleDelete = async () => {
        if (!user) return
        setIsDeleting(true)
        try {
            const response = await deleteUser(user.id)
            if (response?.success) {
                onClose()
                usersToast.success("User Deleted", `${user.name} has been removed from the system.`)
                if (onSuccess) onSuccess(user.id)
            } else {
                usersToast.error("Delete Failed", response?.message || "Failed to delete user. Please try again.")
            }
        } catch (error) {
            usersToast.error("Error", "An error occurred while deleting the user.")
            console.error("Delete user error:", error)
        }
        setIsDeleting(false)
    }

    const handleClose = () => {
        if (!isDeleting) { setConfirmText(""); onClose() }
    }

    const getRoleIcon = (role) => {
        if (role === "admin") return <Shield size={13} />
        if (role === "librarian") return <User size={13} />
        return <GraduationCap size={13} />
    }

    const isConfirmValid = confirmText.toLowerCase() === "delete"

    if (!isOpen || !user) return null

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl
          bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
          animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-red-100 dark:border-red-900/40
          bg-gradient-to-r from-red-50 to-rose-50 dark:from-red-950/40 dark:to-rose-950/40 rounded-t-2xl">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl
            bg-red-100 dark:bg-red-900/60 text-red-600 dark:text-red-400">
                        <AlertTriangle size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-red-700 dark:text-red-400">Delete User</h2>
                        <p className="text-xs text-red-500/80 dark:text-red-400/60">This action is permanent and cannot be undone</p>
                    </div>
                    <button onClick={handleClose} disabled={isDeleting}
                        className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
              hover:bg-red-100/60 dark:hover:bg-red-900/40 disabled:opacity-40 transition">
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-4">
                    {/* Warning message */}
                    <p className="text-sm text-center text-gray-600 dark:text-gray-300 leading-relaxed">
                        Are you sure you want to delete this user? All associated data will be permanently removed.
                    </p>

                    {/* User preview card */}
                    <div className="flex items-center gap-3 p-4 rounded-xl
            bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-center w-11 h-11 rounded-full
              bg-gray-200 dark:bg-gray-600 text-gray-500 dark:text-gray-300 shrink-0">
                            <User size={20} />
                        </div>
                        <div className="min-w-0">
                            <p className="font-semibold text-sm text-gray-900 dark:text-white truncate">{user.name}</p>
                            <p className="text-xs text-gray-500 dark:text-gray-400 truncate">{user.email}</p>
                            <div className="flex items-center gap-2 mt-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                  bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                    {getRoleIcon(user.role)}
                                    {user.role.charAt(0).toUpperCase() + user.role.slice(1)}
                                </span>
                                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium
                  bg-gray-200 dark:bg-gray-600 text-gray-600 dark:text-gray-300">
                                    <Building size={11} />
                                    {user.department}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Consequences */}
                    <div className="p-4 rounded-xl bg-red-50 dark:bg-red-950/30 border border-red-200 dark:border-red-800/50">
                        <p className="text-xs font-bold text-red-700 dark:text-red-400 mb-2 uppercase tracking-wide">
                            This will permanently remove:
                        </p>
                        <ul className="space-y-1">
                            {[
                                "User account and login credentials",
                                "All user profile information",
                                "User activity history and logs",
                                "Any associated permissions and roles",
                            ].map((item) => (
                                <li key={item} className="flex items-start gap-2 text-xs text-red-600 dark:text-red-400">
                                    <span className="mt-0.5 shrink-0">•</span>
                                    {item}
                                </li>
                            ))}
                        </ul>
                    </div>

                    {/* Confirm input */}
                    <div>
                        <label className="block text-xs font-semibold text-gray-700 dark:text-gray-300 mb-1.5">
                            Type <span className="font-bold text-red-600 dark:text-red-400">"DELETE"</span> to confirm:
                        </label>
                        <input
                            type="text"
                            placeholder="Type DELETE to confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            disabled={isDeleting}
                            className="w-full px-3 py-2.5 rounded-lg border text-sm tracking-wider
                bg-white dark:bg-gray-700/60
                border-gray-200 dark:border-gray-600
                text-gray-900 dark:text-gray-100
                placeholder-gray-400 dark:placeholder-gray-500
                focus:outline-none focus:ring-2 focus:ring-red-500/40 focus:border-red-500
                disabled:opacity-50 disabled:cursor-not-allowed transition"
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4
          border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
                    <button type="button" onClick={handleClose} disabled={isDeleting}
                        className="px-4 py-2 text-sm font-medium rounded-lg border
              border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300
              bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
              disabled:opacity-50 transition">
                        Cancel
                    </button>
                    <button
                        type="button"
                        onClick={handleDelete}
                        disabled={isDeleting || !isConfirmValid}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg
              bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-500/25
              disabled:opacity-40 disabled:cursor-not-allowed transition active:scale-95"
                    >
                        {isDeleting
                            ? <><Loader2 size={15} className="animate-spin" /> Deleting...</>
                            : <><Trash2 size={15} /> Delete User</>
                        }
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteUserModal