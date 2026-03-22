"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { BookOpen, Users, Zap, ArrowRight, CheckCircle, Sun, Moon } from "lucide-react"

function Home() {
    const navigate = useNavigate()
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
        if (theme === "dark") document.documentElement.classList.add("dark")
        else document.documentElement.classList.remove("dark")
    }, [theme])

    const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

    return (
        <div className="min-h-screen bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 transition-colors duration-300">

            {/* Header */}
            <header className="fixed top-0 inset-x-0 z-50 border-b border-slate-200 dark:border-slate-800
                               bg-white/90 dark:bg-slate-900/90 backdrop-blur-md">
                <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-lg">
                        <BookOpen size={24} className="text-sky-500" />
                        <span>AlimBrary</span>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={toggleTheme} aria-label="Toggle theme"
                            className="w-9 h-9 rounded-lg border border-slate-200 dark:border-slate-700
                                           flex items-center justify-center text-slate-500 dark:text-slate-400
                                           hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
                        </button>
                        <button onClick={() => navigate("/auth/login")}
                            className="px-4 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-700
                                           text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors">
                            Sign In
                        </button>
                        <button onClick={() => navigate("/auth/signup")}
                            className="px-4 py-2 text-sm font-medium rounded-lg bg-sky-500 text-white
                                           hover:bg-sky-400 transition-colors">
                            Sign Up
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero */}
            <section className="pt-32 pb-20 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h1 className="text-5xl font-bold leading-tight tracking-tight mb-6">
                            AlimBrary <span className="text-sky-500"></span>
                        </h1>
                        <p className="text-lg text-slate-600 dark:text-slate-400 leading-relaxed mb-8 max-w-md">
                            Streamline your library operations. From book management to user management,
                            AlimBrary provides everything you need to run an efficient, modern library.
                        </p>
                        <div className="flex gap-3 flex-wrap">
                            <button onClick={() => navigate("/auth/signup")}
                                className="flex items-center gap-2 px-6 py-3 rounded-lg bg-sky-500 text-white
                                               font-medium hover:bg-sky-400 hover:-translate-y-0.5 transition-all">
                                Get Started <ArrowRight size={18} />
                            </button>
                            <button onClick={() => navigate("/auth/login")}
                                className="px-6 py-3 rounded-lg border-2 border-sky-500 text-sky-500
                                               font-medium hover:bg-sky-500 hover:text-white transition-all">
                                Sign In
                            </button>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        {/* Replace this image with the books page. alter it with light and dark mode depends on the theme */}
                        <img src="../../libraryBooks-light.png" alt="hero" className="opacity-60 max-w-sm w-full" />
                    </div>
                </div>
            </section>

            {/* Features */}
            <section className="py-20 px-6 bg-slate-50 dark:bg-slate-800/40">
                <div className="max-w-6xl mx-auto">
                    <div className="text-center mb-12">
                        <h2 className="text-3xl font-bold mb-3">Why Choose AlimBrary?</h2>
                        <p className="text-slate-500 dark:text-slate-400">Everything you need to manage your library efficiently</p>
                    </div>
                    <div className="grid md:grid-cols-3 gap-6">
                        {[
                            { icon: <BookOpen size={28} />, title: "Smart Cataloging", desc: "Organize your entire book collection with intelligent cataloging. Easy search, categorization, and inventory tracking." },
                            { icon: <Users size={28} />, title: "User Management", desc: "Comprehensive management for students, faculty, and staff. Track history, manage permissions, and more." },
                            { icon: <Zap size={28} />, title: "Lightning Fast", desc: "Built for performance with modern technology. Quick searches, instant updates, and seamless experience." },
                        ].map(({ icon, title, desc }) => (
                            <div key={title} className="p-6 rounded-xl border border-slate-200 dark:border-slate-700
                                                        bg-white dark:bg-slate-900 hover:-translate-y-1 transition-all duration-300">
                                <div className="text-sky-500 mb-4">{icon}</div>
                                <h3 className="font-semibold text-lg mb-2">{title}</h3>
                                <p className="text-sm text-slate-500 dark:text-slate-400 leading-relaxed">{desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Benefits */}
            <section className="py-20 px-6">
                <div className="max-w-6xl mx-auto grid lg:grid-cols-2 gap-16 items-center">
                    <div>
                        <h2 className="text-3xl font-bold mb-4">Perfect for Academic Projects</h2>
                        <p className="text-slate-500 dark:text-slate-400 leading-relaxed mb-8">
                            Built as a student project to demonstrate modern web development skills and library
                            management concepts with a clean, user-friendly interface.
                        </p>
                        <div className="space-y-3">
                            {["Modern React-based interface", "Role-based user authentication",
                                "Responsive design for all devices", "Clean and intuitive user experience"].map(item => (
                                    <div key={item} className="flex items-center gap-3 text-sm font-medium">
                                        <CheckCircle size={18} className="text-emerald-500 shrink-0" />
                                        {item}
                                    </div>
                                ))}
                        </div>
                    </div>
                    <div className="flex justify-center">
                        {/* Replace this image with the dashboard page. alter it with light and dark mode depends on the theme */}
                        <img src="../../libraryDashboard-light.png" alt="benefits" className="opacity-60 max-w-sm w-full" />
                    </div>
                </div>
            </section>

            {/* CTA */}
            <section className="py-20 px-6 bg-to-r from-sky-500 to-blue-600">
                <div className="max-w-2xl mx-auto text-center text-white">
                    <h2 className="text-3xl font-bold mb-3">Ready to Get Started?</h2>
                    <p className="opacity-90 mb-8">Join AlimBrary today and explore the library management system.</p>
                    <button onClick={() => navigate("/auth/signup")}
                        className="flex items-center gap-2 px-8 py-3 rounded-lg bg-white text-sky-600
                                       font-semibold mx-auto hover:bg-slate-100 transition-colors">
                        Sign Up Now <ArrowRight size={18} />
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-10 px-6 bg-slate-900 dark:bg-slate-950 text-white">
                <div className="max-w-6xl mx-auto text-center">
                    <div className="flex items-center justify-center gap-2 font-bold text-lg mb-2">
                        <BookOpen size={20} className="text-sky-400" />
                        <span>AlimBrary</span>
                    </div>
                    <p className="text-slate-500 text-sm mb-6">A student project demonstrating modern library management system development.</p>
                    <div className="border-t border-slate-800 pt-6 text-slate-600 text-xs">
                        © 2025 AlimBrary. Student Project.
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home