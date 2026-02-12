/**
 * User Dashboard Page
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { ordersAPI, bookingsAPI, enquiriesAPI } from '../../services/api'
import { FiShoppingBag, FiCalendar, FiMessageSquare, FiClock, FiArrowRight, FiPackage, FiUser } from 'react-icons/fi'
import './Dashboard.css'

const UserDashboard = () => {
    const { user } = useAuth()
    const [stats, setStats] = useState({ orders: 0, bookings: 0, enquiries: 0 })
    const [recentOrders, setRecentOrders] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        fetchDashboardData()
    }, [])

    const fetchDashboardData = async () => {
        try {
            const [ordersRes, bookingsRes, enquiriesRes] = await Promise.all([
                ordersAPI.getUserOrders({ limit: 5 }),
                bookingsAPI.getUserBookings({ limit: 3 }),
                enquiriesAPI.getUserEnquiries({ limit: 3 })
            ])
            setStats({
                orders: ordersRes.data.data.pagination?.total || ordersRes.data.data.length || 0,
                bookings: bookingsRes.data.data.pagination?.total || bookingsRes.data.data.length || 0,
                enquiries: enquiriesRes.data.data.pagination?.total || enquiriesRes.data.data.length || 0
            })
            setRecentOrders(ordersRes.data.data.orders || ordersRes.data.data.slice(0, 5))
        } catch (error) {
            console.error('Error fetching dashboard data:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'badge-warning',
            processing: 'badge-info',
            shipped: 'badge-primary',
            delivered: 'badge-success',
            cancelled: 'badge-danger'
        }
        return <span className={`badge ${statusClasses[status] || 'badge-primary'}`}>{status}</span>
    }

    return (
        <div className="user-dashboard">
            <div className="container">
                {/* Welcome Banner */}
                <div className="welcome-banner">
                    <div className="welcome-content">
                        <h1>Welcome back, {user?.name?.split(' ')[0]}! 👋</h1>
                        <p>Manage your orders, bookings, and enquiries from your personal dashboard.</p>
                    </div>
                    <div className="welcome-actions">
                        <Link to="/products" className="btn btn-primary">Browse Products</Link>
                        <Link to="/services" className="btn btn-outline">View Services</Link>
                    </div>
                </div>

                {/* Stats Cards */}
                <div className="stats-grid">
                    <div className="stat-card">
                        <div className="stat-icon"><FiShoppingBag /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.orders}</span>
                            <span className="stat-label">Total Orders</span>
                        </div>
                        <Link to="/my-orders" className="stat-link"><FiArrowRight /></Link>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon secondary"><FiCalendar /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.bookings}</span>
                            <span className="stat-label">Service Bookings</span>
                        </div>
                        <Link to="/my-bookings" className="stat-link"><FiArrowRight /></Link>
                    </div>
                    <div className="stat-card">
                        <div className="stat-icon accent"><FiMessageSquare /></div>
                        <div className="stat-info">
                            <span className="stat-value">{stats.enquiries}</span>
                            <span className="stat-label">Enquiries</span>
                        </div>
                        <Link to="/my-enquiries" className="stat-link"><FiArrowRight /></Link>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="quick-actions">
                    <h2>Quick Actions</h2>
                    <div className="actions-grid">
                        <Link to="/enquiry/new" className="action-card">
                            <FiMessageSquare />
                            <span>New Enquiry</span>
                        </Link>
                        <Link to="/services" className="action-card">
                            <FiCalendar />
                            <span>Book Service</span>
                        </Link>
                        <Link to="/profile" className="action-card">
                            <FiUser />
                            <span>Edit Profile</span>
                        </Link>
                    </div>
                </div>

                {/* Recent Orders */}
                <div className="recent-section">
                    <div className="section-header">
                        <h2>Recent Orders</h2>
                        <Link to="/my-orders" className="view-all">View All <FiArrowRight /></Link>
                    </div>
                    {loading ? (
                        <div className="loading-placeholder">Loading...</div>
                    ) : recentOrders.length === 0 ? (
                        <div className="empty-state">
                            <FiPackage />
                            <p>No orders yet</p>
                            <Link to="/products" className="btn btn-primary">Start Shopping</Link>
                        </div>
                    ) : (
                        <div className="table-container">
                            <table className="table">
                                <thead>
                                    <tr>
                                        <th>Order ID</th>
                                        <th>Date</th>
                                        <th>Items</th>
                                        <th>Total</th>
                                        <th>Status</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {recentOrders.map(order => (
                                        <tr key={order._id}>
                                            <td><Link to={`/my-orders/${order._id}`}>{order.orderId}</Link></td>
                                            <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                            <td>{order.items?.length || 0} items</td>
                                            <td>₹{order.total?.toLocaleString()}</td>
                                            <td>{getStatusBadge(order.status)}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default UserDashboard
