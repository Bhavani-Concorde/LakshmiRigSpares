/**
 * Admin Bookings Page
 */

import { useState, useEffect } from 'react'
import { bookingsAPI } from '../../services/api'
import { FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './AdminPages.css'

const statuses = ['all', 'pending', 'confirmed', 'in-progress', 'completed', 'cancelled']

const AdminBookings = () => {
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')

    useEffect(() => { fetchBookings() }, [filter])

    const fetchBookings = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {}
            const { data } = await bookingsAPI.getAll(params)
            setBookings(data.data.bookings || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleStatusChange = async (id, status) => {
        try {
            await bookingsAPI.updateStatus(id, { status })
            toast.success('Status updated')
            fetchBookings()
        } catch (error) {
            toast.error('Failed to update')
        }
    }

    return (
        <div className="admin-page">
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
                            <tr><th>Booking ID</th><th>Service</th><th>Customer</th><th>Date</th><th>Time</th><th>Price</th><th>Status</th></tr>
                        </thead>
                        <tbody>
                            {bookings.map(booking => (
                                <tr key={booking._id}>
                                    <td><strong>{booking.bookingId}</strong></td>
                                    <td>{booking.service?.name || 'N/A'}</td>
                                    <td>{booking.user?.name || 'N/A'}</td>
                                    <td>{new Date(booking.scheduledDate).toLocaleDateString()}</td>
                                    <td>{booking.scheduledTime}</td>
                                    <td>₹{(booking.finalPrice || booking.estimatedPrice)?.toLocaleString()}</td>
                                    <td>
                                        <select className="status-select" value={booking.status} onChange={(e) => handleStatusChange(booking._id, e.target.value)}>
                                            {statuses.filter(s => s !== 'all').map(s => <option key={s} value={s}>{s}</option>)}
                                        </select>
                                    </td>
                                </tr>
                            ))}
                            {bookings.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--dark-400)' }}>No bookings found</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminBookings
