"use client"

import { useState, useEffect } from "react"
import AuthGuard from "../../components/AuthGuard"
import { useSocketConnection } from "../../hooks/useSocketConnection"
import { getProfile, updateProfile, changePassword, getAvatarColor, updateAvatarColor } from "../../api/settings"
import { Settings as SettingsIcon, UserCircle, Mail, Lock, User, Palette, Check, Eye, EyeOff, Moon, Sun } from "lucide-react"
import Toast, { useToast } from "../../components/toast/Toast.jsx"
import { useTheme } from "../../components/ThemeContext"

function Settings() {
    useSocketConnection()

    const { toast, toasts, removeToast } = useToast()
    const { theme, toggleTheme } = useTheme()

    const [name, setName] = useState("")
    const [email, setEmail] = useState("")
    const [department, setDepartment] = useState("")
    const [originalProfile, setOriginalProfile] = useState({})

    const [currentPassword, setCurrentPassword] = useState("")
    const [newPassword, setNewPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")

    const [avatarColor, setAvatarColor] = useState("#3b82f6")

    const [showCurrentPassword, setShowCurrentPassword] = useState(false)
    const [showNewPassword, setShowNewPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)

    useEffect(() => {
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

    // Only toggle when clicking the option that isn't already active
    const handleThemeToggle = (newTheme) => {
        if (newTheme !== theme) toggleTheme()
    }

    // ─── Shared class strings ────────────────────────────────────────────────────

    const inputCls = [
        "w-full py-[0.7rem] px-4",
        "border-[1.5px] border-slate-200 dark:border-slate-600 rounded-[10px]",
        "text-[0.9rem] text-gray-800 dark:text-slate-50",
        "bg-slate-50 dark:bg-slate-700",
        "transition-all duration-200",
        "hover:border-slate-300 dark:hover:border-slate-500",
        "focus:outline-none focus:border-blue-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-[3px] focus:ring-blue-500/10",
        "placeholder:text-slate-400 dark:placeholder:text-slate-500 placeholder:font-light",
    ].join(" ")

    const labelCls = "block text-[0.8rem] font-semibold tracking-[0.04em] uppercase text-slate-400 dark:text-slate-500 mb-2"

    const btnPrimary = [
        "py-[0.6rem] px-5 rounded-[10px] text-sm font-medium cursor-pointer",
        "transition-all duration-200 border-[1.5px] inline-flex items-center justify-center gap-2",
        "bg-blue-500 text-white border-blue-500 shadow-[0_1px_4px_rgba(59,130,246,0.3)]",
        "hover:bg-blue-600 hover:border-blue-600 hover:shadow-[0_2px_8px_rgba(59,130,246,0.4)] hover:-translate-y-px",
        "active:translate-y-0",
    ].join(" ")

    const btnSecondary = [
        "py-[0.6rem] px-5 rounded-[10px] text-sm font-medium cursor-pointer",
        "transition-all duration-200 border-[1.5px] inline-flex items-center justify-center gap-2",
        "bg-transparent text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-600",
        "hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-gray-800 dark:hover:text-slate-50 hover:border-slate-300 dark:hover:border-slate-500",
    ].join(" ")

    const btnOutline = [
        "py-[0.6rem] px-5 rounded-[10px] text-sm font-medium cursor-pointer",
        "transition-all duration-200 border-[1.5px] inline-flex items-center justify-center gap-2",
        "bg-transparent text-blue-500 border-blue-500",
        "hover:bg-blue-50 dark:hover:bg-blue-900/20 hover:-translate-y-px",
    ].join(" ")

    const sectionCard = [
        "bg-white dark:bg-slate-800",
        "border border-slate-200 dark:border-slate-700",
        "rounded-2xl shadow-sm overflow-hidden",
        "transition-shadow duration-200",
        "hover:shadow-md dark:hover:shadow-[0_4px_20px_rgba(0,0,0,0.3)]",
    ].join(" ")

    const sectionHeader = [
        "flex items-center gap-3 px-6 py-3.5",
        "border-b border-slate-200 dark:border-slate-700",
        "bg-slate-100 dark:bg-slate-700/50",
    ].join(" ")

    const formActions = [
        "flex gap-2.5 mt-5 pt-5",
        "border-t border-slate-200 dark:border-slate-700",
        "max-sm:flex-col",
    ].join(" ")

    return (
        <AuthGuard allowedRoles={["admin", "librarian", "student"]}>
            {/* Page wrapper */}
            <div className="p-6 max-sm:p-4 min-[480px]:p-5 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors duration-300">
                <div className="max-w-[820px] mx-auto">

                    {/* ── Page Header ──────────────────────────────────────── */}
                    <div className="flex items-center justify-between bg-white dark:bg-slate-800 py-5 px-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300">
                        <div className="flex items-center gap-3.5">
                            <SettingsIcon size={28} className="text-blue-500" />
                            <div>
                                <h1 className="text-[22px] font-bold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                    Settings
                                </h1>
                                <p className="text-[13px] text-slate-500 dark:text-slate-400 mt-1 m-0 transition-colors duration-300">
                                    Manage your account preferences and security settings
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* ── Sections ─────────────────────────────────────────── */}
                    <div className="flex flex-col gap-5 mt-6">

                        {/* Avatar */}
                        <div className={sectionCard}>
                            <div className={sectionHeader}>
                                <div className="flex items-center justify-center w-7 h-7 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-md shrink-0">
                                    <UserCircle size={16} />
                                </div>
                                <div className="flex-1 flex items-baseline gap-2.5">
                                    <h2 className="text-[0.9rem] font-semibold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                        Avatar
                                    </h2>
                                    <p className="text-[0.775rem] text-slate-400 dark:text-slate-500 m-0 transition-colors duration-300">
                                        Customize your profile avatar
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 max-sm:p-4">
                                {/* Preview row */}
                                <div className="flex items-center gap-5 mb-5 p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl border-[1.5px] border-slate-200 dark:border-slate-700 transition-all duration-300">
                                    <div
                                        className="w-16 h-16 rounded-full flex items-center justify-center text-white text-[1.75rem] font-bold shrink-0 shadow-[0_2px_10px_rgba(0,0,0,0.15)] transition-colors duration-[250ms]"
                                        style={{ backgroundColor: avatarColor }}
                                    >
                                        {name ? name.charAt(0).toUpperCase() : "?"}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm font-medium text-gray-800 dark:text-slate-50 block mb-0.5 transition-colors duration-300">
                                            Avatar Color
                                        </p>
                                        <p className="text-[0.8rem] text-slate-500 dark:text-slate-400 m-0 transition-colors duration-300">
                                            Pick a background color for your avatar
                                        </p>
                                    </div>
                                </div>
                                {/* Color swatches */}
                                <div className="flex gap-2.5 flex-wrap items-center">
                                    {["#3b82f6", "#8b5cf6", "#10b981", "#ef4444", "#f59e0b", "#ec4899", "#06b6d4", "#64748b"].map((color) => (
                                        <button
                                            key={color}
                                            className={[
                                                "w-8 h-8 rounded-full border-[2.5px] cursor-pointer outline-none",
                                                "transition-all duration-150 hover:scale-[1.18] hover:shadow-[0_2px_8px_rgba(0,0,0,0.2)]",
                                                avatarColor === color
                                                    ? "border-gray-800 dark:border-slate-50 scale-[1.18] shadow-[0_2px_8px_rgba(0,0,0,0.2)]"
                                                    : "border-transparent",
                                            ].join(" ")}
                                            style={{ backgroundColor: color }}
                                            onClick={() => handleAvatarColorSave(color)}
                                        />
                                    ))}
                                    <input
                                        type="color"
                                        className="w-8 h-8 rounded-full border-[2.5px] border-slate-200 dark:border-slate-600 cursor-pointer p-0 bg-transparent overflow-hidden transition-all duration-150 hover:border-slate-300 dark:hover:border-slate-500 hover:scale-[1.18]"
                                        value={avatarColor}
                                        onChange={(e) => handleAvatarColorSave(e.target.value)}
                                        title="Custom color"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Appearance / Theme */}
                        <div className={sectionCard}>
                            <div className={sectionHeader}>
                                <div className="flex items-center justify-center w-7 h-7 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-md shrink-0">
                                    <Palette size={16} />
                                </div>
                                <div className="flex-1 flex items-baseline gap-2.5">
                                    <h2 className="text-[0.9rem] font-semibold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                        Appearance
                                    </h2>
                                    <p className="text-[0.775rem] text-slate-400 dark:text-slate-500 m-0 transition-colors duration-300">
                                        Customize how the application looks
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 max-sm:p-4">
                                <div className="flex items-center justify-between gap-4 max-sm:flex-col max-sm:items-start max-sm:gap-3.5">
                                    <div className="flex-1">
                                        <span className="text-sm font-medium text-gray-800 dark:text-slate-50 block mb-0.5 transition-colors duration-300">
                                            Theme
                                        </span>
                                        <p className="text-[0.8rem] text-slate-500 dark:text-slate-400 m-0 transition-colors duration-300">
                                            Choose between light and dark mode
                                        </p>
                                    </div>
                                    {/* Toggle pill */}
                                    <div className="flex bg-slate-50 dark:bg-slate-900 border-[1.5px] border-slate-200 dark:border-slate-700 rounded-[10px] p-[3px] gap-[3px] max-sm:w-full transition-all duration-300">
                                        <button
                                            className={[
                                                "flex items-center gap-1.5 py-[0.45rem] px-3.5 rounded-[7px] text-[0.825rem] font-medium cursor-pointer transition-all duration-200 border-none max-sm:flex-1 max-sm:justify-center",
                                                theme === "light"
                                                    ? "bg-blue-500 text-white shadow-[0_1px_4px_rgba(59,130,246,0.3)]"
                                                    : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-50",
                                            ].join(" ")}
                                            onClick={() => handleThemeToggle("light")}
                                        >
                                            <Sun size={16} />
                                            <span>Light</span>
                                        </button>
                                        <button
                                            className={[
                                                "flex items-center gap-1.5 py-[0.45rem] px-3.5 rounded-[7px] text-[0.825rem] font-medium cursor-pointer transition-all duration-200 border-none max-sm:flex-1 max-sm:justify-center",
                                                theme === "dark"
                                                    ? "bg-blue-500 text-white shadow-[0_1px_4px_rgba(59,130,246,0.3)]"
                                                    : "bg-transparent text-slate-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-slate-50",
                                            ].join(" ")}
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
                        <div className={sectionCard}>
                            <div className={sectionHeader}>
                                <div className="flex items-center justify-center w-7 h-7 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-md shrink-0">
                                    <User size={16} />
                                </div>
                                <div className="flex-1 flex items-baseline gap-2.5">
                                    <h2 className="text-[0.9rem] font-semibold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                        Account Information
                                    </h2>
                                    <p className="text-[0.775rem] text-slate-400 dark:text-slate-500 m-0 transition-colors duration-300">
                                        Update your personal details
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 max-sm:p-4">
                                <div className="mb-5">
                                    <label className={labelCls}>Full Name</label>
                                    <input
                                        type="text"
                                        className={inputCls}
                                        value={name}
                                        onChange={(e) => setName(e.target.value)}
                                        placeholder="Enter your full name"
                                    />
                                </div>
                                <div className="mb-5">
                                    <label className={labelCls}>Email Address</label>
                                    <input
                                        type="email"
                                        className={inputCls}
                                        value={email}
                                        onChange={(e) => setEmail(e.target.value)}
                                        placeholder="Enter your email address"
                                    />
                                </div>
                                <div className="mb-5">
                                    <label className={labelCls}>Department</label>
                                    <select
                                        className={inputCls}
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                    >
                                        <option value="computer-science">Computer Science</option>
                                        <option value="mathematics">Mathematics</option>
                                        <option value="physics">Physics</option>
                                        <option value="chemistry">Chemistry</option>
                                        <option value="biology">Biology</option>
                                        <option value="english">English</option>
                                        <option value="history">History</option>
                                    </select>
                                </div>
                                <div className={formActions}>
                                    <button className={btnPrimary} onClick={handleProfileSave}>Save Changes</button>
                                    <button className={btnSecondary} onClick={handleProfileCancel}>Cancel</button>
                                </div>
                            </div>
                        </div>

                        {/* Email Verification */}
                        <div className={sectionCard}>
                            <div className={sectionHeader}>
                                <div className="flex items-center justify-center w-7 h-7 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-md shrink-0">
                                    <Mail size={16} />
                                </div>
                                <div className="flex-1 flex items-baseline gap-2.5">
                                    <h2 className="text-[0.9rem] font-semibold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                        Email Verification
                                    </h2>
                                    <p className="text-[0.775rem] text-slate-400 dark:text-slate-500 m-0 transition-colors duration-300">
                                        Verify your email address for security
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 max-sm:p-4">
                                <div className="mb-5">
                                    <div className="inline-flex items-center gap-2 py-2 px-3.5 rounded-[20px] text-[0.825rem] font-medium mb-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 transition-all duration-300">
                                        <Check size={16} />
                                        <span>Email Verified</span>
                                    </div>
                                    <p className="text-[0.85rem] text-slate-500 dark:text-slate-400 m-0 leading-relaxed transition-colors duration-300">
                                        Your email address has been verified.
                                    </p>
                                </div>
                                <div className={formActions}>
                                    <button className={btnOutline}>Resend Verification Email</button>
                                    <button className={btnOutline}>Change Email Address</button>
                                </div>
                            </div>
                        </div>

                        {/* Password & Security */}
                        <div className={sectionCard}>
                            <div className={sectionHeader}>
                                <div className="flex items-center justify-center w-7 h-7 bg-blue-50 dark:bg-blue-900/20 text-blue-500 rounded-md shrink-0">
                                    <Lock size={16} />
                                </div>
                                <div className="flex-1 flex items-baseline gap-2.5">
                                    <h2 className="text-[0.9rem] font-semibold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                        Password & Security
                                    </h2>
                                    <p className="text-[0.775rem] text-slate-400 dark:text-slate-500 m-0 transition-colors duration-300">
                                        Update your password and security settings
                                    </p>
                                </div>
                            </div>
                            <div className="p-6 max-sm:p-4">
                                {/* Current Password */}
                                <div className="mb-5">
                                    <label className={labelCls}>Current Password</label>
                                    <div className="relative">
                                        <input
                                            type={showCurrentPassword ? "text" : "password"}
                                            className={inputCls}
                                            value={currentPassword}
                                            onChange={(e) => setCurrentPassword(e.target.value)}
                                            placeholder="Enter current password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 cursor-pointer p-1 rounded-md transition-all duration-200 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center"
                                            onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                                        >
                                            {showCurrentPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                {/* New Password */}
                                <div className="mb-5">
                                    <label className={labelCls}>New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showNewPassword ? "text" : "password"}
                                            className={inputCls}
                                            value={newPassword}
                                            onChange={(e) => setNewPassword(e.target.value)}
                                            placeholder="Enter new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 cursor-pointer p-1 rounded-md transition-all duration-200 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center"
                                            onClick={() => setShowNewPassword(!showNewPassword)}
                                        >
                                            {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                {/* Confirm Password */}
                                <div className="mb-5">
                                    <label className={labelCls}>Confirm New Password</label>
                                    <div className="relative">
                                        <input
                                            type={showConfirmPassword ? "text" : "password"}
                                            className={inputCls}
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            placeholder="Confirm new password"
                                        />
                                        <button
                                            type="button"
                                            className="absolute right-3.5 top-1/2 -translate-y-1/2 bg-transparent border-none text-slate-400 cursor-pointer p-1 rounded-md transition-all duration-200 hover:text-slate-600 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-600 flex items-center"
                                            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        >
                                            {showConfirmPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                        </button>
                                    </div>
                                </div>
                                {/* Requirements */}
                                <div className="mt-4 py-3.5 px-4 bg-slate-50 dark:bg-slate-900/50 rounded-[10px] border-[1.5px] border-slate-200 dark:border-slate-700 transition-all duration-300">
                                    <p className="text-[0.775rem] font-semibold tracking-[0.04em] uppercase text-slate-400 dark:text-slate-500 m-0 mb-2 transition-colors duration-300">
                                        Password requirements:
                                    </p>
                                    <ul className="list-none p-0 m-0 grid grid-cols-2 max-sm:grid-cols-1 gap-y-1 gap-x-4">
                                        {[
                                            "At least 8 characters long",
                                            "Contains at least one uppercase letter",
                                            "Contains at least one lowercase letter",
                                            "Contains at least one number",
                                            "Contains at least one special character",
                                        ].map((req) => (
                                            <li
                                                key={req}
                                                className="text-[0.775rem] text-slate-500 dark:text-slate-400 pl-4 relative transition-colors duration-300 before:content-['·'] before:text-blue-500 before:absolute before:left-0 before:text-xl before:leading-none before:-top-px"
                                            >
                                                {req}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                                <div className={formActions}>
                                    <button className={btnPrimary} onClick={handlePasswordUpdate}>Update Password</button>
                                    <button className={btnSecondary} onClick={handlePasswordCancel}>Cancel</button>
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