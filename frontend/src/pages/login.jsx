"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { loginUser, activeStatus } from "../api/auth"
import { jwtDecode } from "jwt-decode"
import "./login.css"
import Toast, { useToast } from "../components/toast/Toast.jsx"
import { Eye, EyeOff, Loader2, BookOpen, ArrowLeft } from "lucide-react"

function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { toast, toasts, removeToast } = useToast()

    const queryParams = new URLSearchParams(location.search)
    const registrationSuccess = queryParams.get("registration_success") === "true"

    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRemember] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        const saved = localStorage.getItem("theme") || "dark"
        document.documentElement.setAttribute("data-theme", saved)
        // Add this line so Tailwind dark: variants work
        if (saved === "dark") document.documentElement.classList.add("dark")
        else document.documentElement.classList.remove("dark")
    }, [])

    const handleLogin = async () => {
        setIsLoading(true)
        try {
            const result = await loginUser(identifier, password, rememberMe)

            if (result.success) {
                const { token } = result.data
                const decoded = jwtDecode(token)
                const role = decoded.role
                localStorage.setItem("userRole", role)
                toast.success("Welcome back!", "Redirecting you now...")

                if (role === "admin") navigate("/dashboard?login_success=true")
                else if (role === "librarian") navigate("/books?login_success=true")
                else if (role === "student") navigate("/books?login_success=true")
                else {
                    toast.error("Unknown role", "Cannot navigate.")
                    setIsLoading(false)
                    return
                }

                await activeStatus()
            } else {
                const msg = result.error?.response?.data?.message || "Invalid credentials"
                toast.error("Login failed", msg)
                setIsLoading(false)
            }
        } catch {
            toast.error("Something went wrong", "Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="login-page">
            {/* Left brand panel */}
            <aside className="login-brand">
                <div className="brand-logo">
                    <BookOpen size={28} />
                    <span>AlimBrary</span>
                </div>
                <div className="brand-body">
                    <h2 className="brand-tagline">
                        Your campus library,<br /><em>digitized.</em>
                    </h2>
                    <p className="brand-desc">
                        Browse thousands of books, track your reading sessions, and manage library resources — all in one place.
                    </p>
                </div>
                <span className="brand-footer">© 2025 AlimBrary · Student Project</span>
            </aside>

            {/* Right form panel */}
            <main className="login-form-panel">
                <div className="login-form-inner">
                    <div className="form-heading">
                        <h1>Welcome back</h1>
                        <p>Sign in to your account</p>
                    </div>

                    {registrationSuccess && (
                        <div className="success-banner">
                            Account created successfully — you can now sign in.
                        </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleLogin() }}>
                        <div className="field">
                            <label className="field-label">Username or Email</label>
                            <div className="input-wrap">
                                <input
                                    type="text"
                                    className="field-input"
                                    placeholder="Enter username or email"
                                    value={identifier}
                                    onChange={(e) => setIdentifier(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        <div className="field">
                            <label className="field-label">Password</label>
                            <div className="input-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className="field-input"
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    style={{ paddingRight: "2.75rem" }}
                                />
                                <button
                                    type="button"
                                    className="pw-toggle"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    aria-label={showPassword ? "Hide" : "Show"}
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="remember-row">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRemember(e.target.checked)}
                                disabled={isLoading}
                            />
                            <label htmlFor="remember">Remember me for 30 days</label>
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading || !identifier || !password}
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="spinner" /> Signing in...</>
                                : "Sign In"
                            }
                        </button>

                        <p className="form-footer">
                            Don't have an account?{" "}
                            <button type="button" onClick={() => navigate("/auth/signup")} disabled={isLoading}>
                                Sign up here
                            </button>
                        </p>
                    </form>

                    <button className="back-link" onClick={() => navigate("/")}>
                        <ArrowLeft size={14} /> Back to Home
                    </button>
                </div>
            </main>

            <Toast toasts={toasts} removeToast={removeToast} />
        </div>
    )
}

export default Login