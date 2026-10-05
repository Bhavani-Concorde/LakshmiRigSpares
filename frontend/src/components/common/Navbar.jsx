/**
 * Navbar Component
 * Main navigation header
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'
import { FiMenu, FiX, FiUser, FiLogOut, FiShoppingBag, FiGrid, FiSettings, FiShoppingCart } from 'react-icons/fi'
import './Navbar.css'

const Navbar = () => {
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const [isProfileOpen, setIsProfileOpen] = useState(false)
    const { isAuthenticated, isAdmin, user, admin, logout } = useAuth()
    const { getCartCount } = useCart()
    const navigate = useNavigate()

    const handleLogout = () => {
        logout()
        navigate('/')
    }

    const currentUser = isAdmin ? admin : user

    return (
        <nav className="navbar">
            <div className="navbar-container">
                {/* Logo */}
                <Link to="/" className="navbar-logo">
                    <span className="logo-icon">🏭</span>
                    <span className="logo-text">
                        <span className="logo-primary">Sri Lakshmi</span>
                        <span className="logo-secondary">Rig Spares</span>
                    </span>
                </Link>

                {/* Desktop Navigation */}
                <div className="navbar-nav hide-mobile">
                    <Link to="/" className="nav-link">Home</Link>
                    <Link to="/products" className="nav-link">Products</Link>
                    <Link to="/services" className="nav-link">Services</Link>
                    <Link to="/about" className="nav-link">About</Link>
                    <Link to="/contact" className="nav-link">Contact</Link>
                </div>

                {/* Actions */}
                <div className="navbar-actions">
                    <Link to="/cart" className="cart-trigger">
                        <FiShoppingCart />
                        {getCartCount() > 0 && <span className="cart-badge">{getCartCount()}</span>}
                    </Link>
                    {isAuthenticated ? (
                        <div className="profile-dropdown">
                            <button
                                className="profile-trigger"
                                onClick={() => setIsProfileOpen(!isProfileOpen)}
                            >
                                <div className="profile-avatar">
                                    {currentUser?.avatar ? (
                                        <img src={currentUser.avatar} alt={currentUser.name} />
                                    ) : (
                                        <FiUser />
                                    )}
                                </div>
                                <span className="profile-name hide-mobile">{currentUser?.name?.split(' ')[0]}</span>
                            </button>

                            {isProfileOpen && (
                                <div className="dropdown-menu">
                                    <div className="dropdown-header">
                                        <p className="dropdown-user-name">{currentUser?.name}</p>
                                        <p className="dropdown-user-email">{currentUser?.email}</p>
                                    </div>
                                    <div className="dropdown-divider"></div>
                                    <Link to={isAdmin ? '/admin' : '/dashboard'} className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <FiGrid /> Dashboard
                                    </Link>
                                    {!isAdmin && (
                                        <Link to="/my-orders" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                            <FiShoppingBag /> My Orders
                                        </Link>
                                    )}
                                    <Link to="/profile" className="dropdown-item" onClick={() => setIsProfileOpen(false)}>
                                        <FiSettings /> Profile
                                    </Link>
                                    <div className="dropdown-divider"></div>
                                    <button className="dropdown-item dropdown-logout" onClick={handleLogout}>
                                        <FiLogOut /> Logout
                                    </button>
                                </div>
                            )}
                        </div>
                    ) : (
                        <div className="auth-buttons">
                            <Link to="/login" className="btn btn-ghost">Login</Link>
                            <Link to="/register" className="btn btn-primary hide-mobile">Register</Link>
                        </div>
                    )}

                    {/* Mobile Menu Toggle */}
                    <button className="menu-toggle hide-desktop" onClick={() => setIsMenuOpen(!isMenuOpen)}>
                        {isMenuOpen ? <FiX /> : <FiMenu />}
                    </button>
                </div>
            </div>

            {/* Mobile Menu */}
            {isMenuOpen && (
                <div className="mobile-menu">
                    <Link to="/" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Home</Link>
                    <Link to="/products" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Products</Link>
                    <Link to="/services" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Services</Link>
                    <Link to="/about" className="mobile-link" onClick={() => setIsMenuOpen(false)}>About</Link>
                    <Link to="/contact" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Contact</Link>
                    {!isAuthenticated && (
                        <>
                            <div className="mobile-divider"></div>
                            <Link to="/login" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/register" className="mobile-link" onClick={() => setIsMenuOpen(false)}>Register</Link>
                        </>
                    )}
                </div>
            )}
        </nav>
    )
}

export default Navbar
