"use client"

import { useState, useEffect } from "react"
import { editUser } from "../../api/users"
import "./editUserModal.css"
import { X, Edit, Mail, User, Building, Lock, Shield, GraduationCap, Eye, EyeOff } from "lucide-react"

function EditUserModal({ isOpen, onClose, user, onSuccess, usersToast }) {
    const [formData, setFormData] = useState({
        email: "",
        name: "",
        department: "",
        password: "",
        role: "student",
        status: "active",
    })
    const [isLoading, setIsLoading] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [passwordChanged, setPasswordChanged] = useState(false)

    // Populate form when user prop changes
    useEffect(() => {
        if (user && isOpen) {
            setFormData({
                email: user.email || "",
                name: user.name || "",
                department: user.department || "",
                password: "", // Always start with empty password
                role: user.role || "student",
                status: user.status || "active",
            })
            setPasswordChanged(false)
            setShowPassword(false)
        }
    }, [user, isOpen])

    const resetForm = () => {
        setFormData({
            email: "",
            name: "",
            department: "",
            password: "",
            role: "student",
            status: "active",
        })
        setShowPassword(false)
        setPasswordChanged(false)
    }

    const handleClose = () => {
        if (!isLoading) {
            resetForm()
            onClose()
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))

        // Track if password field has been modified
        if (name === "password") {
            setPasswordChanged(value.length > 0)
        }
    }

    const validateForm = () => {
        if (!formData.email || !formData.name || !formData.department) {
            usersToast.error("Missing Fields", "Please fill in all required fields")
            return false
        }

        // Only validate password if it's been changed
        if (passwordChanged && formData.password.length < 6) {
            usersToast.error("Invalid Password", "Password must be at least 6 characters long")
            return false
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        if (!emailRegex.test(formData.email)) {
            usersToast.error("Invalid Email", "Please enter a valid email address")
            return false
        }

        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return

        setIsLoading(true)

        try {
            // Prepare data for API call
            const updateData = {
                id: user.id,
                email: formData.email,
                name: formData.name,
                department: formData.department,
                role: formData.role,
                status: formData.status,
            }

            // Only include password if it was changed
            if (passwordChanged && formData.password) {
                updateData.password = formData.password
            }

            const res = await editUser(updateData)
            if (res.success) {
                const updatedUser = {
                    ...user,
                    ...formData,
                    updated_at: new Date().toISOString(),
                }
                resetForm()
                onClose()
                onSuccess(updatedUser)
                usersToast.success("User Updated", `${formData.name} has been updated successfully`)
            } else {
                usersToast.error("Update Failed", res.message || "Failed to update user. Please try again.")
            }
        } catch (error) {
            console.error("Edit user error:", error)
            usersToast.error("Error", "An error occurred while updating the user")
        }

        setIsLoading(false)
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

    if (!isOpen || !user) return null

    return (
        <div className="edit-user-modal-overlay" onClick={handleClose}>
            <div className="edit-user-modal" onClick={(e) => e.stopPropagation()}>
                <div className="edit-user-modal-header">
                    <div className="edit-header-icon-wrapper">
                        <Edit size={24} className="edit-header-icon" />
                    </div>
                    <h2>Edit User</h2>
                    <button className="edit-user-close-btn" onClick={handleClose} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <div className="edit-user-modal-content">
                    <div className="edit-user-info">
                        <div className="current-user-badge">
                            <div className="current-user-avatar">
                                <User size={20} />
                            </div>
                            <div className="current-user-details">
                                <span className="current-user-name">Editing: {user.name}</span>
                                <span className="current-user-email">{user.email}</span>
                            </div>
                        </div>
                    </div>

                    <form className="edit-user-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="edit-user-form-grid">
                            <div className="edit-user-form-group">
                                <label>
                                    <Mail size={16} />
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    name="email"
                                    placeholder="Enter email address"
                                    value={formData.email}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="edit-user-form-group">
                                <label>
                                    <User size={16} />
                                    Full Name *
                                </label>
                                <input
                                    type="text"
                                    name="name"
                                    placeholder="Enter full name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="edit-user-form-group">
                                <label>
                                    <Building size={16} />
                                    Department *
                                </label>
                                <input
                                    type="text"
                                    name="department"
                                    placeholder="Enter department"
                                    value={formData.department}
                                    onChange={handleChange}
                                    disabled={isLoading}
                                    required
                                />
                            </div>

                            <div className="edit-user-form-group">
                                <label>
                                    <Lock size={16} />
                                    New Password
                                </label>
                                <div className="edit-password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Leave empty to keep current password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                    />
                                    <button
                                        type="button"
                                        className="edit-password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <span className="edit-password-hint">
                                    {passwordChanged ? "Minimum 6 characters" : "Leave empty to keep current password"}
                                </span>
                            </div>

                            <div className="edit-user-form-group">
                                <label>
                                    {getRoleIcon(formData.role)}
                                    Role *
                                </label>
                                <select name="role" value={formData.role} onChange={handleChange} disabled={isLoading} required>
                                    <option value="student">Student</option>
                                    <option value="librarian">Librarian</option>
                                    <option value="admin">Admin</option>
                                </select>
                            </div>

                            <div className="edit-user-form-group">
                                <label>
                                    <User size={16} />
                                    Status *
                                </label>
                                <select name="status" value={formData.status} onChange={handleChange} disabled={isLoading} required>
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>
                        </div>

                        <div className="edit-user-form-note">
                            <p>* Required fields</p>
                        </div>

                        <div className="edit-user-modal-actions">
                            <button type="button" className="edit-user-cancel-btn" onClick={handleClose} disabled={isLoading}>
                                Cancel
                            </button>
                            <button type="button" className="edit-user-submit-btn" onClick={handleSubmit} disabled={isLoading}>
                                <Edit size={18} />
                                {isLoading ? "Updating User..." : "Update User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default EditUserModal
