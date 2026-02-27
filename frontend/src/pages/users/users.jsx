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

function Users() {
    useSocketConnection()

    // Pagination state
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

    // Role options with metadata
    const roleOptions = [
        {
            value: "admin",
            label: "Admin",
            icon: Shield,
            description: "Full system access",
            color: "#92400e",
            bgColor: "#fef3c7",
        },
        {
            value: "librarian",
            label: "Librarian",
            icon: User,
            description: "Manage books and users",
            color: "#1e40af",
            bgColor: "#dbeafe",
        },
        {
            value: "student",
            label: "Student",
            icon: GraduationCap,
            description: "Borrow and return books",
            color: "#065f46",
            bgColor: "#d1fae5",
        },
    ]

    // Fetch users with pagination
    const fetchUsers = async (page = 1, searchTerm = "") => {
        setIsLoading(true)
        try {
            const res = await viewUsers(page, 10, searchTerm)
            if (res.success) {
                setUsers(res.users || [])
                setTotalUsers(res.total || 0)
                setTotalPages(Math.ceil((res.total || 0) / 10))
                setCurrentPage(page)
            } else {
                usersToast.error("Error", "Failed to fetch users")
            }
        } catch (error) {
            console.error("Error fetching users:", error)
            usersToast.error("Error", "An error occurred while fetching users")
        }
        setIsLoading(false)
    }

    useEffect(() => {
        fetchUsers(currentPage, searchTerm)
    }, [searchTerm, currentPage])

    const handleAddSuccess = (newUser) => {
        // Refresh current page to show new user
        fetchUsers(currentPage)
        usersToast.success("User Added", `${newUser.name} has been added successfully`)
    }

    const handleEditSuccess = (updatedUser) => {
        setUsers((prev) => prev.map((user) => (user.id === updatedUser.id ? updatedUser : user)))
        setSelectedUser(null)
    }

    const handleDeleteSuccess = (deletedUserId) => {
        // Remove user from current page and update total count
        setUsers((prev) => {
            const filteredUsers = prev.filter((user) => user.id !== deletedUserId)

            // If current page becomes empty and we're not on page 1, go to previous page
            if (filteredUsers.length === 0 && currentPage > 1) {
                fetchUsers(currentPage - 1)
            } else if (filteredUsers.length < prev.length) {
                // Update total count
                setTotalUsers((prevTotal) => prevTotal - 1)
                // Recalculate total pages
                setTotalPages(Math.ceil((totalUsers - 1) / 10))
            }

            return filteredUsers
        })
        setSelectedUser(null)
    }

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            const res = await toggleStatus(userId, currentStatus)
            if (res.success) {
                setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, status: res.newStatus } : user)))
                usersToast.success("Status Updated", `User status changed to ${res.newStatus}`)
            } else {
                usersToast.error("Update Failed", "Failed to update user status")
            }
        } catch (error) {
            console.error("Error toggling status:", error)
            usersToast.error("Error", "An error occurred while updating status")
        }
    }

    // Handler for changing user role
    const handleRoleChange = async (userId, newRole) => {
        try {
            // Find the user to update
            const userToUpdate = users.find((u) => u.id === userId)
            if (!userToUpdate) return

            // Prepare data for backend
            const updatedUser = { ...userToUpdate, role: newRole }
            // You may need to send all required fields for editUser
            const res = await import("../../api/users").then((api) => api.editUser(updatedUser))
            if (res.success) {
                setUsers((prev) => prev.map((user) => (user.id === userId ? { ...user, role: newRole } : user)))
                const roleLabel = roleOptions.find((r) => r.value === newRole)?.label || newRole
                usersToast.success("Role Updated", `User role changed to ${roleLabel}`)
                setOpenRoleDropDown(null)
            } else {
                usersToast.error("Update Failed", "Failed to update user role")
            }
        } catch (error) {
            console.error("Error updating role:", error)
            usersToast.error("Error", "An error occurred while updating role")
        }
    }

    // Improved position calculation function
    const calculateDropDownPosition = (buttonElement, dropDownWidth = 160, dropDownHeight = 150) => {
        const buttonRect = buttonElement.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight

        let top = buttonRect.bottom + 4
        let left = buttonRect.right - dropDownWidth

        // Adjust if dropdown would go off the right edge
        if (left < 8) {
            left = buttonRect.left
        }

        // Adjust if dropdown would go off the left edge
        if (left + dropDownWidth > viewportWidth - 8) {
            left = viewportWidth - dropDownWidth - 8
        }

        // Adjust if dropdown would go off the bottom edge
        if (top + dropDownHeight > viewportHeight - 8) {
            top = buttonRect.top - dropDownHeight - 4
        }

        // Ensure dropdown doesn't go above viewport
        if (top < 8) {
            top = buttonRect.bottom + 4
        }

        return { top, left }
    }

    const calculateRoleDropDownPosition = (buttonElement) => {
        const buttonRect = buttonElement.getBoundingClientRect()
        const viewportWidth = window.innerWidth
        const viewportHeight = window.innerHeight
        const dropDownWidth = 280
        const dropDownHeight = 200

        let top = buttonRect.bottom + 4
        let left = buttonRect.left

        // Adjust if dropdown would go off the right edge
        if (left + dropDownWidth > viewportWidth - 8) {
            left = buttonRect.right - dropDownWidth
        }

        // Adjust if dropdown would go off the left edge
        if (left < 8) {
            left = 8
        }

        // Adjust if dropdown would go off the bottom edge
        if (top + dropDownHeight > viewportHeight - 8) {
            top = buttonRect.top - dropDownHeight - 4
        }

        // Ensure dropdown doesn't go above viewport
        if (top < 8) {
            top = buttonRect.bottom + 4
        }

        return { top, left }
    }

    const handleDropDownToggle = (userId, event) => {
        if (openDropDown === userId) {
            setOpenDropDown(null)
            return
        }

        const position = calculateDropDownPosition(event.currentTarget)
        setDropDownPosition(position)
        setOpenDropDown(userId)
    }

    const handleRoleDropDownToggle = (userId, event) => {
        if (openRoleDropDown === userId) {
            setOpenRoleDropDown(null)
            return
        }

        const position = calculateRoleDropDownPosition(event.currentTarget)
        setRoleDropDownPosition(position)
        setOpenRoleDropDown(userId)
    }

    const handleEditUser = (user) => {
        setSelectedUser(user)
        setShowEditModal(true)
        setOpenDropDown(null)
    }

    const handleDeleteUser = (user) => {
        setSelectedUser(user)
        setShowDeleteModal(true)
        setOpenDropDown(null)
    }

    const handleClickOutside = (event) => {
        // Check if click is outside dropDown
        if (
            !event.target.closest(".actions-menu") &&
            !event.target.closest(".dropDown-portal") &&
            !event.target.closest(".role-dropDown-trigger") &&
            !event.target.closest(".role-dropDown-portal")
        ) {
            setOpenDropDown(null)
            setOpenRoleDropDown(null)
        }
    }

    // Close dropdowns on scroll and resize
    useEffect(() => {
        const handleScrollOrResize = () => {
            if (openDropDown || openRoleDropDown) {
                setOpenDropDown(null)
                setOpenRoleDropDown(null)
            }
        }

        window.addEventListener("scroll", handleScrollOrResize, true)
        window.addEventListener("resize", handleScrollOrResize)

        return () => {
            window.removeEventListener("scroll", handleScrollOrResize, true)
            window.removeEventListener("resize", handleScrollOrResize)
        }
    }, [openDropDown, openRoleDropDown])

    // Pagination handlers
    const handlePageChange = (page) => {
        if (page >= 1 && page <= totalPages && page !== currentPage) {
            fetchUsers(page)
        }
    }

    const handlePreviousPage = () => {
        if (currentPage > 1) {
            handlePageChange(currentPage - 1)
        }
    }

    const handleNextPage = () => {
        if (currentPage < totalPages) {
            handlePageChange(currentPage + 1)
        }
    }

    // Generate page numbers for pagination
    const generatePageNumbers = () => {
        const pages = []
        const maxVisiblePages = 5

        if (totalPages <= maxVisiblePages) {
            for (let i = 1; i <= totalPages; i++) {
                pages.push(i)
            }
        } else {
            if (currentPage <= 3) {
                for (let i = 1; i <= 4; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            } else if (currentPage >= totalPages - 2) {
                pages.push(1)
                pages.push("...")
                for (let i = totalPages - 3; i <= totalPages; i++) {
                    pages.push(i)
                }
            } else {
                pages.push(1)
                pages.push("...")
                for (let i = currentPage - 1; i <= currentPage + 1; i++) {
                    pages.push(i)
                }
                pages.push("...")
                pages.push(totalPages)
            }
        }

        return pages
    }

    // Filter users based on search and filters (client-side for current page)
    const filteredUsers = users.filter((user) => {
        const matchesSearch =
            searchTerm === "" ||
            user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
            user.department.toLowerCase().includes(searchTerm.toLowerCase())

        const matchesRole = !filterRole || user.role === filterRole
        const matchesStatus = !filterStatus || user.status === filterStatus

        return matchesSearch && matchesRole && matchesStatus
    })

    // eslint-disable-next-line no-unused-vars
    const getRoleIcon = (role) => {
        const roleOption = roleOptions.find((r) => r.value === role)
        if (roleOption) {
            const IconComponent = roleOption.icon
            return <IconComponent size={16} />
        }
        return <User size={16} />
    }

    const getRoleData = (role) => {
        return roleOptions.find((r) => r.value === role) || roleOptions[2] // Default to student
    }

    const getStatusIcon = (status) => {
        switch (status) {
            case "active":
                return <UserCheck size={16} />
            case "inactive":
                return <UserX size={16} />
            case "suspended":
                return <UserMinus size={16} />
            default:
                return <User size={16} />
        }
    }

    return (
        <div className="users-page" onClick={handleClickOutside}>
            {/* Page Header */}
            <div className="page-header">
                <div className="header-title">
                    <UsersIcon size={28} className="title-icon" />
                    <div>
                        <h1>Users Management</h1>
                        <p>Manage library users and permissions</p>
                    </div>
                </div>
                <button className="add-user-btn" onClick={() => setShowAddModal(true)}>
                    <Plus size={20} />
                    Add New User
                </button>
            </div>

            {/* Add User Modal */}
            <AddUserModal
                isOpen={showAddModal}
                onClose={() => setShowAddModal(false)}
                onSuccess={handleAddSuccess}
                usersToast={usersToast}
            />

            {/* Edit User Modal */}
            <EditUserModal
                isOpen={showEditModal}
                onClose={() => setShowEditModal(false)}
                user={selectedUser}
                onSuccess={handleEditSuccess}
                usersToast={usersToast}
            />

            {/* Delete User Modal */}
            <DeleteUserModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                user={selectedUser}
                onSuccess={handleDeleteSuccess}
                usersToast={usersToast}
            />

            {/* Search and Filters */}
            <div className="search-section">
                <div className="search-bar">
                    <Search size={20} />
                    <input
                        type="text"
                        placeholder="Search users by name, email, or department..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="filters">
                    <div className="filter-dropDown">
                        <Filter size={16} />
                        <select value={filterRole} onChange={(e) => setFilterRole(e.target.value)}>
                            <option value="">All Roles</option>
                            <option value="admin">Admin</option>
                            <option value="librarian">Librarian</option>
                            <option value="student">Student</option>
                        </select>
                    </div>
                    <div className="filter-dropDown">
                        <Filter size={16} />
                        <select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
                            <option value="">All Status</option>
                            <option value="active">Active</option>
                            <option value="inactive">Inactive</option>
                            <option value="suspended">Suspended</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Users Table */}
            <div className="users-table-container">
                <div className="table-header">
                    <h2>All Users</h2>
                    <div className="collection-info">
                        <span className="user-count">
                            {filteredUsers.length} of {totalUsers} users
                        </span>
                        <span className="page-info">
                            Page {currentPage} of {totalPages}
                        </span>
                    </div>
                </div>

                {isLoading ? (
                    <div className="loading-state">
                        <div className="loading-spinner"></div>
                        <p>Loading users...</p>
                    </div>
                ) : (
                    <div className="table-wrapper">
                        <table className="users-table">
                            <thead>
                                <tr>
                                    <th>User</th>
                                    <th>Department</th>
                                    <th>Role</th>
                                    <th>Status</th>
                                    <th>Created</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.length > 0 ? (
                                    filteredUsers.map((user) => {
                                        const roleData = getRoleData(user.role)
                                        return (
                                            <tr key={user.id} className="user-row">
                                                <td className="user-info">
                                                    <div className="user-avatar">
                                                        <User size={20} />
                                                    </div>
                                                    <div className="user-details">
                                                        <span className="user-name">{user.name}</span>
                                                        <span className="user-email">{user.email}</span>
                                                    </div>
                                                </td>
                                                <td className="department">{user.department}</td>
                                                <td className="role">
                                                    <div className="role-dropDown-container">
                                                        <button
                                                            className={`role-dropDown-trigger ${user.role}`}
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleRoleDropDownToggle(user.id, e)
                                                            }}
                                                            style={{
                                                                backgroundColor: roleData.bgColor,
                                                                color: roleData.color,
                                                            }}
                                                        >
                                                            <roleData.icon size={16} />
                                                            <span>{roleData.label}</span>
                                                            <ChevronDown
                                                                size={14}
                                                                className={`chevron ${openRoleDropDown === user.id ? "open" : ""}`}
                                                            />
                                                        </button>
                                                    </div>
                                                </td>
                                                <td className="status">
                                                    <div
                                                        className={`status-badge ${user.status}`}
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            handleToggleStatus(user.id, user.status)
                                                        }}
                                                    >
                                                        {getStatusIcon(user.status)}
                                                        <span>{user.status.charAt(0).toUpperCase() + user.status.slice(1)}</span>
                                                    </div>
                                                </td>
                                                <td className="created-date">{new Date(user.created_at).toLocaleDateString()}</td>
                                                <td className="actions">
                                                    <div className="actions-menu">
                                                        <button
                                                            className="actions-trigger"
                                                            onClick={(e) => {
                                                                e.stopPropagation()
                                                                handleDropDownToggle(user.id, e)
                                                            }}
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
                                        <td colSpan="6" className="empty-state">
                                            <div className="empty-content">
                                                <UsersIcon size={48} />
                                                <h3>No users found</h3>
                                                <p>Try adjusting your search or filter criteria</p>
                                            </div>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>

                        {/* Pagination */}
                        {totalPages > 1 && !isLoading && (
                            <div className="pagination">
                                <button className="pagination-btn" onClick={handlePreviousPage} disabled={currentPage === 1}>
                                    <ChevronLeft size={16} />
                                    Previous
                                </button>

                                <div className="pagination-numbers">
                                    {generatePageNumbers().map((page, index) => (
                                        <button
                                            key={index}
                                            className={`pagination-number ${page === currentPage ? "active" : ""} ${page === "..." ? "dots" : ""}`}
                                            onClick={() => typeof page === "number" && handlePageChange(page)}
                                            disabled={page === "..." || page === currentPage}
                                        >
                                            {page}
                                        </button>
                                    ))}
                                </div>

                                <button className="pagination-btn" onClick={handleNextPage} disabled={currentPage === totalPages}>
                                    Next
                                    <ChevronRight size={16} />
                                </button>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Portal for actions dropDown menu - positioned relative to viewport */}
            {openDropDown && (
                <div
                    className="dropDown-portal"
                    style={{
                        position: "fixed",
                        top: dropDownPosition.top,
                        left: dropDownPosition.left,
                        zIndex: 9999,
                    }}
                >
                    <div className="dropDown-menu">
                        <button className="dropDown-item">
                            <Eye size={14} />
                            View Details
                        </button>
                        <button className="dropDown-item" onClick={() => handleEditUser(users.find((u) => u.id === openDropDown))}>
                            <Edit size={14} />
                            Edit User
                        </button>
                        <button
                            className="dropDown-item delete"
                            onClick={() => handleDeleteUser(users.find((u) => u.id === openDropDown))}
                        >
                            <Trash2 size={14} />
                            Delete User
                        </button>
                    </div>
                </div>
            )}

            {/* Portal for role dropDown menu - positioned relative to viewport */}
            {openRoleDropDown && (
                <div
                    className="role-dropDown-portal"
                    style={{
                        position: "fixed",
                        top: roleDropDownPosition.top,
                        left: roleDropDownPosition.left,
                        zIndex: 9999,
                    }}
                >
                    <div className="role-dropDown-menu">
                        <div className="role-dropDown-header">
                            <span>Change Role</span>
                        </div>
                        {roleOptions.map((role) => {
                            const user = users.find((u) => u.id === openRoleDropDown)
                            const isCurrentRole = user?.role === role.value
                            const IconComponent = role.icon

                            return (
                                <button
                                    key={role.value}
                                    className={`role-dropDown-item ${isCurrentRole ? "current" : ""}`}
                                    onClick={() => !isCurrentRole && handleRoleChange(openRoleDropDown, role.value)}
                                    disabled={isCurrentRole}
                                    style={{
                                        backgroundColor: isCurrentRole ? role.bgColor : "transparent",
                                        color: isCurrentRole ? role.color : "#374151",
                                    }}
                                >
                                    <div className="role-item-content">
                                        <div className="role-item-main">
                                            <IconComponent size={16} />
                                            <div className="role-item-text">
                                                <span className="role-item-label">{role.label}</span>
                                                <span className="role-item-description">{role.description}</span>
                                            </div>
                                        </div>
                                        {isCurrentRole && <Check size={16} className="role-check" />}
                                    </div>
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
