"use client"

import { useState, useEffect } from "react"
import AuthGuard from "../../components/AuthGuard"
import { useSocketConnection } from "../../hooks/useSocketConnection"
import socket, { connectSocket } from "../../socket"
import { userStats, bookStats, readingStats, recentActivity, topReader, booksPerMonth } from "../../api/dashboard"
import { useRef } from "react"
import { Radar } from "react-chartjs-2"
import { Chart as ChartJS, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from "chart.js"
import Chart from "chart.js/auto"

ChartJS.register(RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)
import "./dashboard.css"
import {
    Users,
    BookOpen,
    Eye,
    TrendingUp,
    Activity,
    Clock,
    UserCheck,
    Shield,
    GraduationCap,
    User,
    RefreshCw,
    BarChart3,
    PieChart,
    Award,
    Target,
    Zap,
    BookMarked,
    Star,
} from "lucide-react"

// Enhanced RadarChart component
function RadarChart({ stats }) {
    const data = {
        labels: ["Total Users", "Active Users", "Total Books", "Available Books", "Reading Sessions", "Popular Genre"],
        datasets: [
            {
                label: "Library Overview",
                data: [
                    stats.users?.total || 0,
                    stats.users?.active || 0,
                    stats.books?.total || 0,
                    stats.books?.available || 0,
                    stats.reading?.todaySessions || 0,
                    stats.books?.topGenre?.userCount || 0,
                ],
                backgroundColor: "rgba(59, 130, 246, 0.1)",
                borderColor: "rgba(59, 130, 246, 0.8)",
                borderWidth: 3,
                pointBackgroundColor: "rgba(59, 130, 246, 1)",
                pointBorderColor: "#fff",
                pointBorderWidth: 3,
                pointRadius: 6,
                pointHoverRadius: 8,
            },
        ],
    }

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: "rgba(17, 24, 39, 0.95)",
                titleColor: "#fff",
                bodyColor: "#fff",
                borderColor: "rgba(59, 130, 246, 0.5)",
                borderWidth: 1,
                cornerRadius: 12,
                displayColors: false,
            },
        },
        scales: {
            r: {
                angleLines: {
                    display: true,
                    color: "rgba(156, 163, 175, 0.2)",
                },
                grid: {
                    color: "rgba(156, 163, 175, 0.2)",
                },
                pointLabels: {
                    font: {
                        size: 12,
                        weight: "600",
                    },
                    color: "#6b7280",
                },
                ticks: {
                    display: false,
                },
                suggestedMin: 0,
                suggestedMax:
                    Math.max(
                        stats.users?.total || 10,
                        stats.books?.total || 10,
                        stats.reading?.todaySessions || 10,
                        stats.books?.topGenre?.userCount || 10,
                    ) * 1.2,
            },
        },
    }
    return <Radar data={data} options={options} />
}

// Enhanced BarChart component
function BooksPerMonthChart({ data, chartRef }) {
    useEffect(() => {
        if (!data.length || !chartRef.current) return

        const ctx = chartRef.current.getContext("2d")

        // Destroy existing chart
        if (chartRef.current.chart) {
            chartRef.current.chart.destroy()
        }

        chartRef.current.chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: data.map((d) => d.month),
                datasets: [
                    {
                        label: "Books Added",
                        data: data.map((d) => d.count),
                        backgroundColor: (ctx) => {
                            const gradient = ctx.chart.ctx.createLinearGradient(0, 0, 0, 400)
                            gradient.addColorStop(0, "rgba(59, 130, 246, 0.8)")
                            gradient.addColorStop(1, "rgba(59, 130, 246, 0.2)")
                            return gradient
                        },
                        borderColor: "rgba(59, 130, 246, 1)",
                        borderWidth: 2,
                        borderRadius: 8,
                        borderSkipped: false,
                    },
                ],
            },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                plugins: {
                    legend: { display: false },
                    tooltip: {
                        backgroundColor: "rgba(17, 24, 39, 0.95)",
                        titleColor: "#fff",
                        bodyColor: "#fff",
                        borderColor: "rgba(59, 130, 246, 0.5)",
                        borderWidth: 1,
                        cornerRadius: 12,
                        displayColors: false,
                    },
                },
                scales: {
                    x: {
                        grid: { display: false },
                        ticks: {
                            color: "#6b7280",
                            font: { weight: "500" },
                        },
                    },
                    y: {
                        grid: {
                            color: "rgba(156, 163, 175, 0.1)",
                            drawBorder: false,
                        },
                        ticks: {
                            color: "#6b7280",
                            font: { weight: "500" },
                        },
                        beginAtZero: true,
                    },
                },
            },
        })

        return () => {
            if (chartRef.current?.chart) {
                chartRef.current.chart.destroy()
            }
        }
    }, [data])

    return null
}

