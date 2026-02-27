"use client"

import { useState, useEffect } from "react"
import AuthGuard from "../../components/AuthGuard"
import { useSocketConnection } from "../../hooks/useSocketConnection"
import { Mail, Lock, User, Palette, Check, Eye, EyeOff, Moon, Sun } from "lucide-react"
import "./settings.css"

function Settings() {
    useSocketConnection()

    const [theme, setTheme] = useState("light")
    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    // Load theme from localStorage on component mount
    useEffect(() => {
        const savedTheme = localStorage.getItem("theme") || "light"
        setTheme(savedTheme)
        document.documentElement.setAttribute("data-theme", savedTheme)
    }, [])

    // Handle theme toggle
    const handleThemeToggle = (newTheme) => {
        setTheme(newTheme);
        localStorage.setItem("theme", newTheme);
        document.documentElement.setAttribute("data-theme", newTheme);
    };

    return (
        <AuthGuard allowedRoles={["admin", "librarian", "student"]}>
            <div className="settings-page">
                <div className="settings-container">
                    <div className="settings-header">
                        <h1 className="settings-title">Settings</h1>
                        <p className="settings-subtitle">Manage your account preferences and security settings</p>
                    </div>

                    <div className="settings-content">
                        {/* Theme Settings - Functional */}
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

                        {/* Account Information - Dummy */}
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
                                        defaultValue="John Doe"
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email Address</label>
                                    <input
                                        type="email"
                                        className="form-input"
                                        defaultValue="john.doe@university.edu"
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Department</label>
                                    <select className="form-select">
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
                                    <button className="btn btn-primary">Save Changes</button>
                                    <button className="btn btn-secondary">Cancel</button>
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
                                    <p className="status-description">Your email address john.doe@university.edu has been verified.</p>
                                </div>
                                <div className="form-actions">
                                    <button className="btn btn-outline">Resend Verification Email</button>
                                    <button className="btn btn-outline">Change Email Address</button>
                                </div>
                            </div>
                        </div>

                        {/* Password Reset - Dummy */}
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
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
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
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
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
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            className="password-toggle"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
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
                                    <button className="btn btn-primary">Update Password</button>
                                    <button className="btn btn-secondary">Cancel</button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}

export default Settings
