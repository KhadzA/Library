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
            r: {
                angleLines: { display: true, color: "rgba(156, 163, 175, 0.2)" },
                grid: { color: "rgba(156, 163, 175, 0.2)" },
                pointLabels: { font: { size: 12, weight: "600" }, color: "#6b7280" },
                ticks: { display: false },
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
                resizeDelay: 0,
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
                        ticks: { color: "#6b7280", font: { weight: "500" } },
                    },
                    y: {
                        grid: { color: "rgba(156, 163, 175, 0.1)", drawBorder: false },
                        ticks: { color: "#6b7280", font: { weight: "500" } },
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

    const [stats, setStats] = useState({ users: null, books: null, reading: null })
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
            case "admin": return <Shield size={16} />
            case "librarian": return <User size={16} />
            case "student": return <GraduationCap size={16} />
            default: return <User size={16} />
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

    // ─── Loading ────────────────────────────────────────────────────────────────
    if (isLoading) {
        return (
            <div className="p-4 min-[480px]:p-5 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors duration-300">
                <div className="flex flex-col items-center justify-center py-30 px-5 text-gray-500 dark:text-slate-400 transition-colors duration-300">
                    <div className="w-12 h-12 border-4 border-gray-200 dark:border-slate-600 border-t-blue-500 rounded-full animate-spin mb-6" />
                    <p className="m-0 text-lg font-medium">Loading dashboard...</p>
                </div>
            </div>
        )
    }

    // ─── Main ────────────────────────────────────────────────────────────────────
    return (
        <AuthGuard allowedRoles={["admin", "librarian"]}>
            <div className="p-4 min-[480px]:p-5 md:p-8 bg-slate-50 dark:bg-slate-900 min-h-[calc(100vh-64px)] transition-colors duration-300 overflow-x-hidden">
                {/* ── Header ──────────────────────────────────────────────────── */}
                <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-8 mb-8 shadow-sm border border-slate-200 dark:border-slate-700 transition-all duration-300">
                    <div className="flex flex-col gap-5 md:flex-row md:items-center md:justify-between">
                        {/* Title */}
                        <div className="flex-1">
                            <h1 className="text-2xl min-[480px]:text-[28px] md:text-[32px] font-bold mb-2 m-0 text-gray-800 dark:text-slate-50 transition-colors duration-300">
                                Library Management System
                            </h1>
                            <p className="text-base m-0 text-gray-500 dark:text-slate-400 font-medium transition-colors duration-300">
                                Insights and Analytics of the digital library
                            </p>
                        </div>
                        {/* Actions */}
                        <div className="flex items-center justify-between md:justify-end gap-5">
                            <button
                                onClick={handleRefresh}
                                className="flex items-center gap-2.5 bg-blue-500 hover:bg-blue-600 text-white border-none py-3 px-5 rounded-xl text-sm font-semibold cursor-pointer transition-all duration-200 shadow-[0_2px_8px_rgba(59,130,246,0.2)] hover:-translate-y-px hover:shadow-[0_4px_12px_rgba(59,130,246,0.3)] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-blue-500"
                            >
                                <RefreshCw size={18} />
                                <span>Refresh Data</span>
                            </button>
                            {lastUpdated && (
                                <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-700 py-2 px-3 rounded-lg border border-slate-200 dark:border-slate-600 transition-all duration-300">
                                    <Clock size={14} />
                                    <span>Updated {lastUpdated.toLocaleTimeString()}</span>
                                </div>
                            )}
                        </div>
                    </div>
                </div>

                {/* ── Key Metrics ─────────────────────────────────────────────── */}
                <div className="mb-8">
                    <div className="flex items-center gap-3 mb-5">
                        <Target size={24} className="text-blue-500" />
                        <h2 className="text-2xl font-bold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                            Key Performance Metrics
                        </h2>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-4 md:gap-5">

                        {/* Total Users — blue */}
                        {stats.users && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 min-[480px]:p-5 md:p-6 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg animate-[fadeInUp_0.6s_ease-out]">
                                <div className="absolute top-0 left-0 right-0 h-0.75 bg-blue-500 rounded-t-2xl" />
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-blue-500 text-white shadow-md">
                                        <Users size={28} />
                                    </div>
                                    <div className="flex items-center gap-1 text-[13px] font-semibold text-emerald-500">
                                        <TrendingUp size={16} />
                                        <span>+12%</span>
                                    </div>
                                </div>
                                <h3 className="text-[13px] font-semibold text-gray-500 dark:text-slate-400 m-0 mb-2 uppercase tracking-[0.5px] transition-colors duration-300">
                                    Total Users
                                </h3>
                                <div className="text-[28px] min-[480px]:text-[32px] md:text-[36px] font-extrabold text-gray-800 dark:text-slate-50 m-0 mb-3 leading-none transition-colors duration-300">
                                    {stats.users.total}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 rounded-md py-1 px-2 transition-colors duration-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span>Active: {stats.users.active}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 rounded-md py-1 px-2 transition-colors duration-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-gray-400 dark:bg-slate-500 shrink-0" />
                                        <span>Inactive: {stats.users.inactive}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Total Books — emerald */}
                        {stats.books && (
                            <div
                                className="bg-white dark:bg-slate-800 rounded-2xl p-4 min-[480px]:p-5 md:p-6 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg animate-[fadeInUp_0.6s_ease-out]"
                                style={{ animationDelay: "0.1s" }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-0.75 bg-emerald-500 rounded-t-2xl" />
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-emerald-500 text-white shadow-md">
                                        <BookOpen size={28} />
                                    </div>
                                    <div className="flex items-center gap-1 text-[13px] font-semibold text-emerald-500">
                                        <TrendingUp size={16} />
                                        <span>+8%</span>
                                    </div>
                                </div>
                                <h3 className="text-[13px] font-semibold text-gray-500 dark:text-slate-400 m-0 mb-2 uppercase tracking-[0.5px] transition-colors duration-300">
                                    Total Books
                                </h3>
                                <div className="text-[28px] min-[480px]:text-[32px] md:text-[36px] font-extrabold text-gray-800 dark:text-slate-50 m-0 mb-3 leading-none transition-colors duration-300">
                                    {stats.books.total}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 rounded-md py-1 px-2 transition-colors duration-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                                        <span>Available: {stats.books.available}</span>
                                    </div>
                                    <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 rounded-md py-1 px-2 transition-colors duration-300">
                                        <div className="w-1.5 h-1.5 rounded-full bg-amber-500 shrink-0" />
                                        <span>Borrowed: {stats.books.unavailable}</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Reading Time — amber */}
                        {stats.reading && (
                            <div
                                className="bg-white dark:bg-slate-800 rounded-2xl p-4 min-[480px]:p-5 md:p-6 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg animate-[fadeInUp_0.6s_ease-out]"
                                style={{ animationDelay: "0.2s" }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-0.75 bg-amber-500 rounded-t-2xl" />
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-amber-500 text-white shadow-md">
                                        <Eye size={28} />
                                    </div>
                                    <div className="flex items-center gap-1 text-[13px] font-semibold text-emerald-500">
                                        <TrendingUp size={16} />
                                        <span>+15%</span>
                                    </div>
                                </div>
                                <h3 className="text-[13px] font-semibold text-gray-500 dark:text-slate-400 m-0 mb-2 uppercase tracking-[0.5px] transition-colors duration-300">
                                    Reading Time Today
                                </h3>
                                <div className="text-[28px] min-[480px]:text-[32px] md:text-[36px] font-extrabold text-gray-800 dark:text-slate-50 m-0 mb-3 leading-none transition-colors duration-300">
                                    {stats.reading.todaySessions}
                                    <span className="text-base font-semibold text-gray-500 dark:text-slate-400 ml-1 transition-colors duration-300">
                                        min
                                    </span>
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 rounded-md py-1 px-2 transition-colors duration-300">
                                        <Clock size={14} />
                                        <span>Avg: {Math.round(stats.reading.avgDuration / 60)}m per session</span>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Top Reader — gray */}
                        {Array.isArray(topUser) && topUser.length > 0 && (
                            <div
                                className="bg-white dark:bg-slate-800 rounded-2xl p-4 min-[480px]:p-5 md:p-6 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 relative overflow-hidden hover:-translate-y-0.5 hover:shadow-lg animate-[fadeInUp_0.6s_ease-out]"
                                style={{ animationDelay: "0.3s" }}
                            >
                                <div className="absolute top-0 left-0 right-0 h-0.75 bg-gray-500 rounded-t-2xl" />
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center justify-center w-14 h-14 rounded-xl bg-gray-500 text-white shadow-md">
                                        <Award size={28} />
                                    </div>
                                    <div className="flex items-center gap-1 text-[13px] font-semibold text-gray-500 dark:text-slate-400">
                                        <Star size={16} />
                                    </div>
                                </div>
                                <h3 className="text-[13px] font-semibold text-gray-500 dark:text-slate-400 m-0 mb-2 uppercase tracking-[0.5px] transition-colors duration-300">
                                    Top Reader
                                </h3>
                                <div className="text-lg font-semibold text-gray-800 dark:text-slate-50 m-0 mb-3 leading-none transition-colors duration-300">
                                    {topUser[0].name}
                                </div>
                                <div className="flex flex-col gap-1.5">
                                    <div className="flex items-center gap-2 text-[13px] text-gray-500 dark:text-slate-400 font-medium bg-slate-100 dark:bg-slate-700 rounded-md py-1 px-2 transition-colors duration-300">
                                        <Clock size={14} />
                                        <span>{topUser[0].totalMinutes} minutes total</span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Main Content Grid ────────────────────────────────────────── */}
                <div className="grid grid-cols-1 xl:grid-cols-[2fr_1fr] gap-6 min-w-0">

                    {/* Charts */}
                    <div className="flex flex-col gap-5 md:gap-5 min-w-0">

                        {/* Books Per Month */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 animate-[fadeInUp_0.6s_ease-out]">
                            <div className="mb-5">
                                <div className="flex items-center gap-3">
                                    <BarChart3 size={24} className="text-blue-500" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                            Books Added Per Month
                                        </h3>
                                        <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-0.5 m-0 transition-colors duration-300">
                                            Monthly book added
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-75 relative overflow-hidden">
                                <canvas ref={chartRef} height="300" />
                                <BooksPerMonthChart data={booksAnalytics} chartRef={chartRef} />
                            </div>
                        </div>

                        {/* Radar Chart */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-5 md:p-6 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 animate-[fadeInUp_0.6s_ease-out]">
                            <div className="mb-5">
                                <div className="flex items-center gap-3">
                                    <PieChart size={24} className="text-blue-500" />
                                    <div>
                                        <h3 className="text-lg font-semibold text-gray-800 dark:text-slate-50 m-0 transition-colors duration-300">
                                            Library Overview
                                        </h3>
                                        <p className="text-[13px] text-gray-500 dark:text-slate-400 mt-0.5 m-0 transition-colors duration-300">
                                            System radar chart
                                        </p>
                                    </div>
                                </div>
                            </div>
                            <div className="h-75 relative flex items-center justify-center">
                                <RadarChart stats={stats} />
                            </div>
                        </div>
                    </div>

                    {/* Sidebar */}
                    {/* flex-col on xl+, responsive auto-grid below that */}
                    <div className="grid grid-cols-[repeat(auto-fit,minmax(280px,1fr))] gap-5 xl:flex xl:flex-col">

                        {/* Top Readers */}
                        {Array.isArray(topUser) && topUser.length > 0 && (
                            <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 animate-[fadeInUp_0.6s_ease-out]">
                                <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-300 dark:border-slate-600 transition-colors duration-300">
                                    <Award size={20} className="text-blue-500" />
                                    <h3 className="text-base font-semibold text-gray-800 dark:text-slate-50 m-0 flex-1 transition-colors duration-300">
                                        Top Readers
                                    </h3>
                                </div>
                                <div className="flex flex-col gap-3">
                                    {topUser.slice(0, 3).map((reader, index) => (
                                        <div
                                            key={reader.name}
                                            className="flex items-center gap-3 p-3 bg-slate-100 dark:bg-slate-700 rounded-[10px] border border-slate-200 dark:border-slate-600 transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                                        >
                                            <div className="flex items-center justify-center w-7 h-7 bg-slate-200 dark:bg-slate-600 text-gray-800 dark:text-slate-50 rounded-lg text-[13px] font-semibold transition-all duration-300">
                                                <span>#{index + 1}</span>
                                            </div>
                                            <div className="flex-1">
                                                <div className="font-semibold text-gray-800 dark:text-slate-50 mb-0.5 text-sm transition-colors duration-300">
                                                    {reader.name}
                                                </div>
                                                <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
                                                    <Clock size={12} />
                                                    <span>{reader.totalMinutes} minutes</span>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Quick Statistics */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 animate-[fadeInUp_0.6s_ease-out]">
                            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-300 dark:border-slate-600 transition-colors duration-300">
                                <BarChart3 size={20} className="text-blue-500" />
                                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-50 m-0 flex-1 transition-colors duration-300">
                                    Quick Statistics
                                </h3>
                            </div>
                            <div className="flex flex-col gap-4">
                                {stats.users && (
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-[10px] border border-slate-200 dark:border-slate-600 transition-all duration-300">
                                        <div className="text-[13px] font-semibold text-gray-800 dark:text-slate-50 mb-2.5 transition-colors duration-300">
                                            User Roles
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
                                                <Shield size={14} />
                                                <span>Admins: {stats.users.admins}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
                                                <User size={14} />
                                                <span>Librarians: {stats.users.librarians}</span>
                                            </div>
                                            <div className="flex items-center gap-2 text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300">
                                                <GraduationCap size={14} />
                                                <span>Students: {stats.users.students}</span>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                {stats.books?.genres && (
                                    <div className="p-3 bg-slate-100 dark:bg-slate-700 rounded-[10px] border border-slate-200 dark:border-slate-600 transition-all duration-300">
                                        <div className="text-[13px] font-semibold text-gray-800 dark:text-slate-50 mb-2.5 transition-colors duration-300">
                                            Popular Genres
                                        </div>
                                        <div className="flex flex-col gap-1.5">
                                            {stats.books.genres.slice(0, 4).map((genre, index) => (
                                                <div
                                                    key={index}
                                                    className="flex items-center justify-between gap-2 text-xs text-gray-500 dark:text-slate-400 transition-colors duration-300"
                                                >
                                                    <div className="flex items-center gap-2">
                                                        <BookMarked size={14} />
                                                        <span>{genre.genre}</span>
                                                    </div>
                                                    <span className="bg-gray-200 dark:bg-slate-600 text-gray-800 dark:text-slate-50 py-0.5 px-1.5 rounded-md text-[10px] font-semibold transition-all duration-300">
                                                        {genre.count}
                                                    </span>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Recent Activity */}
                        <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 md:p-5 shadow-md border border-slate-200 dark:border-slate-700 transition-all duration-300 max-h-112.5 flex flex-col animate-[fadeInUp_0.6s_ease-out]">
                            <div className="flex items-center gap-2.5 mb-4 pb-3 border-b border-gray-300 dark:border-slate-600 transition-colors duration-300">
                                <Activity size={20} className="text-blue-500" />
                                <h3 className="text-base font-semibold text-gray-800 dark:text-slate-50 m-0 flex-1 transition-colors duration-300">
                                    Recent Activity
                                </h3>
                                <span className="bg-slate-100 dark:bg-slate-700 text-gray-500 dark:text-slate-400 py-0.75 px-2 rounded-[10px] text-[11px] font-semibold transition-all duration-300">
                                    {activities.length}
                                </span>
                            </div>

                            {/* scrollable feed — uses .activity-feed class for custom scrollbar */}
                            <div className="activity-feed flex-1 overflow-y-auto flex flex-col gap-2">
                                {activities.length > 0 ? (
                                    activities.slice(0, 8).map((activity, index) => (
                                        <div
                                            key={index}
                                            className="flex items-start gap-2.5 p-2.5 bg-slate-100 dark:bg-slate-700 rounded-[10px] border border-slate-200 dark:border-slate-600 transition-all duration-300 hover:bg-slate-200 dark:hover:bg-slate-600 hover:border-slate-300 dark:hover:border-slate-500"
                                        >
                                            <div className="flex items-center justify-center w-6 h-6 bg-white dark:bg-slate-800 rounded-md text-gray-500 dark:text-slate-400 shrink-0 border border-slate-200 dark:border-slate-600 transition-all duration-300">
                                                {activity.type === "user_created" && <Users size={14} />}
                                                {activity.type === "book_added" && <BookOpen size={14} />}
                                                {activity.type === "book_read" && <Eye size={14} />}
                                                {activity.type === "user_login" && <UserCheck size={14} />}
                                                {activity.type === "book_updated" && <BookOpen size={14} />}
                                                {activity.type === "user_updated" && <Users size={14} />}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <div className="text-xs text-gray-800 dark:text-slate-50 leading-[1.4] mb-0.5 transition-colors duration-300">
                                                    {activity.type === "user_created" && (
                                                        <>
                                                            <strong className="font-semibold">{activity.details.name}</strong> registered as{" "}
                                                            <span className={`inline-flex items-center gap-0.75 py-0.5 px-1.25 rounded-sm text-[10px] font-semibold capitalize ${activity.details.role === "admin"
                                                                ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300"
                                                                : activity.details.role === "librarian"
                                                                    ? "bg-blue-50 dark:bg-blue-900/20 text-blue-500"
                                                                    : "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400"
                                                                }`}>
                                                                {getRoleIcon(activity.details.role)}
                                                                {activity.details.role}
                                                            </span>
                                                        </>
                                                    )}
                                                    {activity.type === "book_added" && <>New book <strong className="font-semibold">"{activity.details.title}"</strong> added</>}
                                                    {activity.type === "book_read" && <><strong className="font-semibold">{activity.details.userName}</strong> started reading <strong className="font-semibold">"{activity.details.bookTitle}"</strong></>}
                                                    {activity.type === "user_login" && <><strong className="font-semibold">{activity.details.name}</strong> logged in</>}
                                                    {activity.type === "book_updated" && <>Book <strong className="font-semibold">"{activity.details.title}"</strong> updated</>}
                                                    {activity.type === "user_updated" && <>User <strong className="font-semibold">{activity.details.name}</strong> updated</>}
                                                </div>
                                                <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium transition-colors duration-300">
                                                    {formatTimeAgo(activity.timestamp)}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    //Tailwind
                                    <div className="flex flex-col items-center justify-center py-7.5 px-5 text-center text-gray-400 dark:text-slate-500 transition-colors duration-300">
                                        <Activity size={32} className="mb-2" />
                                        <p className="m-0 text-[13px]">No recent activity</p>
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