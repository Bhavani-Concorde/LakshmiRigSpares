/**
 * User Bookings Page
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { bookingsAPI } from '../../services/api'
import { useAuth } from '../../context/AuthContext'
import { processPayment } from '../../services/razorpay'
import { FiCalendar, FiClock, FiMapPin, FiX, FiCreditCard } from 'react-icons/fi'
import toast from 'react-hot-toast'

const UserBookings = () => {
    const { user } = useAuth()
    const [bookings, setBookings] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchBookings() }, [])

    const fetchBookings = async () => {
        try {
            const { data } = await bookingsAPI.getUserBookings()
            setBookings(data.data.bookings || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleCancel = async (id) => {
        if (!window.confirm('Cancel this booking?')) return
        try {
            await bookingsAPI.cancel(id, 'User cancelled')
            toast.success('Booking cancelled')
            fetchBookings()
        } catch (error) {
            toast.error('Failed to cancel')
        }
    }

    const handlePayment = async (booking) => {
        await processPayment({
            amount: booking.finalPrice || booking.estimatedPrice,
            bookingId: booking._id,
            user: user,
            onSuccess: () => {
                fetchBookings()
            }
        })
    }

    const getStatusBadge = (status) => {
        const classes = { pending: 'badge-warning', confirmed: 'badge-info', 'in-progress': 'badge-primary', completed: 'badge-success', cancelled: 'badge-danger' }
        return <span className={`badge ${classes[status] || 'badge-primary'}`}>{status}</span>
    }

    return (
        <div className="bookings-page" style={{ padding: 'var(--spacing-xl) 0' }}>
            <div className="container">
                <h1 className="page-title">My Bookings</h1>
                {loading ? (
                    <div className="loading-placeholder">Loading...</div>
                ) : bookings.length === 0 ? (
                    <div className="empty-state card">
                        <FiCalendar style={{ fontSize: '3rem', opacity: 0.5 }} />
                        <p>No bookings yet</p>
                        <Link to="/services" className="btn btn-primary">Browse Services</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {bookings.map((booking) => (
                            <div key={booking._id} className="order-card card">
                                <div className="order-header">
                                    <div className="order-id">
                                        <strong>{booking.bookingId}</strong>
                                        <span>{booking.service?.name || 'Service'}</span>
                                    </div>
                                    {getStatusBadge(booking.status)}
                                </div>
                                <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '1rem', color: 'var(--dark-300)', fontSize: '0.9rem' }}>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiCalendar /> {new Date(booking.scheduledDate).toLocaleDateString()}</span>
                                    <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiClock /> {booking.scheduledTime}</span>
                                    {booking.location?.city && <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}><FiMapPin /> {booking.location.city}</span>}
                                </div>
                                <div className="order-footer">
                                    <div className="order-total">
                                        <span>Price:</span>
                                        <strong>₹{(booking.finalPrice || booking.estimatedPrice)?.toLocaleString()}</strong>
                                    </div>
                                    <div className="order-actions" style={{ display: 'flex', gap: '0.5rem' }}>
                                        {booking.status === 'pending' && booking.paymentStatus !== 'paid' && (booking.finalPrice || booking.estimatedPrice) > 0 && (
                                            <button className="btn btn-primary btn-sm" onClick={() => handlePayment(booking)}><FiCreditCard /> Pay Now</button>
                                        )}
                                        {booking.status === 'pending' && (
                                            <button className="btn btn-danger btn-sm" onClick={() => handleCancel(booking._id)}><FiX /> Cancel</button>
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

export default UserBookings
