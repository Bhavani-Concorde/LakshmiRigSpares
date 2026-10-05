/**
 * Admin Dashboard Page
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { adminAPI } from '../../services/api'
import { FiShoppingCart, FiUsers, FiBox, FiCalendar, FiTrendingUp, FiArrowUp, FiArrowDown } from 'react-icons/fi'
import './AdminDashboard.css'

const AdminDashboard = () => {
    const [stats, setStats] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchDashboard() }, [])

    const fetchDashboard = async () => {
        try {
            const { data } = await adminAPI.getDashboard()
            setStats(data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) return <div className="loading-placeholder">Loading dashboard...</div>

    const statCards = [
        { label: 'Total Revenue', value: `₹${stats?.totalRevenue?.toLocaleString() || 0}`, icon: FiTrendingUp, color: 'primary', growth: stats?.revenueGrowth },
        { label: 'Total Orders', value: stats?.totalOrders || 0, icon: FiShoppingCart, color: 'secondary' },
        { label: 'Total Users', value: stats?.totalUsers || 0, icon: FiUsers, color: 'accent' },
        { label: 'Total Products', value: stats?.totalProducts || 0, icon: FiBox, color: 'warning' }
    ]

    const getStatusBadge = (status) => {
        const classes = { pending: 'badge-warning', processing: 'badge-info', shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger' }
        return <span className={`badge ${classes[status] || 'badge-primary'}`}>{status}</span>
    }

    return (
        <div className="admin-dashboard">
            {/* Stats Cards */}
            <div className="stats-row">
                {statCards.map((stat, idx) => (
                    <div key={idx} className={`stat-box stat-${stat.color}`}>
                        <div className="stat-icon-box"><stat.icon /></div>
                        <div className="stat-content">
                            <span className="stat-value">{stat.value}</span>
                            <span className="stat-label">{stat.label}</span>
                            {stat.growth !== undefined && (
                                <span className={`stat-growth ${stat.growth >= 0 ? 'positive' : 'negative'}`}>
                                    {stat.growth >= 0 ? <FiArrowUp /> : <FiArrowDown />} {Math.abs(stat.growth)}%
                                </span>
                            )}
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-grid">
                {/* Recent Orders */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Recent Orders</h3>
                        <Link to="/admin/orders" className="view-link">View All</Link>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr><th>Order ID</th><th>Customer</th><th>Amount</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {stats?.recentOrders?.slice(0, 5).map(order => (
                                    <tr key={order._id}>
                                        <td>{order.orderId}</td>
                                        <td>{order.user?.name || 'N/A'}</td>
                                        <td>₹{order.total?.toLocaleString()}</td>
                                        <td>{getStatusBadge(order.status)}</td>
                                    </tr>
                                ))}
                                {(!stats?.recentOrders || stats.recentOrders.length === 0) && (
                                    <tr><td colSpan="4" style={{ textAlign: 'center', color: 'var(--dark-400)' }}>No recent orders</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Recent Enquiries */}
                <div className="dashboard-card">
                    <div className="card-header">
                        <h3>Recent Enquiries</h3>
                        <Link to="/admin/enquiries" className="view-link">View All</Link>
                    </div>
                    <div className="enquiry-list">
                        {stats?.recentEnquiries?.slice(0, 5).map(enq => (
                            <div key={enq._id} className="enquiry-item">
                                <div className="enquiry-info">
                                    <strong>{enq.subject}</strong>
                                    <span>{enq.guestInfo?.name || enq.user?.name || 'Guest'}</span>
                                </div>
                                <span className={`badge badge-${enq.status === 'new' ? 'info' : 'primary'}`}>{enq.status}</span>
                            </div>
                        ))}
                        {(!stats?.recentEnquiries || stats.recentEnquiries.length === 0) && (
                            <p style={{ textAlign: 'center', color: 'var(--dark-400)', padding: '1rem' }}>No recent enquiries</p>
                        )}
                    </div>
                </div>

                {/* Recent Bookings */}
                <div className="dashboard-card full-width">
                    <div className="card-header">
                        <h3>Recent Bookings</h3>
                        <Link to="/admin/bookings" className="view-link">View All</Link>
                    </div>
                    <div className="table-container">
                        <table className="table">
                            <thead>
                                <tr><th>Booking ID</th><th>Service</th><th>Customer</th><th>Date</th><th>Status</th></tr>
                            </thead>
                            <tbody>
                                {stats?.recentBookings?.slice(0, 5).map(booking => (
                                    <tr key={booking._id}>
                                        <td>{booking.bookingId}</td>
                                        <td>{booking.service?.name || 'N/A'}</td>
                                        <td>{booking.user?.name || 'N/A'}</td>
                                        <td>{new Date(booking.scheduledDate).toLocaleDateString()}</td>
                                        <td><span className={`badge badge-${booking.status === 'pending' ? 'warning' : 'primary'}`}>{booking.status}</span></td>
                                    </tr>
                                ))}
                                {(!stats?.recentBookings || stats.recentBookings.length === 0) && (
                                    <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--dark-400)' }}>No recent bookings</td></tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default AdminDashboard
