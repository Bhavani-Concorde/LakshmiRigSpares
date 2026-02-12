/**
 * Service Detail Page
 */

import { useState, useEffect } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { servicesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import toast from 'react-hot-toast'
import { FiClock, FiMapPin, FiStar, FiCheck, FiCalendar, FiArrowLeft } from 'react-icons/fi'
import './ServiceDetail.css'

const ServiceDetail = () => {
    const { slug } = useParams()
    const { isAuthenticated } = useAuth()
    const navigate = useNavigate()
    const [service, setService] = useState(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchService() }, [slug])

    const fetchService = async () => {
        setLoading(true)
        try {
            const { data } = await servicesAPI.getBySlug(slug)
            setService(data.data)
        } catch (error) {
            toast.error('Service not found')
        } finally {
            setLoading(false)
        }
    }

    const handleBookNow = () => {
        if (!isAuthenticated) {
            toast.error('Please login to book a service')
            navigate('/login')
            return
        }
        navigate(`/book-service/${service._id}`)
    }

    if (loading) return <div className="service-detail-page"><div className="container"><div className="loading-state">Loading...</div></div></div>
    if (!service) return <div className="service-detail-page"><div className="container"><div className="empty-state"><h2>Service not found</h2><Link to="/services" className="btn btn-primary">Back to Services</Link></div></div></div>

    return (
        <div className="service-detail-page">
            <div className="container">
                <Link to="/services" className="back-link"><FiArrowLeft /> Back to Services</Link>

                <div className="service-detail">
                    <div className="service-main">
                        <div className="service-image-main">
                            <img src={service.images?.[0]?.url || 'https://via.placeholder.com/800x400?text=Service'} alt={service.name} />
                        </div>
                        <div className="service-content">
                            <span className="service-category">{service.category}</span>
                            <h1 className="service-title">{service.name}</h1>
                            <p className="service-desc">{service.description}</p>

                            {service.features?.length > 0 && (
                                <div className="service-features-list">
                                    <h3>What's Included</h3>
                                    <ul>
                                        {service.features.map((feature, idx) => (
                                            <li key={idx}><FiCheck /> {feature}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="service-sidebar">
                        <div className="booking-card card">
                            <div className="pricing-box">
                                {service.pricing?.type === 'fixed' ? (
                                    <><span className="price">₹{service.pricing.basePrice?.toLocaleString()}</span><span className="price-type">Fixed Price</span></>
                                ) : service.pricing?.type === 'hourly' ? (
                                    <><span className="price">₹{service.pricing.basePrice?.toLocaleString()}</span><span className="price-type">Per Hour</span></>
                                ) : (
                                    <><span className="price">Custom</span><span className="price-type">Get Quote</span></>
                                )}
                            </div>

                            <div className="service-quick-info">
                                {service.duration && <div className="info-item"><FiClock /> Duration: {service.duration}</div>}
                                {service.serviceArea && <div className="info-item"><FiMapPin /> Area: {service.serviceArea}</div>}
                                {service.rating && <div className="info-item"><FiStar /> Rating: {service.rating}/5</div>}
                            </div>

                            <button className="btn btn-primary btn-lg btn-block" onClick={handleBookNow}>
                                <FiCalendar /> Book This Service
                            </button>

                            <Link to="/contact" className="btn btn-outline btn-block">Contact for Custom Quote</Link>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}

export default ServiceDetail
