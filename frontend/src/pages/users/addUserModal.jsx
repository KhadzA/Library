"use client"

import { useState } from "react"
import { addUser } from "../../api/users"
import "./addUserModal.css"
import { X, UserPlus, Mail, User, Building, Lock, Shield, GraduationCap, Eye, EyeOff } from "lucide-react"

function AddUserModal({ isOpen, onClose, onSuccess, usersToast }) {
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
    }

    const validateForm = () => {
        if (!formData.email || !formData.name || !formData.department || !formData.password) {
            usersToast.error("Missing Fields", "Please fill in all required fields")
            return false
        }

        if (formData.password.length < 6) {
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
            const res = await addUser(formData)
            if (res.success) {
                const newUser = {
                    ...formData,
                    id: res.userId,
                    created_at: new Date().toISOString(),
                }
                resetForm()
                onClose()
                onSuccess(newUser)
            } else {
                usersToast.error("Add Failed", res.message || "Failed to add user. Please try again.")
            }
        } catch (error) {
            console.error("Add user error:", error)
            usersToast.error("Error", "An error occurred while adding the user")
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

    if (!isOpen) return null

    return (
        <div className="add-user-modal-overlay" onClick={handleClose}>
            <div className="add-user-modal" onClick={(e) => e.stopPropagation()}>
                <div className="add-user-modal-header">
                    <div className="header-icon-wrapper">
                        <UserPlus size={24} className="header-icon" />
                    </div>
                    <h2>Add New User</h2>
                    <button className="add-user-close-btn" onClick={handleClose} disabled={isLoading}>
                        <X size={20} />
                    </button>
                </div>

                <div className="add-user-modal-content">
                    <form className="add-user-form" onSubmit={(e) => e.preventDefault()}>
                        <div className="add-user-form-grid">
                            <div className="add-user-form-group">
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

                            <div className="add-user-form-group">
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

                            <div className="add-user-form-group">
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

                            <div className="add-user-form-group">
                                <label>
                                    <Lock size={16} />
                                    Password *
                                </label>
                                <div className="password-input-wrapper">
                                    <input
                                        type={showPassword ? "text" : "password"}
                                        name="password"
                                        placeholder="Enter password"
                                        value={formData.password}
                                        onChange={handleChange}
                                        disabled={isLoading}
                                        required
                                    />
                                    <button
                                        type="button"
                                        className="password-toggle"
                                        onClick={() => setShowPassword(!showPassword)}
                                        disabled={isLoading}
                                    >
                                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                                    </button>
                                </div>
                                <span className="password-hint">Minimum 6 characters</span>
                            </div>

                            <div className="add-user-form-group">
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

                            <div className="add-user-form-group">
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

                        <div className="add-user-form-note">
                            <p>* Required fields</p>
                        </div>

                        <div className="add-user-modal-actions">
                            <button type="button" className="add-user-cancel-btn" onClick={handleClose} disabled={isLoading}>
                                Cancel
                            </button>
                            <button type="button" className="add-user-submit-btn" onClick={handleSubmit} disabled={isLoading}>
                                <UserPlus size={18} />
                                {isLoading ? "Adding User..." : "Add User"}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    )
}

export default AddUserModal
