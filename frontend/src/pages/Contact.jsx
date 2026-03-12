/**
 * Contact Page
 */

import { useState } from 'react'
import { enquiriesAPI } from '../services/api'
import toast from 'react-hot-toast'
import { FiMapPin, FiPhone, FiMail, FiClock, FiSend } from 'react-icons/fi'
import './Contact.css'

const Contact = () => {
    const [formData, setFormData] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
    const [loading, setLoading] = useState(false)

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.name || !formData.email || !formData.message) {
            toast.error('Please fill in all required fields')
            return
        }

        setLoading(true)
        try {
            await enquiriesAPI.create({
                type: 'general',
                guestInfo: { name: formData.name, email: formData.email, phone: formData.phone },
                subject: formData.subject || 'Contact Form Submission',
                message: formData.message
            })
            toast.success('Message sent successfully!')
            setFormData({ name: '', email: '', phone: '', subject: '', message: '' })
        } catch (error) {
            toast.error('Failed to send message')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="contact-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Contact Us</h1>
                    <p className="page-subtitle">Get in touch with us for any inquiries or support</p>
                </div>

                <div className="contact-grid">
                    {/* Contact Form */}
                    <div className="contact-form-section">
                        <div className="card">
                            <h2>Send us a Message</h2>
                            <form onSubmit={handleSubmit}>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Full Name *</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Your name" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email Address *</label>
                                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Your email" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone Number</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="Your phone" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subject</label>
                                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="form-input" placeholder="Message subject" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Message *</label>
                                    <textarea name="message" value={formData.message} onChange={handleChange} className="form-input form-textarea" placeholder="Your message" rows="5"></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary btn-lg" disabled={loading}>
                                    {loading ? <span className="btn-loader"></span> : <><FiSend /> Send Message</>}
                                </button>
                            </form>
                        </div>
                    </div>

                    {/* Contact Info */}
                    <div className="contact-info-section">
                        <div className="info-card">
                            <div className="info-icon"><FiMapPin /></div>
                            <h3>Our Address</h3>
                            <p>Perumanallur Road<br />Kunnathur,Tiruppur Tamil Nadu 638103<br />India</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon"><FiPhone /></div>
                            <h3>Phone Number</h3>
                            <p>+91 9842764681</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon"><FiMail /></div>
                            <h3>Email Address</h3>
                            <p>srilakshmirigspares2788@gmail.com</p>
                        </div>
                        <div className="info-card">
                            <div className="info-icon"><FiClock /></div>
                            <h3>Working Hours</h3>
                            <p>Mon - Sat: 9:00 AM - 8:00 PM<br />Sunday: Closed</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default Contact
