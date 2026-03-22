"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../api/auth"
import Toast, { useToast } from "../components/toast/Toast.jsx"
import { Eye, EyeOff, Loader2, ArrowLeft, BookOpen, Users, Zap, CheckCircle, Sun, Moon } from "lucide-react"

/* ─────────────────────────────────────────────
   Shared theme hook — keeps both pages in sync
───────────────────────────────────────────── */
function useTheme() {
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
        if (theme === "dark") document.documentElement.classList.add("dark")
        else document.documentElement.classList.remove("dark")
    }, [theme])

    const toggle = () => setTheme(t => t === "dark" ? "light" : "dark")
    return { theme, toggle }
}

/* ─────────────────────────────────────────────
   Mini sidebar — same brand panel as login
───────────────────────────────────────────── */
function MiniHomeSidebar() {
    const features = [
        { icon: <BookOpen size={16} />, label: "Smart Cataloging", desc: "Search & track your whole collection" },
        { icon: <Users size={16} />, label: "User Management", desc: "Roles for students, staff & admins" },
        { icon: <Zap size={16} />, label: "Lightning Fast", desc: "Instant updates, seamless UX" },
    ]

    const perks = [
        "Modern React interface",
        "Role-based authentication",
        "Responsive on all devices",
    ]

    return (
        <div className="h-full flex flex-col justify-between px-10 py-12 select-none overflow-hidden relative">

            {/* Background glow blobs */}
            <div className="pointer-events-none absolute inset-0 overflow-hidden">
                <div className="absolute -top-20 -left-20 w-72 h-72 rounded-full
                                bg-sky-500/10 dark:bg-sky-400/8 blur-3xl" />
                <div className="absolute bottom-10 right-0 w-56 h-56 rounded-full
                                bg-blue-500/10 dark:bg-blue-400/8 blur-3xl" />
            </div>

            {/* Logo */}
            <div>
                <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-sky-500 flex items-center justify-center shadow-lg shadow-sky-500/30">
                        <BookOpen size={18} className="text-white" />
                    </div>
                    <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
                        AlimBrary
                    </span>
                </div>
                <p className="text-xs text-slate-500 ml-11">Library Management System</p>
            </div>

            {/* Hero text */}
            <div>
                <h2 className="text-3xl font-bold leading-snug tracking-tight mb-3
                               text-slate-900 dark:text-white">
                    Your library,<br />
                    <span className="text-sky-500">your access.</span>
                </h2>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
                    Create your account and start exploring the library catalog, borrow books, and more.
                </p>
            </div>

            {/* Feature cards */}
            <div className="space-y-3">
                {features.map(({ icon, label, desc }) => (
                    <div key={label}
                        className="flex items-start gap-3 p-3 rounded-xl
                                    bg-slate-100 dark:bg-slate-800/60
                                    border border-slate-200 dark:border-slate-700/50">
                        <span className="mt-0.5 shrink-0 text-sky-500">{icon}</span>
                        <div>
                            <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 leading-none mb-0.5">
                                {label}
                            </p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">{desc}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Perks */}
            <div className="space-y-2">
                {perks.map(p => (
                    <div key={p} className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
                        <CheckCircle size={13} className="text-emerald-500 shrink-0" />
                        {p}
                    </div>
                ))}
            </div>

            {/* Footer badge */}
            <p className="text-[0.65rem] text-slate-400 dark:text-slate-600">
                © 2025 AlimBrary · Student Project
            </p>
        </div>
    )
}

/* ─────────────────────────────────────────────
   Input base — light default, dark: override
───────────────────────────────────────────── */
const inputBase = `
    w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    bg-white text-slate-900 placeholder-slate-400
    dark:bg-slate-800 dark:text-slate-200 dark:placeholder-slate-600
`.replace(/\s+/g, " ").trim()

const inputNeutral = `${inputBase} border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10 dark:border-slate-700 dark:focus:border-sky-400 dark:focus:ring-sky-400/10`
const inputValid = `${inputBase} border border-emerald-400 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10 dark:border-emerald-500 dark:focus:border-emerald-400`
const inputInvalid = `${inputBase} border border-red-400 focus:border-red-400 focus:ring-2 focus:ring-red-400/10 dark:border-red-500 dark:focus:border-red-400`

/* ─────────────────────────────────────────────
   Signup page
───────────────────────────────────────────── */
function Signup() {
    const navigate = useNavigate()
    const { toast, toasts, removeToast } = useToast()
    const { theme, toggle } = useTheme()

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

    const handleSignup = async () => {
        if (!emailValid) { toast.error("Invalid email", "Enter a valid email address."); return }
        if (!passwordValid) { toast.error("Weak password", "Password must be at least 6 chars."); return }
        if (!passwordsMatch) { toast.error("Mismatch", "Passwords do not match."); return }
        if (!email || !username || !department || !password) {
            toast.error("Missing fields", "Please fill in all fields.")
            return
        }

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

    const getEmailClass = () => email.length === 0 ? inputNeutral : emailValid ? inputValid : inputInvalid
    const getPwClass = () => password.length === 0 ? inputNeutral : passwordValid ? inputValid : inputInvalid
    const getConfirmClass = () => confirmPassword.length === 0 ? inputNeutral : passwordsMatch ? inputValid : inputInvalid

    const Hint = ({ show, valid, validText, invalidText }) => !show ? null : (
        <span className={`text-[0.65rem] font-normal normal-case tracking-normal ${valid ? "text-emerald-500" : "text-red-400"}`}>
            {valid ? `✓ ${validText}` : `✕ ${invalidText}`}
        </span>
    )

    return (
        <div className="h-screen flex overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">

            {/* ── Left panel — mini sidebar ── */}
            <aside className="hidden lg:block w-90 shrink-0
                              border-r border-slate-200 dark:border-slate-800
                              bg-slate-50 dark:bg-slate-900/80">
                <MiniHomeSidebar />
            </aside>

            {/* ── Right form panel ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto
                             bg-white dark:bg-slate-900">

                {/* Theme toggle — top right of the form area */}
                <div className="absolute top-4 right-4">
                    <button
                        onClick={toggle}
                        aria-label="Toggle theme"
                        className="w-9 h-9 rounded-lg border flex items-center justify-center transition-colors
                                   border-slate-200 text-slate-500 hover:bg-slate-100
                                   dark:border-slate-700 dark:text-slate-400 dark:hover:bg-slate-800"
                    >
                        {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                    </button>
                </div>

                <div className="w-full max-w-100" style={{ animation: "fadeUp 0.4s ease both" }}>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight mb-1
                                       text-slate-900 dark:text-slate-100">
                            Create account
                        </h1>
                        <p className="text-sm text-slate-500">Sign up for your library access</p>
                    </div>

                    <form onSubmit={(e) => { e.preventDefault(); handleSignup() }} className="space-y-3.5">

                        {/* Email */}
                        <div>
                            <label className="flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-widest mb-1.5 text-slate-500">
                                Email Address
                                <Hint show={email.length > 0} valid={emailValid} validText="valid" invalidText="invalid format" />
                            </label>
                            <input
                                type="email"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                                disabled={isLoading}
                                className={getEmailClass()}
                            />
                        </div>

                        {/* Username + Department */}
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <label className="block text-[0.68rem] font-semibold uppercase tracking-widest mb-1.5 text-slate-500">
                                    Username
                                </label>
                                <input
                                    type="text"
                                    placeholder="Your name"
                                    value={username}
                                    onChange={(e) => setUsername(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className={inputNeutral}
                                />
                            </div>
                            <div>
                                <label className="block text-[0.68rem] font-semibold uppercase tracking-widest mb-1.5 text-slate-500">
                                    Department
                                </label>
                                <input
                                    type="text"
                                    placeholder="e.g. BSIT"
                                    value={department}
                                    onChange={(e) => setDepartment(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className={inputNeutral}
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div>
                            <label className="flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-widest mb-1.5 text-slate-500">
                                Password
                                <Hint show={password.length > 0} valid={passwordValid} validText="strong enough" invalidText="min 6 chars" />
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Min. 6 characters"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className={`${getPwClass()} pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2
                                               text-slate-400 hover:text-slate-600
                                               dark:text-slate-500 dark:hover:text-slate-300
                                               disabled:opacity-30 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Confirm Password */}
                        <div>
                            <label className="flex items-center justify-between text-[0.68rem] font-semibold uppercase tracking-widest mb-1.5 text-slate-500">
                                Confirm Password
                                <Hint show={confirmPassword.length > 0} valid={passwordsMatch} validText="match" invalidText="no match" />
                            </label>
                            <div className="relative">
                                <input
                                    type={showConfirm ? "text" : "password"}
                                    placeholder="Repeat your password"
                                    value={confirmPassword}
                                    onChange={(e) => setConfirmPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className={`${getConfirmClass()} pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowConfirm(!showConfirm)}
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2
                                               text-slate-400 hover:text-slate-600
                                               dark:text-slate-500 dark:hover:text-slate-300
                                               disabled:opacity-30 transition-colors"
                                >
                                    {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {/* Submit */}
                        <button
                            type="submit"
                            disabled={isLoading || !email || !username || !department || !password || !confirmPassword}
                            className="w-full py-3 mt-1 rounded-lg text-sm font-semibold
                                       flex items-center justify-center gap-2 transition-all
                                       bg-sky-500 text-white hover:bg-sky-400 hover:-translate-y-0.5 active:translate-y-0
                                       disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:translate-y-0
                                       dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                                : "Create Account"
                            }
                        </button>

                        <p className="text-center text-xs text-slate-500 pt-1">
                            Already have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/auth/login")}
                                disabled={isLoading}
                                className="text-sky-500 underline hover:text-sky-400 disabled:opacity-50 cursor-pointer"
                            >
                                Sign in here
                            </button>
                        </p>
                    </form>

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 mt-6 text-xs
                                   text-slate-400 hover:text-slate-600
                                   dark:text-slate-600 dark:hover:text-slate-400
                                   transition-colors"
                    >
                        <ArrowLeft size={13} /> Back to Home
                    </button>
                </div>
            </main>

            <style>{`
                @keyframes fadeUp {
                    from { opacity: 0; transform: translateY(16px); }
                    to   { opacity: 1; transform: translateY(0); }
                }
            `}</style>

            <Toast toasts={toasts} removeToast={removeToast} />
        </div>
    )
}

export default Signup