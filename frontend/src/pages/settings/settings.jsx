"use client"

import { useState, useEffect } from "react"
import AuthGuard from "../../components/AuthGuard"
import { useSocketConnection } from "../../hooks/useSocketConnection"
import { getProfile, updateProfile, changePassword, getAvatarColor, updateAvatarColor } from "../../api/settings"
import { Settings as SettingsIcon, UserCircle, Mail, Lock, User, Palette, Check, Eye, EyeOff, Moon, Sun } from "lucide-react"
import Toast, { useToast } from "../../components/toast/Toast.jsx"
import "./settings.css"

function Settings() {
    useSocketConnection()

    const { toast, toasts, removeToast } = useToast()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [department, setDepartment] = useState("")
    const [originalProfile, setOriginalProfile] = useState({})

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [theme, setTheme] = useState("light")
    const [avatarColor, setAvatarColor] = useState("#3b82f6")

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light"
        setTheme(savedTheme)
        document.documentElement.setAttribute("data-theme", savedTheme)

        getProfile().then((res) => {
            if (res.success) {
                setName(res.data.name)
                setEmail(res.data.email)
                setDepartment(res.data.department || "")
                setOriginalProfile({
                    name: res.data.name,
                    email: res.data.email,
                    department: res.data.department || "",
                })
            }
        })

        getAvatarColor().then((res) => {
            if (res.success) setAvatarColor(res.data.color)
        })
    }, [])

    const handleProfileSave = async () => {
        const res = await updateProfile(name, email, department)
        if (res.success) {
            setOriginalProfile({ name, email, department })
            toast.success("Profile updated successfully!")
        } else {
            toast.error(res.error?.response?.data?.message || "Update failed.")
        }
    }

    const handleProfileCancel = () => {
        setName(originalProfile.name || "")
        setEmail(originalProfile.email || "")
        setDepartment(originalProfile.department || "")
    }

    const handleAvatarColorSave = async (color) => {
        const res = await updateAvatarColor(color)
        if (res.success) {
            setAvatarColor(color)
            localStorage.setItem("avatarColor", color)
            window.dispatchEvent(new CustomEvent("avatarColorChanged", { detail: { color } }))
            toast.success("Avatar color updated!")
        } else {
            toast.error("Failed to update avatar color.")
        }
    }

    const handlePasswordUpdate = async () => {
        if (newPassword !== confirmPassword) return toast.error("Passwords do not match.")
        const res = await changePassword(currentPassword, newPassword)
        if (res.success) {
            toast.success("Password updated successfully!")
            setCurrentPassword("")
            setNewPassword("")
            setConfirmPassword("")
        } else {
            toast.error(res.error?.response?.data?.message || "Update failed.")
        }
    }

    const handlePasswordCancel = () => {
        setCurrentPassword("")
        setNewPassword("")
        setConfirmPassword("")
    }

    const handleThemeToggle = (newTheme) => {
        setTheme(newTheme)
        localStorage.setItem("theme", newTheme)
        document.documentElement.setAttribute("data-theme", newTheme)
    }

    return (
        <AuthGuard allowedRoles={["admin", "librarian", "student"]}>
            <div className="settings-page">
                <div className="settings-container">
                    <div className="page-header">
                        <div className="header-title">
                            <SettingsIcon size={28} className="title-icon" />
                            <div>
                                <h1>Settings</h1>
                                <p>Manage your account preferences and security settings</p>
                            </div>
                        </div>
                    </div>

                    <div className="settings-content">
                        {/* Avatar */}
                        <div className="settings-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <UserCircle size={20} />
                                </div>
                                <div className="section-info">
                                    <h2 className="section-title">Avatar</h2>
                                    <p className="section-description">Customize your profile avatar</p>
                                </div>
                            </div>
                            <div className="section-content">
                                <div className="avatar-preview-row">
                                    <div className="avatar-large" style={{ backgroundColor: avatarColor }}>
                                        {name ? name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                    <div className="avatar-info">
                                        <p className="setting-label">Avatar Color</p>
                                        <p className="setting-description">Pick a background color for your avatar</p>
                                    </div>
                                </div>
                                <div className="color-presets">
                                    {["#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#f59e0b", "#ec4899", "#06b6d4", "#64748b"].map((color) => (
                                        <button
                                            key={color}
                                            className={`color-swatch ${avatarColor === color ? "selected" : ""}`}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleAvatarColorSave(color)}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        className="color-picker-input"
                                        value={avatarColor}
                                        onChange={(e) => handleAvatarColorSave(e.target.value)}
                                        title="Custom color"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Appearance */}
                        <div className="settings-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <Palette size={20} />
                                </div>
                                <div className="section-info">
                                    <h2 className="section-title">Appearance</h2>
                                    <p className="section-description">Customize how the application looks</p>
                                </div>
                            </div>
                            <div className="section-content">
                                <div className="setting-item">
                                    <div className="setting-info">
                                        <label className="setting-label">Theme</label>
                                        <p className="setting-description">Choose between light and dark mode</p>
                                    </div>
                                    <div className="theme-toggle">
                                        <button
                                            className={`theme-option ${theme === "light" ? "active" : ""}`}
                                            onClick={() => handleThemeToggle("light")}
                                        >
                                            <Sun size={16} />
                                            <span>Light</span>
                                        </button>
                                        <button
                                            className={`theme-option ${theme === "dark" ? "active" : ""}`}
                                            onClick={() => handleThemeToggle("dark")}
                                        >
                                            <Moon size={16} />
                                            <span>Dark</span>
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Account Information */}
                        <div className="settings-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <User size={20} />
                                </div>
                                <div className="section-info">
                                    <h2 className="section-title">Account Information</h2>
                                    <p className="section-description">Update your personal details</p>
                                </div>
                            </div>
                            <div className="section-content">
                                <div className="form-group">
                                    <label className="form-label">Full Name</label>
                                    <input
                                        type="text"
                                        className="form-input"
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-select" value={department} onChange={(e) => setDepartment(e.target.value)}>
                                        <option value="computer-science">Computer Science</option>
                                        <option value="mathematics">Mathematics</option>
                                        <option value="physics">Physics</option>
                                        <option value="chemistry">Chemistry</option>
                                        <option value="biology">Biology</option>
                                        <option value="english">English</option>
                                        <option value="history">History</option>
                                    </select>
                                </div>
                                <div className="form-actions">
                                    <button className="btn btn-primary" onClick={handleProfileSave}>Save Changes</button>
                                    <button className="btn btn-secondary" onClick={handleProfileCancel}>Cancel</button>
                                </div>
                            </div>
                        </div>

                        {/* Email Verification - Dummy */}
                        <div className="settings-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <Mail size={20} />
                                </div>
                                <div className="section-info">
                                    <h2 className="section-title">Email Verification</h2>
                                    <p className="section-description">Verify your email address for security</p>
                                </div>
                            </div>
                            <div className="section-content">
                                <div className="verification-status">
                                    <div className="status-indicator verified">
                                        <Check size={16} />
                                        <span>Email Verified</span>
                                    </div>
                                    <p className="status-description">Your email address has been verified.</p>
                                </div>
                                <div className="form-actions">
                                    <button className="btn btn-outline">Resend Verification Email</button>
                                    <button className="btn btn-outline">Change Email Address</button>
                                </div>
                            </div>
                        </div>

                        {/* Password & Security */}
                        <div className="settings-section">
                            <div className="section-header">
                                <div className="section-icon">
                                    <Lock size={20} />
                                </div>
                                <div className="section-info">
                                    <h2 className="section-title">Password & Security</h2>
                                    <p className="section-description">Update your password and security settings</p>
                                </div>
                            </div>
                            <div className="section-content">
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            className="form-input"
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => setShowCurrentPassword(!showCurrentPassword)}>
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            className="form-input"
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => setShowNewPassword(!showNewPassword)}>
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <div className="password-input">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className="form-input"
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                        />
                                        <button type="button" className="password-toggle" onClick={() => setShowConfirmPassword(!showConfirmPassword)}>
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                <div className="password-requirements">
                                    <p className="requirements-title">Password requirements:</p>
                                    <ul className="requirements-list">
                                        <li>At least 8 characters long</li>
                                        <li>Contains at least one uppercase letter</li>
                                        <li>Contains at least one lowercase letter</li>
                                        <li>Contains at least one number</li>
                                        <li>Contains at least one special character</li>
                                    </ul>
                                </div>
                                <div className="form-actions">
                                    <button className="btn btn-primary" onClick={handlePasswordUpdate}>Update Password</button>
                                    <button className="btn btn-secondary" onClick={handlePasswordCancel}>Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <Toast toasts={toasts} removeToast={removeToast} />
        </AuthGuard>
    )
}

export default Settings