"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { logoutUser, inactiveStatus } from "../../api/auth"
import "./layout.css"
import { X, LogOut, Loader2, Home, BookOpen, Menu, ChevronLeft, Users, Settings } from "lucide-react"

function PageLayout({ children }) {
    localStorage.setItem("librarian", "admin")
    const navigate = useNavigate()
    const [userRole, setUserRole] = useState(null)
    const [userName, setUserName] = useState("")
    const [showLogoutModal, setShowLogoutModal] = useState(false)
    const [isLoggingOut, setIsLoggingOut] = useState(false)
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true)
    const [sidebarOpen, setSidebarOpen] = useState(false)

    useEffect(() => {
        const role = localStorage.getItem("userRole")
        const name = localStorage.getItem("user") || "User"
        setUserRole(role)
        setUserName(name)
    }, [])

    const handleLogout = async () => {
        setIsLoggingOut(true)

        try {
            const inactiveStatusResult = await inactiveStatus("active")

            if (inactiveStatusResult.success) {
                console.log("User status updated to inactive")

                const result = await logoutUser(navigate)
                if (result.success) {
                    console.log("Logged out!", result.data)
                    navigate("/auth/login?logout_success=true")
                } else {
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

    const openLogoutModal = () => {
        setShowLogoutModal(true)
    }

    const closeLogoutModal = () => {
        if (!isLoggingOut) {
            setShowLogoutModal(false)
        }
    }

    const toggleSidebar = () => {
        setSidebarCollapsed(!sidebarCollapsed)
    }

    const toggleMobileSidebar = () => {
        setSidebarOpen(!sidebarOpen)
    }

    // Get user initials for avatar
    const getUserInitials = (name) => {
        if (!name) return "U";
        const names = name.trim().split(" ");
        if (names.length === 1) {
            return names[0].charAt(0).toUpperCase();
        }
        return (names[0].charAt(0) + names[names.length - 1].charAt(0)).toUpperCase();
    };

    return (
        <div className="mainLayout">
            <header className="headerLayout">
                <div className="headerContent">
                    <div className="headerLeft">
                        <button className="sidebarToggle mobile-only" onClick={toggleMobileSidebar}>
                            <Menu size={20} />
                        </button>
                        <button className="sidebarToggle desktop-only" onClick={toggleSidebar}>
                            {sidebarCollapsed ? <Menu size={20} /> : <ChevronLeft size={20} />}
                        </button>

                        <div className="logo">
                            <BookOpen size={24} />
                            <span>AlimBrary</span>
                        </div>
                    </div>

                    <div className="headerRight">
                        <div className="user-profile">
                            <div className="user-avatar">{getUserInitials(userName)}</div>
                        </div>
                    </div>
                </div>
            </header>

            <aside className={`navigationLayout ${sidebarCollapsed ? "collapsed" : ""} ${sidebarOpen ? "mobile-open" : ""}`}>
                <div className="navContent">
                    <div className="navMain">
                        {userRole !== "student" && (
                            <button onClick={() => navigate("/dashboard")} className="nav-button">
                                <div className="nav-icon">
                                    <Home size={20} />
                                </div>
                                <span className="nav-text">Dashboard</span>
                            </button>
                        )}
                        <button onClick={() => navigate("/books")} className="nav-button">
                            <div className="nav-icon">
                                <BookOpen size={20} />
                            </div>
                            <span className="nav-text">Books</span>
                        </button>
                        {userRole !== "student" && (
                            <button onClick={() => navigate("/users")} className="nav-button">
                                <div className="nav-icon">
                                    <Users size={20} />
                                </div>
                                <span className="nav-text">Users</span>
                            </button>
                        )}
                        <button onClick={() => navigate("/settings")} className="nav-button">
                            <div className="nav-icon">
                                <Settings size={20} />
                            </div>
                            <span className="nav-text">Settings</span>
                        </button>
                    </div>

                    <div className="navFooter">
                        <button onClick={openLogoutModal} className="nav-button logout-button">
                            <div className="nav-icon">
                                <LogOut size={20} />
                            </div>
                            <span className="nav-text">Logout</span>
                        </button>
                    </div>
                </div>
            </aside>

            {/* Mobile overlay */}
            {sidebarOpen && <div className="mobile-overlay" onClick={toggleMobileSidebar}></div>}

            <div className={`mainContent ${sidebarCollapsed ? "sidebar-collapsed" : ""}`}>
                <main className="contentLayout">{children}</main>

                <footer className="footerLayout">
                    <div className="footerContent">
                        <div>©2025 AlimBrary. All rights reserved.</div>
                    </div>
                </footer>
            </div>

            {/* Logout Confirmation Modal */}
            {showLogoutModal && (
                <div className="modal-overlay" onClick={closeLogoutModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <div className="modal-header">
                            <h2 className="modal-title">Confirm Logout</h2>
                            <button className="modal-close" onClick={closeLogoutModal} disabled={isLoggingOut}>
                                <X size={20} />
                            </button>
                        </div>

                        <div className="modal-body">
                            <div className="logout-icon">
                                <LogOut size={48} />
                            </div>
                            <p className="modal-message">
                                Are you sure you want to logout? You will need to sign in again to access your account.
                            </p>
                        </div>

                        <div className="modal-footer">
                            <button className="modal-button cancel" onClick={closeLogoutModal} disabled={isLoggingOut}>
                                Cancel
                            </button>
                            <button className="modal-button confirm" onClick={handleLogout} disabled={isLoggingOut}>
                                {isLoggingOut ? (
                                    <>
                                        <Loader2 size={16} className="loading-spinner" />
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
