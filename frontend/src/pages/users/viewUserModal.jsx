"use client"

import { X, User, Mail, Building, Shield, GraduationCap, UserCheck, UserMinus, UserX, Calendar, Hash } from "lucide-react"

function ViewUserModal({ isOpen, onClose, user }) {
    if (!isOpen || !user) return null

    const getRoleData = (role) => {
        if (role === "admin") return {
            icon: <Shield size={14} />,
            label: "Admin",
            cls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400"
        }
        if (role === "librarian") return {
            icon: <User size={14} />,
            label: "Librarian",
            cls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400"
        }
        return {
            icon: <GraduationCap size={14} />,
            label: "Student",
            cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
        }
    }

    const getStatusData = (status) => {
        if (status === "active") return {
            icon: <UserCheck size={14} />,
            label: "Active",
            cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400"
        }
        if (status === "suspended") return {
            icon: <UserMinus size={14} />,
            label: "Suspended",
            cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400"
        }
        return {
            icon: <UserX size={14} />,
            label: "Inactive",
            cls: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400"
        }
    }

    const roleData = getRoleData(user.role)
    const statusData = getStatusData(user.status)

    const getInitials = (name) => {
        if (!name) return "?"
        const parts = name.trim().split(" ")
        if (parts.length === 1) return parts[0].charAt(0).toUpperCase()
        return (parts[0].charAt(0) + parts[parts.length - 1].charAt(0)).toUpperCase()
    }

    const Field = ({ icon, label, value }) => (
        <div className="flex items-start gap-3 p-3 rounded-xl bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
            <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-white dark:bg-gray-600 border border-gray-200 dark:border-gray-500 text-gray-400 dark:text-gray-300 shrink-0 mt-0.5">
                {icon}
            </div>
            <div className="min-w-0">
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-400 dark:text-gray-500 mb-0.5">
                    {label}
                </p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                    {value || "—"}
                </p>
            </div>
        </div>
    )

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose}
        >
            <div
                className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl shadow-2xl
                    bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700
                    animate-in slide-in-from-bottom-4 zoom-in-95 duration-300"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header */}
                <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-100 dark:border-gray-700
                    bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/40 dark:to-indigo-950/40 rounded-t-2xl">
                    <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-600 text-white shadow-md shadow-blue-500/30">
                        <User size={18} />
                    </div>
                    <div>
                        <h2 className="text-base font-bold text-gray-900 dark:text-white">User Details</h2>
                        <p className="text-xs text-gray-500 dark:text-gray-400">Viewing profile information</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-auto p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                            hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                    >
                        <X size={18} />
                    </button>
                </div>

                <div className="px-6 py-5 space-y-5">
                    {/* Avatar + name + badges */}
                    <div className="flex items-center gap-4 p-4 rounded-xl
                        bg-gray-50 dark:bg-gray-700/50 border border-gray-200 dark:border-gray-600">
                        <div className="flex items-center justify-center w-16 h-16 rounded-full
                            bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400
                            text-xl font-bold shrink-0">
                            {getInitials(user.name)}
                        </div>
                        <div className="min-w-0 flex-1">
                            <p className="text-lg font-bold text-gray-900 dark:text-white truncate">
                                {user.name}
                            </p>
                            <p className="text-sm text-gray-500 dark:text-gray-400 truncate mb-2">
                                {user.email}
                            </p>
                            <div className="flex items-center gap-2 flex-wrap">
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${roleData.cls}`}>
                                    {roleData.icon}
                                    {roleData.label}
                                </span>
                                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${statusData.cls}`}>
                                    {statusData.icon}
                                    {statusData.label}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Detail fields */}
                    <div className="grid grid-cols-1 gap-3">
                        <Field icon={<Hash size={15} />} label="User ID" value={`#${user.id}`} />
                        <Field icon={<Mail size={15} />} label="Email Address" value={user.email} />
                        <Field icon={<Building size={15} />} label="Department" value={user.department} />
                        <Field
                            icon={<Calendar size={15} />}
                            label="Member Since"
                            value={user.created_at
                                ? new Date(user.created_at).toLocaleDateString("en-US", {
                                    year: "numeric", month: "long", day: "numeric"
                                })
                                : null
                            }
                        />
                    </div>
                </div>

                {/* Footer */}
                <div className="flex justify-end px-6 py-4
                    border-t border-gray-100 dark:border-gray-700 bg-gray-50/50 dark:bg-gray-800/50 rounded-b-2xl">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-medium rounded-lg border
                            border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300
                            bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600 transition"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    )
}

export default ViewUserModal