function Dashboard() {
    useSocketConnection()

    // Real-time dashboard updates via socket events
    useEffect(() => {
        connectSocket()

        const events = ["bookAdded", "bookUpdated", "bookDeleted", "userCreated", "userUpdated", "bookRead"]

        const handleDashboardUpdate = () => {
            fetchDashboardData()
        }

        events.forEach((event) => {
            socket.on(event, handleDashboardUpdate)
        })

        return () => {
            events.forEach((event) => {
                socket.off(event, handleDashboardUpdate)
            })
        }
    }, [])

    const [stats, setStats] = useState({
        users: null,
        books: null,
        reading: null,
    })
    const [activities, setActivities] = useState([])
    const [isLoading, setIsLoading] = useState(true)
    const [lastUpdated, setLastUpdated] = useState(null)
    const [topUser, setTopUser] = useState([])
    const [booksAnalytics, setBooksAnalytics] = useState([])
    const chartRef = useRef(null)

    const fetchDashboardData = async () => {
        setIsLoading(true)
        try {
            const [userStatsRes, bookStatsRes, readingStatsRes, activityRes, topReaderRes, booksPerMonthRes] =
                await Promise.all([userStats(), bookStats(), readingStats(), recentActivity(), topReader(), booksPerMonth()])

            setStats({
                users: userStatsRes.success ? normalizeUsers(userStatsRes.data) : null,
                books: bookStatsRes.success ? normalizeBooks(bookStatsRes.data) : null,
                reading: readingStatsRes.success ? normalizeReading(readingStatsRes.data) : null,
            })
            setActivities(activityRes.success ? activityRes.data : [])
            setTopUser(topReaderRes.success ? topReaderRes.data : [])
            setBooksAnalytics(booksPerMonthRes.success ? booksPerMonthRes.data : [])
            setLastUpdated(new Date())
        } catch (error) {
            console.error("Error fetching dashboard data:", error)
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const handleRefresh = () => {
        fetchDashboardData()
    }

    const normalizeUsers = (data) => {
        const roles = { admin: 0, librarian: 0, student: 0 }

        data.byRole.forEach((r) => {
            if (Object.prototype.hasOwnProperty.call(roles, r.role)) {
                roles[r.role] = r.count
            }
        })

        return {
            total: data.total,
            active: data.active,
            inactive: data.total - data.active - data.suspended,
            suspended: data.suspended,
            admins: roles.admin,
            librarians: roles.librarian,
            students: roles.student,
        }
    }

    const normalizeBooks = (data) => ({
        total: data.total,
        available: data.available,
        unavailable: data.borrowed,
        genres: data.byGenre,
        topGenre: data.topGenre || null,
    })

    const normalizeReading = (data) => ({
        totalSessions: data.activeSessions,
        avgDuration: data.totalTime / (data.activeSessions || 1),
        todaySessions: data.todayTime,
        popularBooks: data.mostReadBooks,
    })

    const getRoleIcon = (role) => {
        switch (role) {
            case "admin":
                return <Shield size={16} />
            case "librarian":
                return <User size={16} />
            case "student":
                return <GraduationCap size={16} />
            default:
                return <User size={16} />
        }
    }

    const formatTimeAgo = (dateString) => {
        const date = new Date(dateString)
        const now = new Date()
        const diffInSeconds = Math.floor((now - date) / 1000)

        if (diffInSeconds < 60) return "Just now"
        if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`
        if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`
        return `${Math.floor(diffInSeconds / 86400)}d ago`
    }

    if (isLoading) {
        return (
            <div className="dashboard-container">
                <div className="dashboard-loading">
                    <div className="loading-spinner"></div>
                    <p>Loading dashboard...</p>
                </div>
            </div>
        )
    }

    return (
        <AuthGuard allowedRoles={['admin', 'librarian']}>
            <div className="dashboard-container">
                {/* Clean Header */}
                <div className="dashboard-header">
                    <div className="header-content">
                        <div className="header-text">
                            {/* <div className="header-badge">
                            <Zap size={16} />
                            <span>Live Dashboard</span>
                        </div> */}
                            <h1>Library Management System</h1>
                            <p>Insights and Analytics of the digital library</p>
                        </div>
                        <div className="header-actions">
                            <button className="refresh-btn" onClick={handleRefresh}>
                                <RefreshCw size={18} />
                                <span>Refresh Data</span>
                            </button>
                            {lastUpdated && (
                                <div className="last-updated">
                                    <Clock size={14} />
                                    <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* Key Metrics Overview */}
                <div className="metrics-overview">
                    <div className="section-title">
                        <Target size={24} />
                        <h2>Key Performance Metrics</h2>
                    </div>

                    <div className="metrics-grid">
                        {/* Total Users Metric */}
                        {stats.users && (
                            <div className="metric-card primary">
                                <div className="metric-header">
                                    <div className="metric-icon">
                                        <Users size={28} />
                                    </div>
                                    <div className="metric-trend positive">
                                        <TrendingUp size={16} />
                                        <span>+12%</span>
                                    </div>
                                </div>
                                <div className="metric-content">
                                    <h3>Total Users</h3>
                                    <div className="metric-value">{stats.users.total}</div>
                                    <div className="metric-details">
                                        <div className="detail-item">
                                            <div className="status-dot active"></div>
                                            <span>Active: {stats.users.active}</span>
                                        </div>
                                        <div className="detail-item">
                                            <div className="status-dot inactive"></div>
                                            <span>Inactive: {stats.users.inactive}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Total Books Metric */}
                        {stats.books && (
                            <div className="metric-card success">
                                <div className="metric-header">
                                    <div className="metric-icon">
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="metric-trend positive">
                                        <TrendingUp size={16} />
                                        <span>+8%</span>
                                    </div>
                                </div>
                                <div className="metric-content">
                                    <h3>Total Books</h3>
                                    <div className="metric-value">{stats.books.total}</div>
                                    <div className="metric-details">
                                        <div className="detail-item">
                                            <div className="status-dot available"></div>
                                            <span>Available: {stats.books.available}</span>
                                        </div>
                                        <div className="detail-item">
                                            <div className="status-dot borrowed"></div>
                                            <span>Borrowed: {stats.books.unavailable}</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reading Time Metric */}
                        {stats.reading && (
                            <div className="metric-card warning">
                                <div className="metric-header">
                                    <div className="metric-icon">
                                        <Eye size={28} />
                                    </div>
                                    <div className="metric-trend positive">
                                        <TrendingUp size={16} />
                                        <span>+15%</span>
                                    </div>
                                </div>
                                <div className="metric-content">
                                    <h3>Reading Time Today</h3>
                                    <div className="metric-value">
                                        {stats.reading.todaySessions}
                                        <span className="metric-unit">min</span>
                                    </div>
                                    <div className="metric-details">
                                        <div className="detail-item">
                                            <Clock size={14} />
                                            <span>Avg: {Math.round(stats.reading.avgDuration / 60)}m per session</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Reader Metric */}
                        {Array.isArray(topUser) && topUser.length > 0 && (
                            <div className="metric-card neutral">
                                <div className="metric-header">
                                    <div className="metric-icon">
                                        <Award size={28} />
                                    </div>
                                    <div className="metric-trend neutral">
                                        <Star size={16} />
                                    </div>
                                </div>
                                <div className="metric-content">
                                    <h3>Top Reader</h3>
                                    <div className="metric-value top-reader">{topUser[0].name}</div>
                                    <div className="metric-details">
                                        <div className="detail-item">
                                            <Clock size={14} />
                                            <span>{topUser[0].totalMinutes} minutes total</span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* Main Content Grid */}
                <div className="main-content-grid">
                    {/* Charts Section */}
                    <div className="charts-section">
                        {/* Books Per Month Chart */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <div className="chart-title">
                                    <BarChart3 size={24} />
                                    <div>
                                        <h3>Books Added Per Month</h3>
                                        <p>Monthly book added</p>
                                    </div>
                                </div>
                            </div>
                            <div className="chart-content">
                                <canvas ref={chartRef} height="300"></canvas>
                                <BooksPerMonthChart data={booksAnalytics} chartRef={chartRef} />
                            </div>
                        </div>

                        {/* Radar Chart */}
                        <div className="chart-card">
                            <div className="chart-header">
                                <div className="chart-title">
                                    <PieChart size={24} />
                                    <div>
                                        <h3>Library Overview</h3>
                                        <p>System radar chart</p>
                                    </div>
                                </div>
                            </div>
                            <div className="chart-content radar-content">
                                <RadarChart stats={stats} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar Content */}
                    <div className="sidebar-content">
                        {/* Top Readers Section - Simplified */}
                        {Array.isArray(topUser) && topUser.length > 0 && (
                            <div className="sidebar-card">
                                <div className="sidebar-header">
                                    <Award size={20} />
                                    <h3>Top Readers</h3>
                                </div>
                                <div className="top-readers-list">
                                    {topUser.slice(0, 3).map((reader, index) => (
                                        <div key={reader.name} className="reader-item">
                                            <div className="reader-rank">
                                                <span>#{index + 1}</span>
                                            </div>
                                            <div className="reader-info">
                                                <div className="reader-name">{reader.name}</div>
                                                <div className="reader-stats">
                                                    <Clock size={12} />
                                                    <span>{reader.totalMinutes} minutes</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Stats */}
                        <div className="sidebar-card">
                            <div className="sidebar-header">
                                <BarChart3 size={20} />
                                <h3>Quick Statistics</h3>
                            </div>
                            <div className="quick-stats">
                                {stats.users && (
                                    <div className="quick-stat-item">
                                        <div className="quick-stat-label">User Roles</div>
                                        <div className="role-distribution">
                                            <div className="role-item">
                                                <Shield size={14} />
                                                <span>Admins: {stats.users.admins}</span>
                                            </div>
                                            <div className="role-item">
                                                <User size={14} />
                                                <span>Librarians: {stats.users.librarians}</span>
                                            </div>
                                            <div className="role-item">
                                                <GraduationCap size={14} />
                                                <span>Students: {stats.users.students}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {stats.books && stats.books.genres && (
                                    <div className="quick-stat-item">
                                        <div className="quick-stat-label">Popular Genres</div>
                                        <div className="genre-list">
                                            {stats.books.genres.slice(0, 4).map((genre, index) => (
                                                <div key={index} className="genre-item">
                                                    <BookMarked size={14} />
                                                    <span>{genre.genre}</span>
                                                    <span className="genre-count">{genre.count}</span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="sidebar-card activity-card">
                            <div className="sidebar-header">
                                <Activity size={20} />
                                <h3>Recent Activity</h3>
                                <span className="activity-count">{activities.length}</span>
                            </div>
                            <div className="activity-feed">
                                {activities.length > 0 ? (
                                    activities.slice(0, 8).map((activity, index) => (
                                        <div key={index} className="activity-item">
                                            <div className="activity-icon">
                                                {activity.type === "user_created" && <Users size={14} />}
                                                {activity.type === "book_added" && <BookOpen size={14} />}
                                                {activity.type === "book_read" && <Eye size={14} />}
                                                {activity.type === "user_login" && <UserCheck size={14} />}
                                                {activity.type === "book_updated" && <BookOpen size={14} />}
                                                {activity.type === "user_updated" && <Users size={14} />}
                                            </div>
                                            <div className="activity-content">
                                                <div className="activity-description">
                                                    {activity.type === "user_created" && (
                                                        <>
                                                            <strong>{activity.details.name}</strong> registered as{" "}
                                                            <span className={`role-badge ${activity.details.role}`}>
                                                                {getRoleIcon(activity.details.role)}
                                                                {activity.details.role}
                                                            </span>
                                                        </>
                                                    )}
                                                    {activity.type === "book_added" && (
                                                        <>
                                                            New book <strong>"{activity.details.title}"</strong> added
                                                        </>
                                                    )}
                                                    {activity.type === "book_read" && (
                                                        <>
                                                            <strong>{activity.details.userName}</strong> started reading{" "}
                                                            <strong>"{activity.details.bookTitle}"</strong>
                                                        </>
                                                    )}
                                                    {activity.type === "user_login" && (
                                                        <>
                                                            <strong>{activity.details.name}</strong> logged in
                                                        </>
                                                    )}
                                                    {activity.type === "book_updated" && (
                                                        <>
                                                            Book <strong>"{activity.details.title}"</strong> updated
                                                        </>
                                                    )}
                                                    {activity.type === "user_updated" && (
                                                        <>
                                                            User <strong>{activity.details.name}</strong> updated
                                                        </>
                                                    )}
                                                </div>
                                                <div className="activity-time">{formatTimeAgo(activity.timestamp)}</div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <div className="empty-activity">
                                        <Activity size={32} />
                                        <p>No recent activity</p>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </AuthGuard>
    )
}

export default Dashboard
