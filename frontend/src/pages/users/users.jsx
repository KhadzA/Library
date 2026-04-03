"use client"

import { useEffect, useState } from "react"
import { useSocketConnection } from "../../hooks/useSocketConnection"
import { viewUsers, toggleStatus } from "../../api/users"
import UsersToast, { useUsersToast } from "../../components/users/usersToast"
import AddUserModal from "./addUserModal"
import EditUserModal from "./editUserModal"
import DeleteUserModal from "./deleteUserModal"
import "./users.css"
import {
    UsersIcon,
    Plus,
    Search,
    Filter,
    Shield,
    User,
    GraduationCap,
    Eye,
    MoreHorizontal,
    Edit,
    Trash2,
    UserCheck,
    UserX,
    UserMinus,
    ChevronLeft,
    ChevronRight,
    ChevronDown,
    Check,
} from "lucide-react"

/* ─── Role config ─── */
const roleOptions = [
    {
        value: "admin",
        label: "Admin",
        icon: Shield,
        description: "Full system access",
        lightColor: "#92400e",
        lightBg: "#fef3c7",
        darkColor: "#fcd34d",
        darkBg: "#78350f",
    },
    {
        value: "librarian",
        label: "Librarian",
        icon: User,
        description: "Manage books and users",
        lightColor: "#1e40af",
        lightBg: "#dbeafe",
        darkColor: "#93c5fd",
        darkBg: "#1e3a8a",
    },
    {
        value: "student",
        label: "Student",
        icon: GraduationCap,
        description: "Borrow and return books",
        lightColor: "#065f46",
        lightBg: "#d1fae5",
        darkColor: "#6ee7b7",
        darkBg: "#064e3b",
    },
]

