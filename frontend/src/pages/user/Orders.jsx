/**
 * User Orders Page
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { ordersAPI } from '../../services/api'
import { FiPackage, FiEye, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './Orders.css'

const UserOrders = () => {
    const [orders, setOrders] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => { fetchOrders() }, [filter])

    const fetchOrders = async () => {
        setLoading(true)
        try {
            const params = filter !== 'all' ? { status: filter } : {}
            const { data } = await ordersAPI.getUserOrders(params)
            setOrders(data.data.orders || data.data)
        } catch (error) {
            console.error('Error fetching orders:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (orderId) => {
        if (!window.confirm('Are you sure you want to cancel this order?')) return
        try {
            await ordersAPI.cancel(orderId, 'User requested cancellation')
            toast.success('Order cancelled')
            fetchOrders()
        } catch (error) {
            toast.error('Failed to cancel order')
        }
    }

    const getStatusBadge = (status) => {
        const statusClasses = {
            pending: 'badge-warning', processing: 'badge-info', shipped: 'badge-primary',
            delivered: 'badge-success', cancelled: 'badge-danger'
        }
        return <span className={`badge ${statusClasses[status] || 'badge-primary'}`}>{status}</span>
    }

    return (
        <div className="orders-page">
            <div className="container">
                <div className="page-header-row">
                    <h1 className="page-title">My Orders</h1>
                    <select value={filter} onChange={(e) => setFilter(e.target.value)} className="filter-select">
                        <option value="all">All Orders</option>
                        <option value="pending">Pending</option>
                        <option value="processing">Processing</option>
                        <option value="shipped">Shipped</option>
                        <option value="delivered">Delivered</option>
                        <option value="cancelled">Cancelled</option>
                    </select>
                </div>

                {loading ? (
                    <div className="loading-placeholder">Loading orders...</div>
                ) : orders.length === 0 ? (
                    <div className="empty-state card">
                        <FiPackage />
                        <p>No orders found</p>
                        <Link to="/products" className="btn btn-primary">Browse Products</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {orders.map((order) => (
                            <div key={order._id} className="order-card card">
                                <div className="order-header">
                                    <div className="order-id">
                                        <strong>{order.orderId}</strong>
                                        <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {getStatusBadge(order.status)}
                                </div>
                                <div className="order-items">
                                    {order.items?.slice(0, 3).map((item, idx) => (
                                        <div key={idx} className="order-item">
                                            <span className="item-name">{item.product?.name || item.name}</span>
                                            <span className="item-qty">x{item.quantity}</span>
                                            <span className="item-price">₹{item.price?.toLocaleString()}</span>
                                        </div>
                                    ))}
                                    {order.items?.length > 3 && <p className="more-items">+{order.items.length - 3} more items</p>}
                                </div>
                                <div className="order-footer">
                                    <div className="order-total">
                                        <span>Total:</span>
                                        <strong>₹{order.total?.toLocaleString()}</strong>
                                    </div>
                                    <div className="order-actions">
                                        <Link to={`/my-orders/${order._id}`} className="btn btn-ghost btn-sm"><FiEye /> View</Link>
                                        {order.status === 'pending' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(order._id)}><FiX /> Cancel</button>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserOrders
