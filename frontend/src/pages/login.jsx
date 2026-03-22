"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { loginUser, activeStatus } from "../api/auth"
import { jwtDecode } from "jwt-decode"
import Toast, { useToast } from "../components/toast/Toast.jsx"
import { Eye, EyeOff, Loader2, ArrowLeft, BookOpen, Users, Zap, CheckCircle, Sun, Moon } from "lucide-react"

/* ─────────────────────────────────────────────
   Shared theme hook — read & toggle from any page
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
   Mini sidebar — a designed brand panel,
   not a scaled clone of the full home page
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
                <p className="text-xs text-slate-500 dark:text-slate-500 ml-11">
                    Library Management System
                </p>
            </div>

            {/* Hero text */}
            <div>
                <h2 className="text-3xl font-bold leading-snug tracking-tight mb-3
                               text-slate-900 dark:text-white">
                    Manage your<br />
                    <span className="text-sky-500">library</span> smarter.
                </h2>
                <p className="text-sm leading-relaxed text-slate-500 dark:text-slate-400 max-w-xs">
                    Everything you need to run an efficient, modern academic library — in one clean interface.
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
   Input style — CSS vars instead of long chains
───────────────────────────────────────────── */
const inputClass = `
    w-full px-4 py-3 rounded-lg text-sm outline-none transition-all
    disabled:opacity-50 disabled:cursor-not-allowed
    bg-white text-slate-900 border border-slate-200 placeholder-slate-400
    focus:border-sky-500 focus:ring-2 focus:ring-sky-500/10
    dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:placeholder-slate-600
    dark:focus:border-sky-400 dark:focus:ring-sky-400/10
`.replace(/\s+/g, " ").trim()

/* ─────────────────────────────────────────────
   Login page
───────────────────────────────────────────── */
function Login() {
    const navigate = useNavigate()
    const location = useLocation()
    const { toast, toasts, removeToast } = useToast()

    const queryParams = new URLSearchParams(location.search)
    const registrationSuccess = queryParams.get("registration_success") === "true"

    const { theme, toggle } = useTheme()

    const [identifier, setIdentifier] = useState("")
    const [password, setPassword] = useState("")
    const [rememberMe, setRemember] = useState(false)
    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)

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
                else { toast.error("Unknown role", "Cannot navigate."); setIsLoading(false); return }

                await activeStatus()
            } else {
                toast.error("Login failed", result.error?.response?.data?.message || "Invalid credentials")
                setIsLoading(false)
            }
        } catch {
            toast.error("Something went wrong", "Please try again.")
            setIsLoading(false)
        }
    }

    return (
        <div className="h-screen flex overflow-hidden bg-white dark:bg-slate-900 transition-colors duration-300">

            {/* ── Left panel — intentional mini sidebar ── */}
            <aside className="hidden lg:block w-90 shrink-0
                              border-r border-slate-200 dark:border-slate-800
                              bg-slate-50 dark:bg-slate-900/80">
                <MiniHomeSidebar />
            </aside>

            {/* ── Right form panel ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 overflow-hidden
                             bg-white dark:bg-slate-900 relative">

                {/* Theme toggle */}
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

                <div className="w-full max-w-sm" style={{ animation: "fadeUp 0.4s ease both" }}>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-1
                                       text-slate-900 dark:text-slate-100">
                            Welcome back
                        </h1>
                        <p className="text-sm text-slate-500">Sign in to your account</p>
                    </div>

                    {registrationSuccess && (
                        <div className="mb-5 px-3.5 py-2.5 rounded-lg text-xs
                                        bg-emerald-50 border border-emerald-200 text-emerald-700
                                        dark:bg-emerald-500/10 dark:border-emerald-500/20 dark:text-emerald-400">
                            Account created — you can now sign in.
                        </div>
                    )}

                    <form onSubmit={(e) => { e.preventDefault(); handleLogin() }} className="space-y-4">

                        <div>
                            <label className="block text-[0.68rem] font-semibold uppercase tracking-widest mb-1.5 text-slate-500">
                                Username or Email
                            </label>
                            <input
                                type="text"
                                placeholder="Enter username or email"
                                value={identifier}
                                onChange={(e) => setIdentifier(e.target.value)}
                                required
                                disabled={isLoading}
                                className={inputClass}
                            />
                        </div>

                        <div>
                            <label className="block text-[0.68rem] font-semibold uppercase tracking-widest mb-1.5 text-slate-500">
                                Password
                            </label>
                            <div className="relative">
                                <input
                                    type={showPassword ? "text" : "password"}
                                    placeholder="Enter your password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    required
                                    disabled={isLoading}
                                    className={`${inputClass} pr-11`}
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

                        <div className="flex items-center gap-2 pb-1">
                            {/* Hidden real input for form/accessibility */}
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRemember(e.target.checked)}
                                disabled={isLoading}
                                className="sr-only"
                            />
                            {/* Visual checkbox */}
                            <button
                                type="button"
                                role="checkbox"
                                aria-checked={rememberMe}
                                onClick={() => !isLoading && setRemember(r => !r)}
                                disabled={isLoading}
                                className={`w-4 h-4 rounded flex items-center justify-center shrink-0
                                            border transition-colors disabled:opacity-50 disabled:cursor-not-allowed
                                            ${rememberMe
                                        ? "bg-sky-500 border-sky-500"
                                        : "bg-white border-slate-300 dark:bg-slate-800 dark:border-slate-600"
                                    }`}
                            >
                                {rememberMe && (
                                    <svg viewBox="0 0 10 8" className="w-2.5 h-2.5 text-white" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                                        <path d="M1 4l2.5 2.5L9 1" />
                                    </svg>
                                )}
                            </button>
                            <label htmlFor="remember" onClick={() => !isLoading && setRemember(r => !r)} className="text-sm text-slate-500 cursor-pointer select-none">
                                Remember me for 30 days
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !identifier || !password}
                            className="w-full py-3 rounded-lg text-sm font-semibold
                                       flex items-center justify-center gap-2 transition-all
                                       bg-sky-500 text-white hover:bg-sky-400 hover:-translate-y-0.5 active:translate-y-0
                                       disabled:bg-slate-200 disabled:text-slate-400 disabled:cursor-not-allowed disabled:translate-y-0
                                       dark:disabled:bg-slate-700 dark:disabled:text-slate-500"
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                                : "Sign In"
                            }
                        </button>

                        <p className="text-center text-xs text-slate-500 pt-1">
                            Don't have an account?{" "}
                            <button
                                type="button"
                                onClick={() => navigate("/auth/signup")}
                                disabled={isLoading}
                                className="text-sky-500 underline hover:text-sky-400 disabled:opacity-50 cursor-pointer"
                            >
                                Sign up here
                            </button>
                        </p>
                    </form>

                    <button
                        onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 mt-8 text-xs
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

export default Login