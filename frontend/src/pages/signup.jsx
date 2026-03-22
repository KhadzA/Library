"use client"

import { useState } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { registerUser } from "../api/auth"
import "./signup.css"
import Toast, { useToast } from "../components/toast/Toast.jsx"
import { Eye, EyeOff, Loader2, Home } from "lucide-react"

function Signup() {
    const navigate = useNavigate()
    const location = useLocation()
    const { toast, toasts, removeToast } = useToast()

    // Check for password mismatch error from URL
    const queryParams = new URLSearchParams(location.search)
    const passwordMismatch = queryParams.get("password_match") === "false"

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [department, setDepartment] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirmPassword, setShowConfirmPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    // eslint-disable-next-line no-unused-vars
    const [passwordError, setPasswordError] = useState("")
    // eslint-disable-next-line no-unused-vars
    const [emailError, setEmailError] = useState("")

    const validateEmail = (email) => {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
        return emailRegex.test(email)
    }

    const handleSignup = async () => {
        // Validate password length
        if (password.length < 6) {
            toast.error("Password must be at least 6 characters long.")
            return
        }

        // Validate password match
        if (password !== confirmPassword) {
            toast.error("Passwords do not match. Please try again.")
            return
        }

        // Validate required fields
        if (!email || !username || !department || !password) {
            toast.error("Please fill in all required fields.")
            return
        }

        setIsLoading(true)

        try {
            const result = await registerUser(email, username, department, password)

            if (result.success) {
                toast.success("Registration successful! Redirecting to login...")
                setTimeout(() => {
                    navigate("/auth/login?registration_success=true")
                }, 1500)
            } else {
                // Use the message from the backend instead of a hardcoded one
                toast.error(result.message || "Registration failed. Please try again.")
                setIsLoading(false)
            }
        } catch (error) {
            toast.error("An error occurred during registration. Please try again.", error)
            setIsLoading(false)
        }
    }

    return (
        <div className="signup-container">
            <div className="signup-card">
                <div className="signup-header">
                    <h1 className="signup-title">Create Account</h1>
                    <p className="signup-subtitle">Sign up for your library account</p>
                </div>

                {passwordMismatch && <div className="error-message">Passwords do not match. Please try again.</div>}

                <form
                    className="signup-form"
                    onSubmit={(e) => {
                        e.preventDefault()
                        handleSignup()
                    }}
                >
                    <div className="form-group">
                        <label htmlFor="email" className="form-label">
                            Email Address
                        </label>
                        <input
                            id="email"
                            type="email"
                            placeholder="Enter your email"
                            value={email}
                            onChange={(e) => {
                                setEmail(e.target.value)
                                if (e.target.value.length > 0 && !validateEmail(e.target.value)) {
                                    setEmailError("Please enter a valid email address")
                                } else {
                                    setEmailError("")
                                }
                            }}
                            className={`form-input ${email.length > 0 ? (validateEmail(email) ? "success" : "error") : ""}`}
                            required
                            disabled={isLoading}
                        />
                        {email.length > 0 && (
                            <div className="email-requirements">
                                <div className={`requirement ${validateEmail(email) ? "valid" : "invalid"}`}>
                                    {validateEmail(email) ? "✓" : "✕"} Valid email format
                                </div>
                            </div>
                        )}
                    </div>

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
                        <label htmlFor="department" className="form-label">
                            Department
                        </label>
                        <input
                            id="department"
                            type="text"
                            placeholder="Enter your department"
                            value={department}
                            onChange={(e) => setDepartment(e.target.value)}
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
                                onChange={(e) => {
                                    setPassword(e.target.value)
                                    if (e.target.value.length > 0 && e.target.value.length < 6) {
                                        setPasswordError("Password must be at least 6 characters long")
                                    } else {
                                        setPasswordError("")
                                    }
                                }}
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
                        {password.length > 0 && (
                            <div className="password-requirements">
                                <div className={`requirement ${password.length >= 6 ? "valid" : "invalid"}`}>
                                    {password.length >= 6 ? "✓" : "✕"} At least 6 characters
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="form-group">
                        <label htmlFor="confirmPassword" className="form-label">
                            Confirm Password
                        </label>
                        <div className="password-input-container">
                            <input
                                id="confirmPassword"
                                type={showConfirmPassword ? "text" : "password"}
                                placeholder="Confirm your password"
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="form-input password-input"
                                required
                                disabled={isLoading}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                className="password-toggle"
                                aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                                disabled={isLoading}
                            >
                                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                            </button>
                        </div>
                        {confirmPassword.length > 0 && (
                            <div className="password-requirements">
                                <div className={`requirement ${password === confirmPassword ? "valid" : "invalid"}`}>
                                    {password === confirmPassword ? "✓" : "✕"} Passwords match
                                </div>
                            </div>
                        )}
                    </div>

                    <button
                        type="submit"
                        className="signup-button"
                        disabled={isLoading || !email || !username || !department || !password || !confirmPassword}
                    >
                        {isLoading ? (
                            <>
                                <Loader2 size={18} className="loading-spinner" />
                                Creating Account...
                            </>
                        ) : (
                            "Create Account"
                        )}
                    </button>

                    <div className="login-link">
                        Already have an account?{" "}
                        <button type="button" onClick={() => navigate("/auth/login")} className="link-button" disabled={isLoading}>
                            Sign in here
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

export default Signup
