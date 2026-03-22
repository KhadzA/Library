"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../api/auth"
import "./signup.css"
import Toast, { useToast } from "../components/toast/Toast.jsx"
import { Eye, EyeOff, Loader2, BookOpen, ArrowLeft } from "lucide-react"

function Signup() {
    const navigate = useNavigate()
    const { toast, toasts, removeToast } = useToast()

    const [email, setEmail] = useState("")
    const [username, setUsername] = useState("")
    const [department, setDepartment] = useState("")
    const [password, setPassword] = useState("")
    const [confirmPassword, setConfirmPassword] = useState("")
    const [showPassword, setShowPassword] = useState(false)
    const [showConfirm, setShowConfirm] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const passwordValid = password.length >= 6
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

    useEffect(() => {
        const saved = localStorage.getItem("theme") || "dark"
        document.documentElement.setAttribute("data-theme", saved)
        // Add this line so Tailwind dark: variants work
        if (saved === "dark") document.documentElement.classList.add("dark")
        else document.documentElement.classList.remove("dark")
    }, [])

    const handleSignup = async () => {
        if (!emailValid) { toast.error("Invalid email", "Enter a valid email address."); return }
        if (!passwordValid) { toast.error("Weak password", "Password must be at least 6 characters."); return }
        if (!passwordsMatch) { toast.error("Mismatch", "Passwords do not match."); return }
        if (!email || !username || !department || !password) { toast.error("Missing fields", "Please fill in all fields."); return }

        setIsLoading(true)

        try {
            const result = await registerUser(email, username, department, password)

            if (result.success) {
                toast.success("Account created!", "Redirecting to login...")
                setTimeout(() => navigate("/auth/login?registration_success=true"), 1500)
            } else {
                toast.error("Registration failed", result.message || "Please try again.")
                setIsLoading(false)
            }
        } catch {
            toast.error("Something went wrong", "Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="signup-page">
            {/* Left brand panel */}
            <aside className="signup-brand">
                <div className="brand-logo">
                    <BookOpen size={28} />
                    <span>AlimBrary</span>
                </div>
                <div className="brand-body">
                    <h2 className="brand-tagline">
                        Join the<br /><em>library.</em>
                    </h2>
                    <p className="brand-desc">
                        Create your account to browse books, track reading sessions, and access your digital campus library.
                    </p>
                </div>
                <span className="brand-footer">© 2025 AlimBrary · Student Project</span>
            </aside>

            {/* Right form panel */}
            <main className="signup-form-panel">
                <div className="signup-form-inner">
                    <div className="form-heading">
                        <h1>Create account</h1>
                        <p>Sign up for your library access</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSignup() }}>
                        {/* Email — full width */}
                        <div className="field">
                            <label className="field-label">
                                Email Address
                                {email.length > 0 && (
                                    <span className={`field-hint ${emailValid ? "valid" : "invalid"}`}>
                                        {emailValid ? "✓ valid" : "✕ invalid format"}
                                    </span>
                                )}
                            </label>
                            <div className="input-wrap">
                                <input
                                    type="email"
                                    className={`field-input ${email.length > 0 ? (emailValid ? "is-valid" : "is-invalid") : ""}`}
                                    placeholder="you@example.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    required
                                    disabled={isLoading}
                                />
                            </div>
                        </div>

                        {/* Username + Department side by side */}
                        <div className="field-row">
                            <div className="field">
                                <label className="field-label">Username</label>
                                <div className="input-wrap">
                                    <input
                                        type="text"
                                        className="field-input"
                                        placeholder="Your name"
                                        value={username}
                                        onChange={(e) => setUsername(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                            <div className="field">
                                <label className="field-label">Department</label>
                                <div className="input-wrap">
                                    <input
                                        type="text"
                                        className="field-input"
                                        placeholder="e.g. BSIT"
                                        value={department}
                                        onChange={(e) => setDepartment(e.target.value)}
                                        required
                                        disabled={isLoading}
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Password */}
                        <div className="field">
                            <label className="field-label">
                                Password
                                {password.length > 0 && (
                                    <span className={`field-hint ${passwordValid ? "valid" : "invalid"}`}>
                                        {passwordValid ? "✓ strong enough" : "✕ min 6 chars"}
                                    </span>
                                )}
                            </label>
                            <div className="input-wrap">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    className={`field-input ${password.length > 0 ? (passwordValid ? "is-valid" : "is-invalid") : ""}`}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    style={{ paddingRight: "2.75rem" }}
                                />
                                <button type="button" className="pw-toggle" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}>
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm password */}
                        <div className="field">
                            <label className="field-label">
                                Confirm Password
                                {confirmPassword.length > 0 && (
                                    <span className={`field-hint ${passwordsMatch ? "valid" : "invalid"}`}>
                                        {passwordsMatch ? "✓ match" : "✕ no match"}
                                    </span>
                                )}
                            </label>
                            <div className="input-wrap">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    className={`field-input ${confirmPassword.length > 0 ? (passwordsMatch ? "is-valid" : "is-invalid") : ""}`}
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    style={{ paddingRight: "2.75rem" }}
                                />
                                <button type="button" className="pw-toggle" onClick={() => setShowConfirm(!showConfirm)} disabled={isLoading}>
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="submit-btn"
                            disabled={isLoading || !email || !username || !department || !password || !confirmPassword}
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="spinner" /> Creating account...</>
                                : "Create Account"
                            }
                        </button>

                        <p className="form-footer">
                            Already have an account?{" "}
                            <button type="button" onClick={() => navigate("/auth/login")} disabled={isLoading}>
                                Sign in here
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

export default Signup