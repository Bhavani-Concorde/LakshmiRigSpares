/**
 * Book Service Page
 */

import { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { servicesAPI, bookingsAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiCalendar, FiClock, FiMapPin, FiUser, FiPhone } from 'react-icons/fi'

const BookService = () => {
    const { serviceId } = useParams()
    const navigate = useNavigate()
    const [service, setService] = useState(null)
    const [loading, setLoading] = useState(true)
    const [submitting, setSubmitting] = useState(false)
    const [formData, setFormData] = useState({
        scheduledDate: '',
        scheduledTime: '',
        location: { address: '', city: '', state: '', pincode: '' },
        contactPerson: { name: '', phone: '' },
        notes: ''
    })

    useEffect(() => { fetchService() }, [serviceId])

    const fetchService = async () => {
        try {
            const { data } = await servicesAPI.getOne(serviceId)
            setService(data.data)
        } catch (error) {
            toast.error('Service not found')
        } finally {
            setLoading(false)
        }
    }

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('location.')) {
            setFormData({ ...formData, location: { ...formData.location, [name.split('.')[1]]: value } })
        } else if (name.startsWith('contact.')) {
            setFormData({ ...formData, contactPerson: { ...formData.contactPerson, [name.split('.')[1]]: value } })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.scheduledDate || !formData.scheduledTime) {
            toast.error('Please select date and time')
            return
        }
        setSubmitting(true)
        try {
            await bookingsAPI.create({ service: serviceId, ...formData })
            toast.success('Booking created successfully!')
            navigate('/my-bookings')
        } catch (error) {
            toast.error('Failed to create booking')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) return <div className="container" style={{ padding: '2rem' }}><p>Loading...</p></div>
    if (!service) return <div className="container" style={{ padding: '2rem' }}><p>Service not found</p></div>

    return (
        <div style={{ padding: 'var(--spacing-xl) 0' }}>
            <div className="container" style={{ maxWidth: '700px' }}>
                <h1 className="page-title">Book Service</h1>
                <div className="card" style={{ marginBottom: '1.5rem', padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '0.5rem' }}>{service.name}</h3>
                    <p style={{ color: 'var(--dark-400)', marginBottom: '0.5rem' }}>{service.category}</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--primary-400)' }}>
                        ₹{service.pricing?.basePrice?.toLocaleString()}
                        <span style={{ fontSize: '0.9rem', fontWeight: 400, color: 'var(--dark-400)' }}> / {service.pricing?.type}</span>
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="card" style={{ padding: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1.5rem' }}>Booking Details</h3>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div className="form-group">
                            <label className="form-label"><FiCalendar /> Preferred Date *</label>
                            <input type="date" name="scheduledDate" value={formData.scheduledDate} onChange={handleChange} className="form-input" min={new Date().toISOString().split('T')[0]} />
                        </div>
                        <div className="form-group">
                            <label className="form-label"><FiClock /> Preferred Time *</label>
                            <select name="scheduledTime" value={formData.scheduledTime} onChange={handleChange} className="form-input">
                                <option value="">Select time</option>
                                <option value="09:00 AM">09:00 AM</option>
                                <option value="10:00 AM">10:00 AM</option>
                                <option value="11:00 AM">11:00 AM</option>
                                <option value="12:00 PM">12:00 PM</option>
                                <option value="02:00 PM">02:00 PM</option>
                                <option value="03:00 PM">03:00 PM</option>
                                <option value="04:00 PM">04:00 PM</option>
                                <option value="05:00 PM">05:00 PM</option>
                            </select>
                        </div>
                    </div>

                    <h4 style={{ margin: '1.5rem 0 1rem' }}><FiMapPin /> Location</h4>
                    <div className="form-group">
                        <input type="text" name="location.address" value={formData.location.address} onChange={handleChange} className="form-input" placeholder="Street address" />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
                        <input type="text" name="location.city" value={formData.location.city} onChange={handleChange} className="form-input" placeholder="City" />
                        <input type="text" name="location.state" value={formData.location.state} onChange={handleChange} className="form-input" placeholder="State" />
                        <input type="text" name="location.pincode" value={formData.location.pincode} onChange={handleChange} className="form-input" placeholder="Pincode" />
                    </div>

                    <h4 style={{ margin: '1.5rem 0 1rem' }}><FiUser /> Contact Person</h4>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <input type="text" name="contact.name" value={formData.contactPerson.name} onChange={handleChange} className="form-input" placeholder="Contact name" />
                        <input type="tel" name="contact.phone" value={formData.contactPerson.phone} onChange={handleChange} className="form-input" placeholder="Phone number" />
                    </div>

                    <div className="form-group" style={{ marginTop: '1rem' }}>
                        <label className="form-label">Additional Notes</label>
                        <textarea name="notes" value={formData.notes} onChange={handleChange} className="form-input" rows="3" placeholder="Any specific requirements..."></textarea>
                    </div>

                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%', marginTop: '1rem' }} disabled={submitting}>
                        {submitting ? 'Creating Booking...' : 'Confirm Booking'}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default BookService
