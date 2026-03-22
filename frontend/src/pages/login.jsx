"use client"

import { useState, useEffect } from "react"
import { useNavigate, useLocation } from "react-router-dom"
import { loginUser, activeStatus } from "../api/auth"
import { jwtDecode } from "jwt-decode"
import Toast, { useToast } from "../components/toast/Toast.jsx"
import { Eye, EyeOff, Loader2, BookOpen, ArrowLeft, Sun, Moon } from "lucide-react"

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
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        if (theme === "dark") document.documentElement.classList.add("dark")
        else document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

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
                const msg = result.error?.response?.data?.message || "Invalid credentials"
                toast.error("Login failed", msg)
                setIsLoading(false)
            }
        } catch {
            toast.error("Something went wrong", "Please try again.")
            setIsLoading(false)
        }
    }

    const inputClass = `w-full px-4 py-3 rounded-lg text-sm outline-none transition-all
        disabled:opacity-50 disabled:cursor-not-allowed
        text-slate-200 bg-slate-800 border border-slate-700 placeholder-slate-600
        focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10
        dark:text-slate-200 dark:bg-slate-800 dark:border-slate-700 dark:placeholder-slate-600
        dark:focus:border-sky-400`

    const inputClassLight = `${inputClass}
        [html:not(.dark)_&]:text-slate-900 [html:not(.dark)_&]:bg-white
        [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:placeholder-slate-400
        [html:not(.dark)_&]:focus:border-sky-500`

    return (
        <div className="min-h-screen flex bg-slate-900 dark:bg-slate-900">

            {/* ── Left brand panel — always dark ── */}
            <aside className="hidden lg:flex w-[400px] flex-shrink-0 flex-col justify-between p-12
                              bg-gradient-to-br from-slate-800 via-slate-900 to-slate-900
                              border-r border-white/5 relative overflow-hidden">
                <div className="absolute -top-20 -right-20 w-72 h-72 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(56,189,248,0.07) 0%, transparent 70%)" }} />
                <div className="absolute -bottom-16 -left-16 w-64 h-64 rounded-full pointer-events-none"
                    style={{ background: "radial-gradient(circle, rgba(251,146,60,0.06) 0%, transparent 70%)" }} />

                <div className="flex items-center gap-3 relative z-10">
                    <BookOpen size={26} className="text-sky-400" />
                    <span className="text-lg font-bold text-slate-100 tracking-tight">AlimBrary</span>
                </div>

                <div className="relative z-10">
                    <h2 className="text-[2.2rem] font-bold text-slate-100 leading-tight tracking-tight mb-4">
                        Your campus library,<br />
                        <span className="text-sky-400">digitized.</span>
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-[260px]">
                        Browse books, track reading sessions, and manage library resources — all in one place.
                    </p>
                </div>

                <span className="text-xs text-slate-700 relative z-10">© 2025 AlimBrary · Student Project</span>
            </aside>

            {/* ── Right form panel ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-12 relative
                             bg-slate-900 dark:bg-slate-900 [html:not(.dark)_&]:bg-white transition-colors duration-300">

                {/* Theme toggle — top right of form panel */}
                <button
                    onClick={toggleTheme}
                    className="absolute top-5 right-5 w-9 h-9 rounded-lg flex items-center justify-center transition-all
                               bg-slate-800 text-slate-400 hover:text-slate-200 hover:bg-slate-700
                               dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700
                               [html:not(.dark)_&]:bg-slate-100 [html:not(.dark)_&]:text-slate-500
                               [html:not(.dark)_&]:hover:bg-slate-200 [html:not(.dark)_&]:hover:text-slate-700"
                    aria-label="Toggle theme"
                >
                    {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                </button>

                <div className="w-full max-w-sm" style={{ animation: "fadeUp 0.4s ease both" }}>

                    <div className="mb-8">
                        <h1 className="text-3xl font-bold tracking-tight mb-1
                                       text-slate-100 dark:text-slate-100
                                       [html:not(.dark)_&]:text-slate-900">
                            Welcome back
                        </h1>
                        <p className="text-sm text-slate-500">Sign in to your account</p>
                    </div>

                    {registrationSuccess && (
                        <div className="mb-5 px-3.5 py-2.5 rounded-lg text-xs
                                        bg-emerald-500/10 border border-emerald-500/20 text-emerald-400
                                        [html:not(.dark)_&]:bg-emerald-50 [html:not(.dark)_&]:border-emerald-200 [html:not(.dark)_&]:text-emerald-700">
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
                                className={inputClassLight}
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
                                    className={`${inputClassLight} pr-11`}
                                />
                                <button
                                    type="button"
                                    onClick={() => setShowPassword(!showPassword)}
                                    disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2
                                               text-slate-500 hover:text-slate-300
                                               [html:not(.dark)_&]:hover:text-slate-600
                                               disabled:opacity-30 transition-colors"
                                >
                                    {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        <div className="flex items-center gap-2 pb-1">
                            <input
                                id="remember"
                                type="checkbox"
                                checked={rememberMe}
                                onChange={(e) => setRemember(e.target.checked)}
                                disabled={isLoading}
                                className="w-4 h-4 accent-sky-500 cursor-pointer disabled:cursor-not-allowed"
                            />
                            <label htmlFor="remember" className="text-sm text-slate-500 cursor-pointer select-none">
                                Remember me for 30 days
                            </label>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading || !identifier || !password}
                            className="w-full py-3 rounded-lg text-sm font-semibold
                                       flex items-center justify-center gap-2 transition-all
                                       bg-sky-500 text-white hover:bg-sky-400 hover:-translate-y-0.5 active:translate-y-0
                                       disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:translate-y-0
                                       [html:not(.dark)_&]:disabled:bg-slate-200 [html:not(.dark)_&]:disabled:text-slate-400"
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="animate-spin" /> Signing in...</>
                                : "Sign In"
                            }
                        </button>

                        <p className="text-center text-xs text-slate-500 pt-1">
                            Don't have an account?{" "}
                            <button type="button" onClick={() => navigate("/auth/signup")} disabled={isLoading}
                                className="text-sky-500 underline hover:text-sky-400 disabled:opacity-50 cursor-pointer">
                                Sign up here
                            </button>
                        </p>
                    </form>

                    <button onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 mt-8 text-xs text-slate-600 hover:text-slate-400 transition-colors">
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