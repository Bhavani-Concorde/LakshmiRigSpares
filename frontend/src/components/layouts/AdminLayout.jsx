/**
 * Admin Layout Component
 * Dashboard layout for admin pages
 */

import { useState } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import {
    FiHome, FiBox, FiTool, FiShoppingCart, FiCalendar,
    FiMessageSquare, FiUsers, FiTruck, FiMenu, FiX,
    FiLogOut, FiSettings, FiBell, FiChevronRight
} from 'react-icons/fi'
import './AdminLayout.css'

const menuItems = [
    { path: '/admin', icon: FiHome, label: 'Dashboard' },
    { path: '/admin/products', icon: FiBox, label: 'Products' },
    { path: '/admin/services', icon: FiTool, label: 'Services' },
    { path: '/admin/orders', icon: FiShoppingCart, label: 'Orders' },
    { path: '/admin/bookings', icon: FiCalendar, label: 'Bookings' },
    { path: '/admin/enquiries', icon: FiMessageSquare, label: 'Enquiries' },
    { path: '/admin/users', icon: FiUsers, label: 'Users' },
    { path: '/admin/suppliers', icon: FiTruck, label: 'Suppliers' },
]

const AdminLayout = () => {
    const [sidebarOpen, setSidebarOpen] = useState(true)
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const { admin, logout } = useAuth()
    const location = useLocation()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/admin/login')
    }

    const isActive = (path) => {
        if (path === '/admin') {
            return location.pathname === '/admin'
        }
        return location.pathname.startsWith(path)
    }

    return (
        <div className={`admin-layout ${sidebarOpen ? '' : 'sidebar-collapsed'}`}>
            {/* Sidebar */}
            <aside className={`admin-sidebar ${mobileMenuOpen ? 'mobile-open' : ''}`}>
                <div className="sidebar-header">
                    <Link to="/admin" className="sidebar-logo">
                        <span className="logo-icon">🏭</span>
                        {sidebarOpen && (
                            <span className="logo-text">Admin Panel</span>
                        )}
                    </Link>
                    <button className="sidebar-toggle hide-mobile" onClick={() => setSidebarOpen(!sidebarOpen)}>
                        <FiChevronRight />
                    </button>
                    <button className="mobile-close hide-desktop" onClick={() => setMobileMenuOpen(false)}>
                        <FiX />
                    </button>
                </div>

                <nav className="sidebar-nav">
                    {menuItems.map((item) => (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-item ${isActive(item.path) ? 'active' : ''}`}
                            onClick={() => setMobileMenuOpen(false)}
                        >
                            <item.icon className="nav-icon" />
                            {sidebarOpen && <span className="nav-label">{item.label}</span>}
                        </Link>
                    ))}
                </nav>

                <div className="sidebar-footer">
                    <Link to="/admin/settings" className="nav-item">
                        <FiSettings className="nav-icon" />
                        {sidebarOpen && <span className="nav-label">Settings</span>}
                    </Link>
                    <button className="nav-item logout-btn" onClick={handleLogout}>
                        <FiLogOut className="nav-icon" />
                        {sidebarOpen && <span className="nav-label">Logout</span>}
                    </button>
                </div>
            </aside>

            {/* Mobile Overlay */}
            {mobileMenuOpen && (
                <div className="mobile-overlay" onClick={() => setMobileMenuOpen(false)}></div>
            )}

            {/* Main Content */}
            <div className="admin-main">
                {/* Top Bar */}
                <header className="admin-topbar">
                    <div className="topbar-left">
                        <button className="mobile-menu-btn hide-desktop" onClick={() => setMobileMenuOpen(true)}>
                            <FiMenu />
                        </button>
                        <h1 className="page-title">
                            {menuItems.find(item => isActive(item.path))?.label || 'Dashboard'}
                        </h1>
                    </div>

                    <div className="topbar-right">
                        <button className="topbar-btn">
                            <FiBell />
                            <span className="notification-badge">3</span>
                        </button>
                        <div className="admin-profile">
                            <div className="profile-avatar">
                                {admin?.name?.charAt(0) || 'A'}
                            </div>
                            <div className="profile-info hide-mobile">
                                <span className="profile-name">{admin?.name}</span>
                                <span className="profile-role">{admin?.role}</span>
                            </div>
                        </div>
                    </div>
                </header>

                {/* Content Area */}
                <main className="admin-content">
                    <Outlet />
                </main>
            </div>
        </div>
    )
}

export default AdminLayout
