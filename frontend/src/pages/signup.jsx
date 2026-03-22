"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { registerUser } from "../api/auth"
import Toast, { useToast } from "../components/toast/Toast.jsx"
import { Eye, EyeOff, Loader2, BookOpen, ArrowLeft, Sun, Moon } from "lucide-react"

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
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

    const emailValid = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    const passwordValid = password.length >= 6
    const passwordsMatch = password === confirmPassword && confirmPassword.length > 0

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        if (theme === "dark") document.documentElement.classList.add("dark")
        else document.documentElement.classList.remove("dark")
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

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

    const inputBase = `w-full px-3.5 py-2.5 rounded-lg text-sm outline-none transition-all disabled:opacity-50 disabled:cursor-not-allowed
        text-slate-200 bg-slate-800 placeholder-slate-600
        dark:text-slate-200 dark:bg-slate-800 dark:placeholder-slate-600
        [html:not(.dark)_&]:text-slate-900 [html:not(.dark)_&]:bg-white [html:not(.dark)_&]:placeholder-slate-400`

    const inputNeutral = `${inputBase} border border-slate-700 focus:border-sky-400 focus:ring-2 focus:ring-sky-400/10
        [html:not(.dark)_&]:border-slate-200 [html:not(.dark)_&]:focus:border-sky-500 [html:not(.dark)_&]:focus:ring-sky-500/10`

    const inputValid = `${inputBase} border border-emerald-500 focus:border-emerald-400 focus:ring-2 focus:ring-emerald-400/10
        [html:not(.dark)_&]:border-emerald-400`

    const inputInvalid = `${inputBase} border border-red-500 focus:border-red-400 focus:ring-2 focus:ring-red-400/10
        [html:not(.dark)_&]:border-red-400`

    const getEmailClass = () => email.length === 0 ? inputNeutral : emailValid ? inputValid : inputInvalid
    const getPwClass = () => password.length === 0 ? inputNeutral : passwordValid ? inputValid : inputInvalid
    const getConfirmClass = () => confirmPassword.length === 0 ? inputNeutral : passwordsMatch ? inputValid : inputInvalid

    const Hint = ({ show, valid, validText, invalidText }) => !show ? null : (
        <span className={`text-[0.65rem] font-normal normal-case tracking-normal ${valid ? "text-emerald-500" : "text-red-400"}`}>
            {valid ? `✓ ${validText}` : `✕ ${invalidText}`}
        </span>
    )

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
                        Join the<br />
                        <span className="text-sky-400">library.</span>
                    </h2>
                    <p className="text-sm text-slate-500 leading-relaxed max-w-[260px]">
                        Create your account to browse books, track reading sessions, and access your digital campus library.
                    </p>
                </div>

                <span className="text-xs text-slate-700 relative z-10">© 2025 AlimBrary · Student Project</span>
            </aside>

            {/* ── Right form panel ── */}
            <main className="flex-1 flex flex-col items-center justify-center px-6 py-10 overflow-y-auto relative
                             bg-slate-900 dark:bg-slate-900 [html:not(.dark)_&]:bg-white transition-colors duration-300">

                {/* Theme toggle */}
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

                <div className="w-full max-w-[400px]" style={{ animation: "fadeUp 0.4s ease both" }}>

                    <div className="mb-6">
                        <h1 className="text-3xl font-bold tracking-tight mb-1
                                       text-slate-100 dark:text-slate-100
                                       [html:not(.dark)_&]:text-slate-900">
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
                                <button type="button" onClick={() => setShowPassword(!showPassword)} disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                                                   hover:text-slate-300 [html:not(.dark)_&]:hover:text-slate-600
                                                   disabled:opacity-30 transition-colors">
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
                                <button type="button" onClick={() => setShowConfirm(!showConfirm)} disabled={isLoading}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500
                                                   hover:text-slate-300 [html:not(.dark)_&]:hover:text-slate-600
                                                   disabled:opacity-30 transition-colors">
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
                                       disabled:bg-slate-700 disabled:text-slate-500 disabled:cursor-not-allowed disabled:translate-y-0
                                       [html:not(.dark)_&]:disabled:bg-slate-200 [html:not(.dark)_&]:disabled:text-slate-400"
                        >
                            {isLoading
                                ? <><Loader2 size={16} className="animate-spin" /> Creating account...</>
                                : "Create Account"
                            }
                        </button>

                        <p className="text-center text-xs text-slate-500 pt-1">
                            Already have an account?{" "}
                            <button type="button" onClick={() => navigate("/auth/login")} disabled={isLoading}
                                className="text-sky-500 underline hover:text-sky-400 disabled:opacity-50 cursor-pointer">
                                Sign in here
                            </button>
                        </p>
                    </form>

                    <button onClick={() => navigate("/")}
                        className="flex items-center gap-1.5 mt-6 text-xs text-slate-600 hover:text-slate-400 transition-colors">
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