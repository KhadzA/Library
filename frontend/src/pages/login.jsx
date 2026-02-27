"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { loginUser, activeStatus } from "../api/auth"
import { jwtDecode } from "jwt-decode"
import "./login.css"
import Toast, { useToast } from "../components/toast/Toast.jsx"
import { Eye, EyeOff, Loader2, Home } from "lucide-react"

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { toast, toasts, removeToast } = useToast()

    // For future toast notif
    const queryParams = new URLSearchParams(location.search)
    const registrationSuccess = queryParams.get("registration_success") === "true"

    const [username, setUsername] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRemember] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const handleLogin = async () => {
        setIsLoading(true)

        try {
            const result = await loginUser(username, password, rememberMe)

            if (result.success) {
                console.log("Logged in!", result.data)
                const { token } = result.data
                const decoded = jwtDecode(token)
                const role = decoded.role

                localStorage.setItem("userRole", role)

                // Show success toast
                toast.success("Login successful! Redirecting...")

                // Role-based redirect
                if (role === "admin") {
                    navigate("/dashboard?login_success=true")
                } else if (role === "librarian") {
                    navigate("/books?login_success=true")
                } else if (role === "student") {
                    navigate("/books?login_success=true")
                } else {
                    toast.error("Unknown role. Cannot navigate.")
                    setIsLoading(false)
                    return
                }

                const activeStatusResult = await activeStatus("active")
                if (activeStatusResult.success) {
                    console.log("User status updated to active")
                }
            } else {
                toast.error("Login failed. Please check your credentials.")
                setIsLoading(false)
            }
        } catch (error) {
            toast.error("An error occurred during login. Please try again.", error)
            setIsLoading(false)
        }
    }

    return (
        <div className="login-container">
            <div className="login-card">
                <div className="login-header">
                    <h1 className="login-title">Welcome Back</h1>
                    <p className="login-subtitle">Sign in to your account</p>
                </div>

                {registrationSuccess && <div className="success-message">Registration successful! Please log in.</div>}

                <form
                    className="login-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleLogin()
                    }}
                >
                    <div className="form-group">
                        <label htmlFor="username" className="form-label">
                            Username
                        </label>
                        <input
                            id="username"
                            type="text"
                            placeholder="Enter your username"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            className="form-input"
                            required
                            disabled={isLoading}
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="password" className="form-label">
                            Password
                        </label>
                        <div className="password-input-container">
                            <input
                                id="password"
                                type={showPassword ? "text" : "password"}
                                placeholder="Enter your password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="form-input password-input"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="password-toggle"
                                aria-label={showPassword ? "Hide password" : "Show password"}
                                disabled={isLoading}
                            >
                                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                    </div>

                    <div className="checkbox-group">
                        <input
                            id="remember"
                            type="checkbox"
                            checked={rememberMe}
                            onChange={(e) => setRemember(e.target.checked)}
                            className="form-checkbox"
                            disabled={isLoading}
                        />
                        <label htmlFor="remember" className="checkbox-label">
                            Remember me
                        </label>
                    </div>

                    <button type="submit" className="login-button" disabled={isLoading || !username || !password}>
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="loading-spinner" />
                                Signing in...
                            </>
                        ) : (
                            "Sign In"
                        )}
                    </button>

                    <div className="signup-link">
                        Don't have an account?{" "}
                        <button type="button" onClick={() => navigate("/auth/signup")} className="link-button" disabled={isLoading}>
                            Sign up here
                        </button>
                    </div>
                </form>
            </div>

            <div className="back-home">
                <button type="button" onClick={() => navigate("/")} className="back-home-button" disabled={isLoading}>
                    <Home size={16} />
                    Back to Home
                </button>
            </div>

            <Toast toasts={toasts} removeToast={removeToast} />
        </div>
    )
}

export default Login