const statusConfig = {
    active: { label: "Active", icon: UserCheck, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
    inactive: { label: "Inactive", icon: UserX, cls: "bg-slate-100 text-slate-500 dark:bg-slate-700/50 dark:text-slate-400 cursor-not-allowed" },
    suspended: { label: "Suspended", icon: UserMinus, cls: "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-400" },
}

function getRoleData(role) {
    return roleOptions.find((r) => r.value === role) || roleOptions[2]
}

function calcPosition(el, w = 160, h = 160) {
    const r = el.getBoundingClientRect()
    const vw = window.innerWidth, vh = window.innerHeight
    let top = r.bottom + 4
    let left = r.right - w
    if (left < 8) left = r.left
    if (left + w > vw - 8) left = vw - w - 8
    if (top + h > vh - 8) top = r.top - h - 4
    if (top < 8) top = r.bottom + 4
    return { top, left }
}

function calcRolePosition(el) {
    const r = el.getBoundingClientRect()
    const vw = window.innerWidth, vh = window.innerHeight
    const w = 280, h = 220
    let top = r.bottom + 4
    let left = r.left
    if (left + w > vw - 8) left = r.right - w
    if (left < 8) left = 8
    if (top + h > vh - 8) top = r.top - h - 4
    if (top < 8) top = r.bottom + 4
    return { top, left }
}

/* ─── Main component ─── */
function Users() {
    useSocketConnection()

    const [users, setUsers] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const [showAddModal, setShowAddModal] = useState(false)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)
    const [selectedUser, setSelectedUser] = useState(null)

    const [searchTerm, setSearchTerm] = useState("")
    const [filterRole, setFilterRole] = useState("")
    const [filterStatus, setFilterStatus] = useState("")

    const [openDropDown, setOpenDropDown] = useState(null)
    const [dropDownPosition, setDropDownPosition] = useState({ top: 0, left: 0 })
    const [openRoleDropDown, setOpenRoleDropDown] = useState(null)
    const [roleDropDownPosition, setRoleDropDownPosition] = useState({ top: 0, left: 0 })

    const { usersToast, toasts, removeToast } = useUsersToast()

    /* ─── Fetch ─── */
    const fetchUsers = async (page = 1, search = "") => {
        setIsLoading(true)
        try {
            const res = await viewUsers(page, 10, search)
            if (res.success) {
                setUsers(res.users || [])
                setTotalUsers(res.total || 0)
                setTotalPages(Math.ceil((res.total || 0) / 10))
                setCurrentPage(page)
            } else {
                usersToast.error("Error", "Failed to fetch users")
            }
        } catch {
            usersToast.error("Error", "An error occurred while fetching users")
        }
        setIsLoading(false)
    }

    useEffect(() => { fetchUsers(currentPage, searchTerm) }, [searchTerm, currentPage])

    /* ─── Close on scroll / resize ─── */
    useEffect(() => {
        const close = () => { setOpenDropDown(null); setOpenRoleDropDown(null) }
        window.addEventListener("scroll", close, true)
        window.addEventListener("resize", close)
        return () => {
            window.removeEventListener("scroll", close, true)
            window.removeEventListener("resize", close)
        }
    }, [openDropDown, openRoleDropDown])

    /* ─── Handlers ─── */
    const handleAddSuccess = (newUser) => {
        fetchUsers(currentPage)
        usersToast.success("User Added", `${newUser.name} has been added successfully`)
    }

    const handleEditSuccess = (updatedUser) => {
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
        setSelectedUser(null)
    }

    const handleDeleteSuccess = (deletedId) => {
        setUsers((prev) => {
            const next = prev.filter((u) => u.id !== deletedId)
            if (next.length === 0 && currentPage > 1) fetchUsers(currentPage - 1)
            else { setTotalUsers((t) => t - 1); setTotalPages(Math.ceil((totalUsers - 1) / 10)) }
            return next
        })
        setSelectedUser(null)
    }

    const handleToggleStatus = async (userId, currentStatus) => {
        if (currentStatus === "inactive") return
        try {
            const res = await toggleStatus(userId, currentStatus)
            if (res.success) {
                setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: res.newStatus } : u)))
                usersToast.success("Status Updated", `User status changed to ${res.newStatus}`)
            } else {
                usersToast.error("Update Failed", "Failed to update user status")
            }
        } catch {
            usersToast.error("Error", "An error occurred while updating status")
        }
    }

    const handleRoleChange = async (userId, newRole) => {
        try {
            const userToUpdate = users.find((u) => u.id === userId)
            if (!userToUpdate) return
            const res = await import("../../api/users").then((api) => api.editUser({ ...userToUpdate, role: newRole }))
            if (res.success) {
                setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, role: newRole } : u)))
                usersToast.success("Role Updated", `User role changed to ${roleOptions.find((r) => r.value === newRole)?.label}`)
                setOpenRoleDropDown(null)
            } else {
                usersToast.error("Update Failed", "Failed to update user role")
            }
        } catch {
            usersToast.error("Error", "An error occurred while updating role")
        }
    }

    const handleDropDownToggle = (userId, e) => {
        if (openDropDown === userId) { setOpenDropDown(null); return }
        setDropDownPosition(calcPosition(e.currentTarget))
        setOpenDropDown(userId)
    }

    const handleRoleDropDownToggle = (userId, e) => {
        if (openRoleDropDown === userId) { setOpenRoleDropDown(null); return }
        setRoleDropDownPosition(calcRolePosition(e.currentTarget))
        setOpenRoleDropDown(userId)
    }

    const handleClickOutside = (e) => {
        if (
            !e.target.closest(".actions-menu") &&
            !e.target.closest(".dropdown-portal") &&
            !e.target.closest(".role-badge-btn") &&
            !e.target.closest(".role-dropdown-portal")
        ) {
            setOpenDropDown(null)
            setOpenRoleDropDown(null)
        }
    }

    /* ─── Pagination ─── */
    const goToPage = (p) => { if (p >= 1 && p <= totalPages && p !== currentPage) fetchUsers(p) }

    const pageNumbers = () => {
        const pages = []
        if (totalPages <= 5) {
            for (let i = 1; i <= totalPages; i++) pages.push(i)
        } else if (currentPage <= 3) {
            pages.push(1, 2, 3, 4, "...", totalPages)
        } else if (currentPage >= totalPages - 2) {
            pages.push(1, "...", totalPages - 3, totalPages - 2, totalPages - 1, totalPages)
        } else {
            pages.push(1, "...", currentPage - 1, currentPage, currentPage + 1, "...", totalPages)
        }
        return pages
    }

    /* ─── Filtered list ─── */
    const filtered = users.filter((u) => {
        const s = searchTerm.toLowerCase()
        const matchSearch =
            !s ||
            u.name.toLowerCase().includes(s) ||
            u.email.toLowerCase().includes(s) ||
            u.department.toLowerCase().includes(s)
        return matchSearch && (!filterRole || u.role === filterRole) && (!filterStatus || u.status === filterStatus)
    })

    /* ─── Render ─── */
    return (
        <div
            className="min-h-screen p-6 bg-slate-50 dark:bg-slate-900 font-sans transition-colors duration-300"
            onClick={handleClickOutside}
        >

            {/* ── Page Header ── */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 p-6 mb-6 flex items-center justify-between transition-colors duration-300">
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-xl bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400">
                        <UsersIcon size={24} />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-800 dark:text-slate-100 m-0">
                            Users Management
                        </h1>
                        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5 m-0">
                            Manage library users and permissions
                        </p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white text-sm font-semibold px-5 py-2.5 rounded-xl transition-all duration-200 shadow-sm hover:-translate-y-px"
                >
                    <Plus size={18} />
                    Add New User
                </button>
            </div>

            {/* ── Modals ── */}
            <AddUserModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
                usersToast={usersToast}
            />
            <EditUserModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={selectedUser}
                onSuccess={handleEditSuccess}
                usersToast={usersToast}
            />
            <DeleteUserModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                user={selectedUser}
                onSuccess={handleDeleteSuccess}
                usersToast={usersToast}
            />

            {/* ── Search & Filters ── */}
            <div className="flex flex-wrap gap-3 mb-6 items-center">
                {/* Search */}
                <div className="flex-1 min-w-[220px] relative flex items-center">
                    <Search size={16} className="absolute left-3 text-slate-400 pointer-events-none" />
                    <input
                        type="text"
                        placeholder="Search by name, email, or department…"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl text-sm bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition duration-200"
                    />
                </div>

                {/* Role filter */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 transition-colors duration-200">
                    <Filter size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <select
                        value={filterRole}
                        onChange={(e) => setFilterRole(e.target.value)}
                        className="text-sm text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer"
                    >
                        <option value="" className="dark:bg-slate-800">All Roles</option>
                        <option value="admin" className="dark:bg-slate-800">Admin</option>
                        <option value="librarian" className="dark:bg-slate-800">Librarian</option>
                        <option value="student" className="dark:bg-slate-800">Student</option>
                    </select>
                </div>

                {/* Status filter */}
                <div className="flex items-center gap-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl px-3 py-2.5 transition-colors duration-200">
                    <Filter size={14} className="text-slate-400 dark:text-slate-500 shrink-0" />
                    <select
                        value={filterStatus}
                        onChange={(e) => setFilterStatus(e.target.value)}
                        className="text-sm text-slate-700 dark:text-slate-200 bg-transparent outline-none cursor-pointer"
                    >
                        <option value="" className="dark:bg-slate-800">All Status</option>
                        <option value="active" className="dark:bg-slate-800">Active</option>
                        <option value="inactive" className="dark:bg-slate-800">Inactive</option>
                        <option value="suspended" className="dark:bg-slate-800">Suspended</option>
                    </select>
                </div>
            </div>

            {/* ── Table Card ── */}
            <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden transition-colors duration-300">

                {/* Card header */}
                <div className="flex items-center justify-between px-6 py-4 border-b border-slate-200 dark:border-slate-700">
                    <h2 className="text-base font-semibold text-slate-800 dark:text-slate-100">All Users</h2>
                    <div className="flex flex-col items-end gap-0.5">
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                            {filtered.length} of {totalUsers} users
                        </span>
                        <span className="text-xs text-slate-400 dark:text-slate-500">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    /* ── Loading ── */
                    <div className="flex flex-col items-center justify-center py-20 gap-4 text-slate-400">
                        <div className="w-10 h-10 border-4 border-slate-200 dark:border-slate-700 border-t-blue-600 rounded-full animate-spin" />
                        <p className="text-sm font-medium">Loading users…</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="bg-slate-50 dark:bg-slate-700/50 border-b border-slate-200 dark:border-slate-700">
                                    {["User", "Department", "Role", "Status", "Joined", "Actions"].map((h) => (
                                        <th
                                            key={h}
                                            className="px-5 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wide whitespace-nowrap"
                                        >
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                                {filtered.length > 0 ? (
                                    filtered.map((user) => {
                                        const roleData = getRoleData(user.role)
                                        const RoleIcon = roleData.icon
                                        const sc = statusConfig[user.status] || statusConfig.inactive
                                        const StatusIcon = sc.icon

                                        return (
                                            <tr
                                                key={user.id}
                                                className="hover:bg-slate-50 dark:hover:bg-slate-700/40 transition-colors duration-150"
                                            >
                                                {/* User info */}
                                                <td className="px-5 py-3.5 text-left">
                                                    <div className="flex items-center gap-3 min-w-[180px]">
                                                        <div className="w-9 h-9 rounded-full bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0">
                                                            <User size={16} />
                                                        </div>
                                                        <div className="flex flex-col min-w-0">
                                                            <span className="font-semibold text-slate-800 dark:text-slate-100 truncate">
                                                                {user.name}
                                                            </span>
                                                            <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                                                                {user.email}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </td>

                                                {/* Department */}
                                                <td className="px-5 py-3.5 text-center text-slate-700 dark:text-slate-300 font-medium">
                                                    {user.department}
                                                </td>

                                                {/* Role badge / dropdown trigger */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <RoleBadge
                                                        roleData={roleData}
                                                        isOpen={openRoleDropDown === user.id}
                                                        onToggle={(e) => { e.stopPropagation(); handleRoleDropDownToggle(user.id, e) }}
                                                    />
                                                </td>

                                                {/* Status badge */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <button
                                                        className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 transition-all ${sc.cls} ${user.status !== "inactive" ? "hover:opacity-80 hover:-translate-y-px cursor-pointer" : ""}`}
                                                        onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.id, user.status) }}
                                                    >
                                                        <StatusIcon size={13} />
                                                        {sc.label}
                                                    </button>
                                                </td>

                                                {/* Joined date */}
                                                <td className="px-5 py-3.5 text-center text-xs text-slate-500 dark:text-slate-400 whitespace-nowrap">
                                                    {new Date(user.created_at).toLocaleDateString("en-US", {
                                                        year: "numeric", month: "short", day: "numeric",
                                                    })}
                                                </td>

                                                {/* Actions */}
                                                <td className="px-5 py-3.5 text-center">
                                                    <div className="actions-menu flex justify-center">
                                                        <button
                                                            className="p-2 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
                                                            onClick={(e) => { e.stopPropagation(); handleDropDownToggle(user.id, e) }}
                                                        >
                                                            <MoreHorizontal size={16} />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center">
                                            <div className="flex flex-col items-center gap-3 text-slate-400 dark:text-slate-500">
                                                <UsersIcon size={44} className="text-slate-300 dark:text-slate-600" />
                                                <p className="font-semibold text-slate-600 dark:text-slate-400">No users found</p>
                                                <p className="text-sm">Try adjusting your search or filter criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* ── Pagination ── */}
                        {totalPages > 1 && !isLoading && (
                            <div className="flex items-center justify-center gap-2 px-6 py-5 border-t border-slate-100 dark:border-slate-700">
                                <button
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    onClick={() => goToPage(currentPage - 1)}
                                    disabled={currentPage === 1}
                                >
                                    <ChevronLeft size={15} /> Prev
                                </button>

                                <div className="flex gap-1">
                                    {pageNumbers().map((p, i) => (
                                        <button
                                            key={i}
                                            className={`w-9 h-9 text-sm font-medium rounded-lg transition ${p === currentPage
                                                ? "bg-blue-600 text-white shadow-sm"
                                                : p === "..."
                                                    ? "cursor-default text-slate-400 dark:text-slate-500 bg-transparent border-0"
                                                    : "bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700"
                                                }`}
                                            onClick={() => typeof p === "number" && goToPage(p)}
                                            disabled={p === "..." || p === currentPage}
                                        >
                                            {p}
                                        </button>
                                    ))}
                                </div>

                                <button
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm font-medium rounded-lg border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition"
                                    onClick={() => goToPage(currentPage + 1)}
                                    disabled={currentPage === totalPages}
                                >
                                    Next <ChevronRight size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* ── Actions dropdown portal ── */}
            {openDropDown && (
                <div
                    className="dropdown-portal fixed z-[9999]"
                    style={{ top: dropDownPosition.top, left: dropDownPosition.left }}
                >
                    <div className="dropdown-animate bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl min-w-[160px] py-1 overflow-hidden">
                        <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left">
                            <Eye size={14} className="text-slate-400 dark:text-slate-500" />
                            View Details
                        </button>
                        <button
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 transition-colors text-left"
                            onClick={() => {
                                const u = users.find((x) => x.id === openDropDown)
                                setSelectedUser(u)
                                setShowEditModal(true)
                                setOpenDropDown(null)
                            }}
                        >
                            <Edit size={14} className="text-slate-400 dark:text-slate-500" />
                            Edit User
                        </button>
                        <div className="mx-3 my-1 border-t border-slate-100 dark:border-slate-700" />
                        <button
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/30 transition-colors text-left"
                            onClick={() => {
                                const u = users.find((x) => x.id === openDropDown)
                                setSelectedUser(u)
                                setShowDeleteModal(true)
                                setOpenDropDown(null)
                            }}
                        >
                            <Trash2 size={14} />
                            Delete User
                        </button>
                    </div>
                </div>
            )}

            {/* ── Role dropdown portal ── */}
            {openRoleDropDown && (() => {
                const user = users.find((u) => u.id === openRoleDropDown)
                return (
                    <div
                        className="role-dropdown-portal fixed z-[9999]"
                        style={{ top: roleDropDownPosition.top, left: roleDropDownPosition.left }}
                    >
                        <div className="dropdown-animate bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-600 rounded-xl shadow-xl w-72 py-1 overflow-hidden">
                            <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-700">
                                <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
                                    Change Role
                                </span>
                            </div>
                            {roleOptions.map((role) => {
                                const isCurrent = user?.role === role.value
                                const Icon = role.icon
                                return (
                                    <button
                                        key={role.value}
                                        className={`flex items-center justify-between w-full px-4 py-3 text-left transition-colors ${isCurrent ? "" : "hover:bg-slate-50 dark:hover:bg-slate-700/60"
                                            }`}
                                        style={isCurrent
                                            ? { backgroundColor: role.darkBg }
                                            : {}
                                        }
                                        onClick={() => !isCurrent && handleRoleChange(openRoleDropDown, role.value)}
                                        disabled={isCurrent}
                                    >
                                        <div className="flex items-center gap-3">
                                            <div
                                                className="w-8 h-8 rounded-lg flex items-center justify-center"
                                                style={{ backgroundColor: role.darkBg, color: role.darkColor }}
                                            >
                                                <Icon size={15} />
                                            </div>
                                            <div>
                                                <div className="text-sm font-semibold text-slate-800 dark:text-slate-100">
                                                    {role.label}
                                                </div>
                                                <div className="text-xs text-slate-400 dark:text-slate-500">
                                                    {role.description}
                                                </div>
                                            </div>
                                        </div>
                                        {isCurrent && <Check size={15} style={{ color: role.darkColor }} />}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )
            })()}

            <UsersToast toasts={toasts} removeToast={removeToast} />
        </div>
    )
}

/* ─── Role badge sub-component ─── */
function RoleBadge({ roleData, isOpen, onToggle }) {
    const Icon = roleData.icon
    return (
        <button
            className="role-badge-btn inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border-0 cursor-pointer transition-all hover:-translate-y-px hover:shadow-md"
            style={{
                backgroundColor: roleData.lightBg,
                color: roleData.lightColor,
            }}
            onClick={onToggle}
        >
            <Icon size={13} />
            {roleData.label}
            <ChevronDown
                size={12}
                className={`transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
        </button>
    )
}

export default Users