"use client"

import { useState } from "react"
import { addUser } from "../../api/users"
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
        setFormData({ email: "", name: "", department: "", password: "", role: "student", status: "active" })
        setShowPassword(false)
    }

    const handleClose = () => {
        if (!isLoading) { resetForm(); onClose() }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        setFormData((prev) => ({ ...prev, [name]: value }))
    }

    const validateForm = () => {
        if (!formData.email || !formData.name || !formData.department || !formData.password) {
            usersToast.error("Missing Fields", "Please fill in all required fields"); return false
        }
        if (formData.password.length < 6) {
            usersToast.error("Invalid Password", "Password must be at least 6 characters long"); return false
        }
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            usersToast.error("Invalid Email", "Please enter a valid email address"); return false
        }
        return true
    }

    const handleSubmit = async () => {
        if (!validateForm()) return
        setIsLoading(true)
        try {
            const res = await addUser(formData)
            if (res.success) {
                const newUser = { ...formData, id: res.userId, created_at: new Date().toISOString() }
                resetForm(); onClose(); onSuccess(newUser)
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
        if (role === "admin") return <Shield size={15} />
        if (role === "librarian") return <User size={15} />
        return <GraduationCap size={15} />
    }

    if (!isOpen) return null

    const inputCls =
        "w-full px-3 py-2.5 rounded-lg border text-sm bg-white dark:bg-gray-700/60 " +
        "border-gray-200 dark:border-gray-600 text-gray-900 dark:text-gray-100 " +
        "placeholder-gray-400 dark:placeholder-gray-500 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500/40 focus:border-blue-500 " +
        "disabled:opacity-50 disabled:cursor-not-allowed transition"

    const labelCls = "flex items-center gap-1.5 text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400 mb-1.5"

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={handleClose}
        >
            <div
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl
          bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
          animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-700
          bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-t-2xl">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
                        <UserPlus size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">Add New User</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Fill in the details below to create a new account</p>
                    </div>
                    <button
                        onClick={handleClose}
                        disabled={isLoading}
                        className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
              hover:bg-gray-100 dark:hover:bg-gray-700 disabled:opacity-40 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Body */}
                <div className="px-6 py-5 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        {/* Email */}
                        <div className="col-span-2">
                            <label className={labelCls}><Mail size={12} /> Email Address <span className="text-red-400">*</span></label>
                            <input type="email" name="email" placeholder="user@example.com"
                                value={formData.email} onChange={handleChange} disabled={isLoading}
                                className={inputCls} />
                        </div>

                        {/* Name */}
                        <div>
                            <label className={labelCls}><User size={12} /> Full Name <span className="text-red-400">*</span></label>
                            <input type="text" name="name" placeholder="Enter full name"
                                value={formData.name} onChange={handleChange} disabled={isLoading}
                                className={inputCls} />
                        </div>

                        {/* Department */}
                        <div>
                            <label className={labelCls}><Building size={12} /> Department <span className="text-red-400">*</span></label>
                            <input type="text" name="department" placeholder="e.g. BSIT"
                                value={formData.department} onChange={handleChange} disabled={isLoading}
                                className={inputCls} />
                        </div>

                        {/* Password */}
                        <div className="col-span-2">
                            <label className={labelCls}><Lock size={12} /> Password <span className="text-red-400">*</span></label>
                            <div className="relative">
                                <input type={showPassword ? "text" : "password"} name="password"
                                    placeholder="Min. 6 characters" value={formData.password}
                                    onChange={handleChange} disabled={isLoading}
                                    className={inputCls + " pr-10"} />
                                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition">
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                            <p className="mt-1 text-xs text-gray-400 dark:text-gray-500 italic">Minimum 6 characters required</p>
                        </div>

                        {/* Role */}
                        <div>
                            <label className={labelCls}>{getRoleIcon(formData.role)} Role <span className="text-red-400">*</span></label>
                            <select name="role" value={formData.role} onChange={handleChange} disabled={isLoading} className={inputCls}>
                                <option value="student">Student</option>
                                <option value="librarian">Librarian</option>
                                <option value="admin">Admin</option>
                            </select>
                        </div>

                        {/* Status */}
                        <div>
                            <label className={labelCls}><User size={12} /> Status <span className="text-red-400">*</span></label>
                            <select name="status" value={formData.status} onChange={handleChange} disabled={isLoading} className={inputCls}>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>

                    <p className="text-xs text-gray-400 dark:text-gray-500 italic">* Required fields</p>
                </div>

                {/* Footer */}
                <div className="flex items-center justify-end gap-3 px-6 py-4
          border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
                    <button
                        type="button" onClick={handleClose} disabled={isLoading}
                        className="px-4 py-2 text-sm font-medium rounded-lg border
              border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300
              bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
              disabled:opacity-50 transition"
                    >
                        Cancel
                    </button>
                    <button
                        type="button" onClick={handleSubmit} disabled={isLoading}
                        className="flex items-center gap-2 px-5 py-2 text-sm font-semibold rounded-lg
              bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25
              disabled:opacity-50 disabled:cursor-not-allowed transition active:scale-95"
                    >
                        <UserPlus size={16} />
                        {isLoading ? "Adding User..." : "Add User"}
                    </button>
                </div>
            </div>
        </div>
    )
}

export default AddUserModal