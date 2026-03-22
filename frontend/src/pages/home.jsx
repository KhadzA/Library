"use client"

import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import "./home.css"
import { BookOpen, Users, Zap, ArrowRight, CheckCircle, Sun, Moon } from "lucide-react"

function Home() {
    const navigate = useNavigate()

    // Read saved theme or default to dark
    const [theme, setTheme] = useState(() => localStorage.getItem("theme") || "dark")

    useEffect(() => {
        document.documentElement.setAttribute("data-theme", theme)
        localStorage.setItem("theme", theme)
    }, [theme])

    const toggleTheme = () => setTheme(t => t === "dark" ? "light" : "dark")

    return (
        <div className="landing-container">
            {/* Header */}
            <header className="landing-header">
                <div className="header-content">
                    <div className="logo">
                        <BookOpen size={32} />
                        <span>AlimBrary</span>
                    </div>
                    <div className="header-actions">
                        {/* Theme toggle */}
                        <button onClick={toggleTheme} className="theme-toggle" aria-label="Toggle theme">
                            {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                        </button>
                        <button onClick={() => navigate("/auth/login")} className="btn-secondary">
                            Sign In
                        </button>
                        <button onClick={() => navigate("/auth/signup")} className="btn-primary">
                            Sign Up
                        </button>
                    </div>
                </div>
            </header>

            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-content">
                    <div className="hero-text">
                        <h1 className="hero-title">
                            AlimBrary
                            <span className="highlight">😢</span>
                        </h1>
                        <p className="hero-description">
                            Streamline your library operations with our management system. From book management to user
                            management, AlimBrary provides everything you need to run an EFFICIENT, modern library.
                        </p>
                        <div className="hero-actions">
                            <button onClick={() => navigate("/auth/signup")} className="btn-primary large">
                                Get Started
                                <ArrowRight size={20} />
                            </button>
                            <button onClick={() => navigate("/auth/login")} className="btn-outline large">
                                Sign In
                            </button>
                        </div>
                    </div>
                    <div className="hero-image">
                        <div className="hero-icon">
                            <img src="../../AintNoWay.png" alt="hero" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-content">
                    <div className="section-header">
                        <h2>Why Choose AlimBrary?</h2>
                        <p>Everything you need to manage your library efficiently and effectively</p>
                    </div>
                    <div className="features-grid">
                        <div className="feature-card">
                            <div className="feature-icon"><BookOpen size={32} /></div>
                            <h3>Smart Cataloging</h3>
                            <p>Organize and manage your entire book collection with our intelligent cataloging system. Easy search, categorization, and inventory tracking.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Users size={32} /></div>
                            <h3>User Management</h3>
                            <p>Comprehensive user management system for students, faculty, and staff. Track borrowing history, manage permissions, and more.</p>
                        </div>
                        <div className="feature-card">
                            <div className="feature-icon"><Zap size={32} /></div>
                            <h3>Lightning Fast</h3>
                            <p>Built for performance with modern technology. Quick searches, instant updates, and seamless user experience across all devices.</p>
                        </div>
                    </div>
                </div>
            </section>

            {/* Benefits Section */}
            <section className="benefits-section">
                <div className="section-content">
                    <div className="benefits-content">
                        <div className="benefits-text">
                            <h2>Perfect for Academic Projects</h2>
                            <p className="benefits-description">
                                Built as a student project to demonstrate modern web development skills and library management concepts.
                                This system showcases full-stack development capabilities with a clean, user-friendly interface.
                            </p>
                            <div className="benefits-list">
                                <div className="benefit-item"><CheckCircle size={20} /><span>Modern React-based interface</span></div>
                                <div className="benefit-item"><CheckCircle size={20} /><span>Role-based user authentication</span></div>
                                <div className="benefit-item"><CheckCircle size={20} /><span>Responsive design for all devices</span></div>
                                <div className="benefit-item"><CheckCircle size={20} /><span>Clean and intuitive user experience</span></div>
                            </div>
                        </div>
                        <div className="benefits-image">
                            <div className="benefits-icon">
                                <img src="../../YOSPEED.png" alt="benefits" />
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="section-content">
                    <div className="cta-content">
                        <h2>Ready to Get Started?</h2>
                        <p>Join AlimBrary today and explore the library management system.</p>
                        <div className="cta-actions">
                            <button onClick={() => navigate("/auth/signup")} className="btn-primary large">
                                Sign Up Now <ArrowRight size={20} />
                            </button>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-main">
                        <div className="footer-brand">
                            <div className="logo">
                                <BookOpen size={24} />
                                <span>AlimBrary</span>
                            </div>
                            <p>A student project demonstrating modern library management system development.</p>
                        </div>
                    </div>
                    <div className="footer-bottom">
                        <p>&copy; 2025 AlimBrary. Student Project.</p>
                    </div>
                </div>
            </footer>
        </div>
    )
}

export default Home