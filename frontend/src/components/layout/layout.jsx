"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logoutUser, inactiveStatus } from "../../api/auth"
import { getAvatarColor } from "../../api/settings"
import { X, LogOut, Loader2, Home, BookOpen, Menu, ChevronLeft, Users, Settings } from "lucide-react"

function PageLayout({ children }) {
    const navigate = useNavigate()
    const [userRole, setUserRole] = useState(null)
    const [userName, setUserName] = useState("")
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)
    const [avatarColor, setAvatarColor] = useState(localStorage.getItem("avatarColor") || "#3b82f6")

    useEffect(() => {
        const role = localStorage.getItem("userRole")
        const name = localStorage.getItem("user") || "User"
        setUserRole(role)
        setUserName(name)

        getAvatarColor().then((res) => {
            if (res.success) {
                setAvatarColor(res.data.color)
                localStorage.setItem("avatarColor", res.data.color)
            }
        })

        const handleColorChange = (e) => setAvatarColor(e.detail.color)
        window.addEventListener("avatarColorChanged", handleColorChange)
        return () => window.removeEventListener("avatarColorChanged", handleColorChange)
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)
        try {
            const inactiveStatusResult = await inactiveStatus("active")
            if (inactiveStatusResult.success) {
                const result = await logoutUser(navigate)
                if (!result.success) {
                    alert("Logout failed.", result.error)
                    setIsLoggingOut(false)
                    setShowLogoutModal(false)
                }
            }
        } catch (error) {
            alert("An error occurred during logout.", error)
            setIsLoggingOut(false)
            setShowLogoutModal(false)
        }
    }

    const openLogoutModal = () => setShowLogoutModal(true)
    const closeLogoutModal = () => { if (!isLoggingOut) setShowLogoutModal(false) }
    const toggleSidebar = () => setSidebarCollapsed(!sidebarCollapsed)
    const toggleMobileSidebar = () => setSidebarOpen(!sidebarOpen)

    const getUserInitials = (name) => {
        if (!name) return "U"
        const names = name.trim().split(" ")
        if (names.length === 1) return names[0].charAt(0).toUpperCase()
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase()
    }

    // ─── Reusable nav button ─────────────────────────────────────────────────────
    const NavButton = ({ onClick, icon, label, isLogout = false }) => (
        <button
            onClick={onClick}
            className={[
                "flex items-center w-full py-3 px-6 border-none text-sm font-medium cursor-pointer",
                "transition-colors duration-200 relative",
                isLogout
                    ? "text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600"
                    : "text-slate-500 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700/60 hover:text-slate-700 dark:hover:text-slate-200",
            ].join(" ")}
        >
            <div className="flex items-center justify-center w-5 h-5 shrink-0">
                {icon}
            </div>
            <span
                className={[
                    "ml-3 whitespace-nowrap transition-opacity duration-200",
                    // Desktop: hide when collapsed. Mobile: always show.
                    sidebarCollapsed
                        ? "opacity-0 pointer-events-none max-md:opacity-100 max-md:pointer-events-auto"
                        : "opacity-100",
                ].join(" ")}
            >
                {label}
            </span>
        </button>
    )

    return (
        <div className="flex min-h-screen bg-slate-50 dark:bg-slate-900 font-[DM_Sans,sans-serif] min-w-[320px] transition-colors duration-300">

            {/* ── Header ──────────────────────────────────────────────────────── */}
            <header className="fixed top-0 left-0 right-0 h-16 bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 z-100 shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-colors duration-300">
                <div className="flex items-center justify-between h-full px-4 max-w-full">
                    {/* Left */}
                    <div className="flex items-center">
                        {/* Mobile hamburger */}
                        <button
                            className="md:hidden flex items-center justify-center bg-transparent border-none text-slate-500 dark:text-slate-400 cursor-pointer p-2 rounded-md transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                            onClick={toggleMobileSidebar}
                        >
                            <Menu size={20} />
                        </button>
                        {/* Desktop toggle */}
                        <button
                            className="hidden md:flex items-center justify-center bg-transparent border-none text-slate-500 dark:text-slate-400 cursor-pointer p-2 rounded-md transition-colors duration-200 hover:bg-slate-100 dark:hover:bg-slate-700 hover:text-slate-700 dark:hover:text-slate-200"
                            onClick={toggleSidebar}
                        >
                            {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </button>
                        {/* Logo */}
                        <div className="flex items-center gap-2 text-2xl font-bold text-slate-800 dark:text-slate-50 ml-4 transition-colors duration-300 max-[480px]:text-xl">
                            <BookOpen size={24} />
                            <span>AlimBrary</span>
                        </div>
                    </div>

                    {/* Right */}
                    <div className="flex items-center">
                        <div
                            className="w-9 h-9 rounded-full flex items-center justify-center text-white text-sm font-semibold cursor-pointer transition-[filter] duration-200 hover:brightness-90"
                            style={{ backgroundColor: avatarColor }}
                            onClick={() => navigate("/settings")}
                        >
                            {getUserInitials(userName)}
                        </div>
                    </div>
                </div>
            </header>

            {/* ── Sidebar ─────────────────────────────────────────────────────── */}
            <aside
                className={[
                    "fixed top-16 left-0 z-50 h-[calc(100vh-64px)]",
                    "bg-white dark:bg-slate-800",
                    "border-r border-slate-200 dark:border-slate-700",
                    "transition-[width,transform] duration-300",
                    // Mobile: always 250px wide, slide in/out
                    "w-62.5",
                    sidebarOpen ? "translate-x-0" : "-translate-x-full",
                    // Desktop: always visible, width toggles
                    sidebarCollapsed ? "md:w-17.5 md:translate-x-0" : "md:w-62.5 md:translate-x-0",
                ].join(" ")}
            >
                <div className="py-4 h-full flex flex-col justify-between">
                    {/* Nav links */}
                    <div className="flex flex-col gap-1">
                        {userRole !== "student" && (
                            <NavButton
                                onClick={() => navigate("/dashboard")}
                                icon={<Home size={20} />}
                                label="Dashboard"
                            />
                        )}
                        <NavButton
                            onClick={() => navigate("/books")}
                            icon={<BookOpen size={20} />}
                            label="Books"
                        />
                        {userRole !== "student" && (
                            <NavButton
                                onClick={() => navigate("/users")}
                                icon={<Users size={20} />}
                                label="Users"
                            />
                        )}
                        <NavButton
                            onClick={() => navigate("/settings")}
                            icon={<Settings size={20} />}
                            label="Settings"
                        />
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-4 transition-colors duration-300">
                        <NavButton
                            onClick={openLogoutModal}
                            icon={<LogOut size={20} />}
                            label="Logout"
                            isLogout
                        />
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && (
                <div
                    className="md:hidden fixed top-16 left-0 right-0 bottom-0 bg-black/50 z-40"
                    onClick={toggleMobileSidebar}
                />
            )}

            {/* ── Main content ────────────────────────────────────────────────── */}
            <div
                className={[
                    "mt-16 flex-1 flex flex-col min-h-[calc(100vh-64px)]",
                    "transition-[margin-left] duration-300",
                    "ml-0",
                    sidebarCollapsed ? "md:ml-17.5" : "md:ml-62.5",
                ].join(" ")}
            >
                <main className="flex-1 bg-slate-50 dark:bg-slate-900 transition-colors duration-300">
                    {children}
                </main>
                <footer className="bg-white dark:bg-slate-800 border-t border-slate-200 dark:border-slate-700 py-4 mt-auto transition-colors duration-300">
                    <div className="text-center text-slate-500 dark:text-slate-400 text-sm px-8 max-md:px-4 transition-colors duration-300">
                        ©2025 AlimBrary. All rights reserved.
                    </div>
                </footer>
            </div>

            {/* ── Logout Modal ─────────────────────────────────────────────────── */}
            {showLogoutModal && (
                <div
                    className="fixed inset-0 bg-black/50 flex items-center justify-center z-1000 p-4 backdrop-blur-sm"
                    onClick={closeLogoutModal}
                >
                    <div
                        className="bg-white dark:bg-slate-800 rounded-xl shadow-[0_20px_25px_-5px_rgba(0,0,0,0.1),0_10px_10px_-5px_rgba(0,0,0,0.04)] w-full max-w-100 border border-slate-200 dark:border-slate-700 animate-[modalSlideIn_0.2s_ease-out] max-md:mx-4 transition-colors duration-300"
                        onClick={(e) => e.stopPropagation()}
                    >
                        {/* Modal header */}
                        <div className="flex items-center justify-between px-6 pt-6 bg-white dark:bg-slate-800 rounded-t-xl transition-colors duration-300">
                            <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                Confirm Logout
                            </h2>
                            <button
                                className="bg-transparent border-none cursor-pointer p-2 text-gray-500 dark:text-slate-400 rounded-md transition-all duration-200 flex items-center justify-center hover:text-gray-700 dark:hover:text-slate-200 hover:bg-gray-100 dark:hover:bg-slate-700 disabled:text-gray-300 dark:disabled:text-slate-600 disabled:cursor-not-allowed focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                                onClick={closeLogoutModal}
                                disabled={isLoggingOut}
                            >
                                <X size={20} />
                            </button>
                        </div>

                        {/* Modal body */}
                        <div className="p-6 text-center">
                            <div className="flex justify-center mb-4 text-red-500">
                                <LogOut size={48} />
                            </div>
                            <p className="text-slate-500 dark:text-slate-400 text-sm leading-relaxed m-0 transition-colors duration-300">
                                Are you sure you want to logout? You will need to sign in again to access your account.
                            </p>
                        </div>

                        {/* Modal footer */}
                        <div className="flex gap-3 px-6 pb-6 max-md:flex-col">
                            <button
                                className="flex-1 py-3 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 bg-white dark:bg-slate-700 text-gray-700 dark:text-slate-200 border border-gray-300 dark:border-slate-600 hover:bg-gray-50 dark:hover:bg-slate-600 hover:border-gray-400 dark:hover:border-slate-500 disabled:bg-gray-50 disabled:text-gray-400 disabled:cursor-not-allowed max-md:w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                                onClick={closeLogoutModal}
                                disabled={isLoggingOut}
                            >
                                Cancel
                            </button>
                            <button
                                className="flex-1 py-3 px-4 rounded-md text-sm font-medium cursor-pointer transition-all duration-200 flex items-center justify-center gap-2 bg-red-500 text-white border border-red-500 hover:bg-red-600 hover:border-red-600 disabled:bg-gray-400 disabled:border-gray-400 disabled:cursor-not-allowed max-md:w-full focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                                onClick={handleLogout}
                                disabled={isLoggingOut}
                            >
                                {isLoggingOut ? (
                                    <>
                                        <Loader2 size={16} className="animate-spin" />
                                        Logging out...
                                    </>
                                ) : (
                                    "Yes, Logout"
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default PageLayout