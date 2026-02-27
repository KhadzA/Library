"use client"

import { useState } from "react"
import { deleteUser } from "../../api/users"
import "./deleteUserModal.css"
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
        if (!isDeleting) {
            setConfirmText("")
            onClose()
        }
    }

    const getRoleIcon = (role) => {
        switch (role) {
            case "admin":
                return <Shield size={16} />
            case "librarian":
                return <User size={16} />
            case "student":
                return <GraduationCap size={16} />
            default:
                return <User size={16} />
        }
    }

    const isConfirmValid = confirmText.toLowerCase() === "delete"

    if (!isOpen || !user) return null

    return (
        <div className="delete-user-modal-overlay" onClick={handleClose}>
            <div className="delete-user-modal" onClick={(e) => e.stopPropagation()}>
                <div className="delete-user-modal-header">
                    <div className="delete-warning-icon-wrapper">
                        <AlertTriangle size={24} className="delete-warning-icon" />
                    </div>
                    <h2>Delete User</h2>
                    <button className="delete-user-close-btn" onClick={handleClose} disabled={isDeleting}>
                        <X size={20} />
                    </button>
                </div>

                <div className="delete-user-modal-content">
                    <div className="delete-warning-message">
                        <p className="delete-warning-text">
                            Are you sure you want to delete this user? This action cannot be undone and will permanently remove all
                            user data.
                        </p>
                    </div>

                    <div className="delete-user-preview">
                        <div className="delete-user-preview-avatar">
                            <User size={24} />
                        </div>
                        <div className="delete-user-preview-info">
                            <h3 className="delete-preview-name">{user.name}</h3>
                            <p className="delete-preview-email">{user.email}</p>
                            <div className="delete-preview-meta">
                                <div className="delete-preview-role">
                                    {getRoleIcon(user.role)}
                                    <span>{user.role.charAt(0).toUpperCase() + user.role.slice(1)}</span>
                                </div>
                                <div className="delete-preview-department">
                                    <Building size={14} />
                                    <span>{user.department}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="delete-consequences">
                        <h4>This will permanently remove:</h4>
                        <ul>
                            <li>User account and login credentials</li>
                            <li>All user profile information</li>
                            <li>User activity history and logs</li>
                            <li>Any associated permissions and roles</li>
                            <li>All related user data from the system</li>
                        </ul>
                    </div>

                    <div className="delete-confirmation-section">
                        <label htmlFor="confirmDelete" className="delete-confirmation-label">
                            Type <strong>"DELETE"</strong> to confirm:
                        </label>
                        <input
                            id="confirmDelete"
                            type="text"
                            className="delete-confirmation-input"
                            placeholder="Type DELETE to confirm"
                            value={confirmText}
                            onChange={(e) => setConfirmText(e.target.value)}
                            disabled={isDeleting}
                        />
                    </div>
                </div>

                <div className="delete-user-modal-actions">
                    <button type="button" className="delete-user-cancel-btn" onClick={handleClose} disabled={isDeleting}>
                        Cancel
                    </button>
                    <button
                        type="button"
                        className="delete-user-confirm-btn"
                        onClick={handleDelete}
                        disabled={isDeleting || !isConfirmValid}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 size={16} className="delete-user-spinner" />
                                Deleting...
                            </>
                        ) : (
                            <>
                                <Trash2 size={16} />
                                Delete User
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default DeleteUserModal
