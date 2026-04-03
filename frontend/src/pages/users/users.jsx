"use client"

import { useEffect, useState } from "react"
import { useSocketConnection } from "../../hooks/useSocketConnection"
import { viewUsers, toggleStatus } from "../../api/users"
import UsersToast, { useUsersToast } from "../../components/users/usersToast"
import AddUserModal from "./addUserModal"
import EditUserModal from "./editUserModal"
import DeleteUserModal from "./deleteUserModal"
import {
    UsersIcon, Plus, Search, Filter, Shield, User, GraduationCap,
    Eye, MoreHorizontal, Edit, Trash2, UserCheck, UserX, UserMinus,
    ChevronLeft, ChevronRight, ChevronDown, Check,
} from "lucide-react"

function Users() {
    useSocketConnection()

    const [users, setUsers] = useState([])
    const [currentPage, setCurrentPage] = useState(1)
    const [totalPages, setTotalPages] = useState(1)
    const [totalUsers, setTotalUsers] = useState(0)
    const [isLoading, setIsLoading] = useState(true)

    const [showAddModal, setShowAddModal] = useState(false)
    const [searchTerm, setSearchTerm] = useState("")
    const [filterRole, setFilterRole] = useState("")
    const [filterStatus, setFilterStatus] = useState("")
    const [openDropDown, setOpenDropDown] = useState(null)
    const [dropDownPosition, setDropDownPosition] = useState({ top: 0, left: 0 })
    const [openRoleDropDown, setOpenRoleDropDown] = useState(null)
    const [roleDropDownPosition, setRoleDropDownPosition] = useState({ top: 0, left: 0 })
    const [selectedUser, setSelectedUser] = useState(null)
    const [showEditModal, setShowEditModal] = useState(false)
    const [showDeleteModal, setShowDeleteModal] = useState(false)

    const { usersToast, toasts, removeToast } = useUsersToast()

    const roleOptions = [
        { value: "admin", label: "Admin", icon: Shield, description: "Full system access", badgeCls: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
        { value: "librarian", label: "Librarian", icon: User, description: "Manage books and users", badgeCls: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
        { value: "student", label: "Student", icon: GraduationCap, description: "Borrow and return books", badgeCls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
    ]

    const fetchUsers = async (page = 1, search = "") => {
        setIsLoading(true)
        try {
            const res = await viewUsers(page, 10, search)
            if (res.success) {
                setUsers(res.users || [])
                setTotalUsers(res.total || 0)
                setTotalPages(Math.ceil((res.total || 0) / 10))
                setCurrentPage(page)
            } else { usersToast.error("Error", "Failed to fetch users") }
        } catch (error) {
            console.error(error); usersToast.error("Error", "An error occurred while fetching users")
        }
        setIsLoading(false)
    }

    useEffect(() => { fetchUsers(currentPage, searchTerm) }, [searchTerm, currentPage])

    const handleAddSuccess = (newUser) => { fetchUsers(currentPage); usersToast.success("User Added", `${newUser.name} has been added successfully`) }

    const handleEditSuccess = (updatedUser) => {
        setUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)))
        setSelectedUser(null)
    }

    const handleDeleteSuccess = (deletedUserId) => {
        setUsers((prev) => {
            const filtered = prev.filter((u) => u.id !== deletedUserId)
            if (filtered.length === 0 && currentPage > 1) fetchUsers(currentPage - 1)
            else { setTotalUsers((t) => t - 1); setTotalPages(Math.ceil((totalUsers - 1) / 10)) }
            return filtered
        })
        setSelectedUser(null)
    }

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const res = await toggleStatus(userId, currentStatus)
            if (res.success) {
                setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status: res.newStatus } : u)))
                usersToast.success("Status Updated", `User status changed to ${res.newStatus}`)
            } else { usersToast.error("Update Failed", "Failed to update user status") }
        } catch (error) {
            console.error(error); usersToast.error("Error", "An error occurred while updating status")
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
            } else { usersToast.error("Update Failed", "Failed to update user role") }
        } catch (error) { console.error(error); usersToast.error("Error", "An error occurred while updating role") }
    }

    const calcPos = (btn, w = 160, h = 150) => {
        const r = btn.getBoundingClientRect(); const vw = window.innerWidth; const vh = window.innerHeight
        let top = r.bottom + 4; let left = r.right - w
        if (left < 8) left = r.left
        if (left + w > vw - 8) left = vw - w - 8
        if (top + h > vh - 8) top = r.top - h - 4
        if (top < 8) top = r.bottom + 4
        return { top, left }
    }

    const calcRolePos = (btn) => {
        const r = btn.getBoundingClientRect(); const vw = window.innerWidth; const vh = window.innerHeight
        const w = 280; const h = 200
        let top = r.bottom + 4; let left = r.left
        if (left + w > vw - 8) left = r.right - w
        if (left < 8) left = 8
        if (top + h > vh - 8) top = r.top - h - 4
        if (top < 8) top = r.bottom + 4
        return { top, left }
    }

    const handleDropDownToggle = (userId, e) => {
        if (openDropDown === userId) { setOpenDropDown(null); return }
        setDropDownPosition(calcPos(e.currentTarget)); setOpenDropDown(userId)
    }

    const handleRoleDropDownToggle = (userId, e) => {
        if (openRoleDropDown === userId) { setOpenRoleDropDown(null); return }
        setRoleDropDownPosition(calcRolePos(e.currentTarget)); setOpenRoleDropDown(userId)
    }

    const handleClickOutside = (e) => {
        if (!e.target.closest(".actions-menu") && !e.target.closest(".dropDown-portal") &&
            !e.target.closest(".role-dropDown-trigger") && !e.target.closest(".role-dropDown-portal")) {
            setOpenDropDown(null); setOpenRoleDropDown(null)
        }
    }

    useEffect(() => {
        const fn = () => { if (openDropDown || openRoleDropDown) { setOpenDropDown(null); setOpenRoleDropDown(null) } }
        window.addEventListener("scroll", fn, true); window.addEventListener("resize", fn)
        return () => { window.removeEventListener("scroll", fn, true); window.removeEventListener("resize", fn) }
    }, [openDropDown, openRoleDropDown])

    const handlePageChange = (page) => { if (page >= 1 && page <= totalPages && page !== currentPage) fetchUsers(page) }

    const generatePageNumbers = () => {
        const pages = []
        if (totalPages <= 5) { for (let i = 1; i <= totalPages; i++) pages.push(i) }
        else if (currentPage <= 3) { for (let i = 1; i <= 4; i++) pages.push(i); pages.push("..."); pages.push(totalPages) }
        else if (currentPage >= totalPages - 2) { pages.push(1); pages.push("..."); for (let i = totalPages - 3; i <= totalPages; i++) pages.push(i) }
        else { pages.push(1); pages.push("..."); for (let i = currentPage - 1; i <= currentPage + 1; i++) pages.push(i); pages.push("..."); pages.push(totalPages) }
        return pages
    }

    const filteredUsers = users.filter((u) => {
        const s = searchTerm.toLowerCase()
        const matchSearch = !searchTerm || u.name.toLowerCase().includes(s) || u.email.toLowerCase().includes(s) || u.department.toLowerCase().includes(s)
        return matchSearch && (!filterRole || u.role === filterRole) && (!filterStatus || u.status === filterStatus)
    })

    const getRoleData = (role) => roleOptions.find((r) => r.value === role) || roleOptions[2]

    const getStatusBadge = (status) => {
        if (status === "active") return { icon: <UserCheck size={13} />, cls: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400", label: "Active" }
        if (status === "suspended") return { icon: <UserMinus size={13} />, cls: "bg-red-100 text-red-600 dark:bg-red-900/40 dark:text-red-400", label: "Suspended" }
        return { icon: <UserX size={13} />, cls: "bg-gray-100 text-gray-500 dark:bg-gray-700 dark:text-gray-400", label: "Inactive" }
    }

    const selectCls = "px-2.5 py-2 text-sm rounded-lg border bg-white dark:bg-gray-700 " +
        "border-gray-200 dark:border-gray-600 text-gray-700 dark:text-gray-200 " +
        "focus:outline-none focus:ring-2 focus:ring-blue-500/30 transition cursor-pointer"

    return (
        <div
            className="min-h-[calc(100vh-64px)] p-6 bg-gray-50 dark:bg-gray-900 font-sans transition-colors"
            onClick={handleClickOutside}
        >
            {/* Page header */}
            <div className="flex items-center justify-between mb-6 p-5 rounded-2xl
        bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="flex items-center justify-center w-11 h-11 rounded-xl
            bg-blue-600 text-white shadow-lg shadow-blue-500/25">
                        <UsersIcon size={22} />
                    </div>
                    <div>
                        <h1 className="text-xl font-bold text-gray-900 dark:text-white">Users Management</h1>
                        <p className="text-sm text-gray-500 dark:text-gray-400">Manage library users and permissions</p>
                    </div>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold
            bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/25 transition active:scale-95"
                >
                    <Plus size={18} />
                    Add New User
                </button>
            </div>

            {/* Modals */}
            <AddUserModal isOpen={showAddModal} onClose={() => setShowAddModal(false)} onSuccess={handleAddSuccess} usersToast={usersToast} />
            <EditUserModal isOpen={showEditModal} onClose={() => setShowEditModal(false)} user={selectedUser} onSuccess={handleEditSuccess} usersToast={usersToast} />
            <DeleteUserModal isOpen={showDeleteModal} onClose={() => setShowDeleteModal(false)} user={selectedUser} onSuccess={handleDeleteSuccess} usersToast={usersToast} />

            {/* Search + Filters */}
            <div className="flex flex-wrap gap-3 mb-6">
                <div className="relative flex-1 min-w-[200px]">
                    <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border
              bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-600
              text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500
              focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-500 transition"
                    />
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={15} className="text-gray-400" />
                    <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)} className={selectCls}>
                        <option value="">All Roles</option>
                        <option value="admin">Admin</option>
                        <option value="librarian">Librarian</option>
                        <option value="student">Student</option>
                    </select>
                </div>
                <div className="flex items-center gap-2">
                    <Filter size={15} className="text-gray-400" />
                    <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className={selectCls}>
                        <option value="">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>
                </div>
            </div>

            {/* Table container */}
            <div className="rounded-2xl border border-gray-100 dark:border-gray-700
        bg-white dark:bg-gray-800 shadow-sm overflow-hidden">
                <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 dark:border-gray-700">
                    <h2 className="font-bold text-gray-900 dark:text-white">All Users</h2>
                    <div className="text-right">
                        <p className="text-sm text-gray-500 dark:text-gray-400">{filteredUsers.length} of {totalUsers} users</p>
                        <p className="text-xs text-gray-400 dark:text-gray-500">Page {currentPage} of {totalPages}</p>
                    </div>
                </div>

                {isLoading ? (
                    <div className="flex flex-col items-center justify-center py-16 gap-3 text-gray-400 dark:text-gray-500">
                        <div className="w-10 h-10 border-4 border-gray-200 dark:border-gray-600 border-t-blue-500 rounded-full animate-spin" />
                        <p className="text-sm">Loading users...</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full text-sm">
                            <thead>
                                <tr className="border-b border-gray-100 dark:border-gray-700 bg-gray-50/70 dark:bg-gray-700/30">
                                    {["User", "Department", "Role", "Status", "Created", "Actions"].map((h) => (
                                        <th key={h} className="px-5 py-3.5 text-center text-xs font-semibold uppercase tracking-wide text-gray-500 dark:text-gray-400">{h}</th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? filteredUsers.map((user) => {
                                    const roleData = getRoleData(user.role)
                                    const statusBadge = getStatusBadge(user.status)
                                    return (
                                        <tr key={user.id}
                                            className="border-b border-gray-50 dark:border-gray-700/50 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition">
                                            {/* User */}
                                            <td className="px-5 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="flex items-center justify-center w-9 h-9 rounded-full
                            bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-400 shrink-0">
                                                        <User size={16} />
                                                    </div>
                                                    <div className="min-w-0">
                                                        <p className="font-semibold text-gray-900 dark:text-white truncate max-w-[140px]">{user.name}</p>
                                                        <p className="text-xs text-gray-400 dark:text-gray-500 truncate max-w-[140px]">{user.email}</p>
                                                    </div>
                                                </div>
                                            </td>

                                            {/* Department */}
                                            <td className="px-5 py-4 text-center">
                                                <span className="text-sm font-medium text-gray-700 dark:text-gray-300">{user.department}</span>
                                            </td>

                                            {/* Role */}
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    className={`role-dropDown-trigger inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-80 ${roleData.badgeCls}`}
                                                    onClick={(e) => { e.stopPropagation(); handleRoleDropDownToggle(user.id, e) }}
                                                >
                                                    <roleData.icon size={13} />
                                                    {roleData.label}
                                                    <ChevronDown size={12} className={`transition-transform ${openRoleDropDown === user.id ? "rotate-180" : ""}`} />
                                                </button>
                                            </td>

                                            {/* Status */}
                                            <td className="px-5 py-4 text-center">
                                                <button
                                                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition hover:opacity-75 ${statusBadge.cls} ${user.status === "inactive" ? "cursor-not-allowed" : "cursor-pointer"}`}
                                                    onClick={(e) => { e.stopPropagation(); handleToggleStatus(user.id, user.status) }}
                                                >
                                                    {statusBadge.icon}
                                                    {statusBadge.label}
                                                </button>
                                            </td>

                                            {/* Created */}
                                            <td className="px-5 py-4 text-center text-xs text-gray-400 dark:text-gray-500 whitespace-nowrap">
                                                {new Date(user.created_at).toLocaleDateString()}
                                            </td>

                                            {/* Actions */}
                                            <td className="px-5 py-4 text-center">
                                                <div className="actions-menu flex justify-center">
                                                    <button
                                                        className="p-1.5 rounded-lg text-gray-400 hover:text-gray-600 dark:hover:text-gray-200
                              hover:bg-gray-100 dark:hover:bg-gray-700 transition"
                                                        onClick={(e) => { e.stopPropagation(); handleDropDownToggle(user.id, e) }}
                                                    >
                                                        <MoreHorizontal size={16} />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    )
                                }) : (
                                    <tr>
                                        <td colSpan={6} className="py-16 text-center">
                                            <div className="flex flex-col items-center gap-3 text-gray-400 dark:text-gray-500">
                                                <UsersIcon size={44} className="opacity-30" />
                                                <p className="font-semibold text-gray-600 dark:text-gray-300">No users found</p>
                                                <p className="text-xs">Try adjusting your search or filter criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && !isLoading && (
                            <div className="flex items-center justify-center gap-2 px-6 py-4 border-t border-gray-100 dark:border-gray-700">
                                <button onClick={() => handlePageChange(currentPage - 1)} disabled={currentPage === 1}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border
                    border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300
                    bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                    disabled:opacity-40 disabled:cursor-not-allowed transition">
                                    <ChevronLeft size={15} /> Previous
                                </button>

                                <div className="flex gap-1">
                                    {generatePageNumbers().map((page, i) => (
                                        <button key={i}
                                            className={`w-9 h-9 rounded-lg text-sm font-medium transition
                        ${page === currentPage ? "bg-blue-600 text-white shadow-sm" : page === "..." ? "cursor-default text-gray-400 dark:text-gray-500" : "bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-600"}`}
                                            onClick={() => typeof page === "number" && handlePageChange(page)}
                                            disabled={page === "..." || page === currentPage}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button onClick={() => handlePageChange(currentPage + 1)} disabled={currentPage === totalPages}
                                    className="flex items-center gap-1.5 px-3 py-2 text-sm rounded-lg border
                    border-gray-200 dark:border-gray-600 text-gray-600 dark:text-gray-300
                    bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600
                    disabled:opacity-40 disabled:cursor-not-allowed transition">
                                    Next <ChevronRight size={15} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Actions dropdown portal */}
            {openDropDown && (
                <div className="dropDown-portal fixed z-[9999]" style={{ top: dropDownPosition.top, left: dropDownPosition.left }}>
                    <div className="w-44 py-1 rounded-xl shadow-xl border
            bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700
            animate-in slide-in-from-top-2 zoom-in-95 duration-150">
                        <button className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
              hover:bg-gray-50 dark:hover:bg-gray-700 transition">
                            <Eye size={14} className="text-gray-400" /> View Details
                        </button>
                        <button
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-gray-700 dark:text-gray-200
                hover:bg-gray-50 dark:hover:bg-gray-700 transition"
                            onClick={() => { setSelectedUser(users.find((u) => u.id === openDropDown)); setShowEditModal(true); setOpenDropDown(null) }}>
                            <Edit size={14} className="text-blue-400" /> Edit User
                        </button>
                        <button
                            className="flex items-center gap-2.5 w-full px-4 py-2.5 text-sm text-red-600 dark:text-red-400
                hover:bg-red-50 dark:hover:bg-red-900/30 transition"
                            onClick={() => { setSelectedUser(users.find((u) => u.id === openDropDown)); setShowDeleteModal(true); setOpenDropDown(null) }}>
                            <Trash2 size={14} /> Delete User
                        </button>
                    </div>
                </div>
            )}

            {/* Role dropdown portal */}
            {openRoleDropDown && (
                <div className="role-dropDown-portal fixed z-[9999]" style={{ top: roleDropDownPosition.top, left: roleDropDownPosition.left }}>
                    <div className="w-64 py-1.5 rounded-xl shadow-xl border
            bg-white dark:bg-gray-800 border-gray-100 dark:border-gray-700
            animate-in slide-in-from-top-2 zoom-in-95 duration-150">
                        <p className="px-4 py-2 text-xs font-bold uppercase tracking-wider text-gray-400 dark:text-gray-500 border-b border-gray-100 dark:border-gray-700">
                            Change Role
                        </p>
                        {roleOptions.map((role) => {
                            const u = users.find((u) => u.id === openRoleDropDown)
                            const isCurrent = u?.role === role.value
                            const IconComp = role.icon
                            return (
                                <button key={role.value}
                                    className={`flex items-center gap-3 w-full px-4 py-3 text-sm transition
                    ${isCurrent ? role.badgeCls + " cursor-default" : "text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-700"}`}
                                    onClick={() => !isCurrent && handleRoleChange(openRoleDropDown, role.value)}
                                    disabled={isCurrent}>
                                    <IconComp size={15} />
                                    <div className="text-left flex-1">
                                        <p className="font-semibold leading-tight">{role.label}</p>
                                        <p className="text-xs opacity-70">{role.description}</p>
                                    </div>
                                    {isCurrent && <Check size={15} />}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}

            <UsersToast toasts={toasts} removeToast={removeToast} />
        </div>
    )
}

export default Users