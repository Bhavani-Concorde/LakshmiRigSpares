/**
 * Admin Orders Page
 */

import { useState, useEffect } from 'react'
import { ordersAPI } from '../../services/api'
import { FiSearch, FiEye } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './AdminPages.css'

const statuses = ['all', 'pending', 'processing', 'shipped', 'delivered', 'cancelled']

const AdminOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [search, setSearch] = useState('')

    useEffect(() => { fetchOrders() }, [filter, search])

    const fetchOrders = async () => {
        try {
            const params = { search }
            if (filter !== 'all') params.status = filter
            const { data } = await ordersAPI.getAll(params)
            setOrders(data.data.orders || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (orderId, status) => {
        try {
            await ordersAPI.updateStatus(orderId, { status })
            toast.success('Status updated')
            fetchOrders()
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    const getStatusBadge = (status) => {
        const classes = { pending: 'badge-warning', processing: 'badge-info', shipped: 'badge-primary', delivered: 'badge-success', cancelled: 'badge-danger' }
        return classes[status] || 'badge-primary'
    }

    return (
        <div className="admin-page">
            <div className="page-toolbar">
                <div className="search-box">
                    <FiSearch />
                    <input type="text" placeholder="Search orders..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            <div className="filter-tabs">
                {statuses.map(status => (
                    <button key={status} className={`filter-tab ${filter === status ? 'active' : ''}`} onClick={() => setFilter(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading-placeholder">Loading...</div> : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>Order ID</th><th>Customer</th><th>Date</th><th>Items</th><th>Total</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {orders.map(order => (
                                <tr key={order._id}>
                                    <td><strong>{order.orderId}</strong></td>
                                    <td>{order.user?.name || 'N/A'}<br /><span style={{ fontSize: '0.75rem', color: 'var(--dark-500)' }}>{order.user?.email}</span></td>
                                    <td>{new Date(order.createdAt).toLocaleDateString()}</td>
                                    <td>{order.items?.length || 0} items</td>
                                    <td>₹{order.total?.toLocaleString()}</td>
                                    <td>
                                        <select className="status-select" value={order.status} onChange={(e) => handleStatusChange(order._id, e.target.value)}>
                                            {statuses.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                    <td><button className="btn-icon"><FiEye /></button></td>
                                </tr>
                            ))}
                            {orders.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--dark-400)' }}>No orders found</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminOrders
