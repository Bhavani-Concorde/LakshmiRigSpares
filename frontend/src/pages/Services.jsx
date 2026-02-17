/**
 * Services Page
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { servicesAPI } from '../services/api'
import { FiSearch, FiClock, FiMapPin, FiStar } from 'react-icons/fi'
import './Services.css'

const Services = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [categories, setCategories] = useState([])
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || ''
    })

    useEffect(() => {
        fetchServices()
        fetchCategories()
    }, [filters])

    const fetchServices = async () => {
        setLoading(true)
        try {
            const { data } = await servicesAPI.getAll(filters)
            setServices(data.data.services || data.data)
        } catch (error) {
            console.error('Error fetching services:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const { data } = await servicesAPI.getCategories()
            setCategories(data.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value }
        setFilters(newFilters)
        setSearchParams(newFilters)
    }

    return (
        <div className="services-page">
            <div className="container">
                <div className="page-header">
                    <h1 className="page-title">Our Services</h1>
                    <p className="page-subtitle">Professional industrial services tailored to your needs</p>
                </div>

                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input type="text" placeholder="Search services..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="search-input" />
                    </div>
                    <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="filter-select">
                        <option value="">All Categories</option>
                        {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                    </select>
                </div>

                {loading ? (
                    <div className="loading-grid">
                        {[...Array(6)].map((_, i) => (<div key={i} className="service-skeleton"></div>))}
                    </div>
                ) : services.length === 0 ? (
                    <div className="empty-state">
                        <p>No services found</p>
                        <button className="btn btn-outline" onClick={() => setFilters({ search: '', category: '' })}>Clear Filters</button>
                    </div>
                ) : (
                    <div className="services-grid">
                        {services.map((service) => (
                            <Link to={`/services/${service.slug}`} key={service._id} className="service-card">
                                <div className="service-image">
                                    <img src={service.images?.[0]?.url || 'https://via.placeholder.com/400x250?text=Service'} alt={service.name} />
                                    <span className="service-category">{service.category}</span>
                                </div>
                                <div className="service-info">
                                    <h3 className="service-name">{service.name}</h3>
                                    <p className="service-description">{service.shortDescription || service.description?.substring(0, 100)}...</p>
                                    <div className="service-meta">
                                        {service.duration && <span className="meta-item"><FiClock /> {service.duration}</span>}
                                        {service.serviceArea && <span className="meta-item"><FiMapPin /> {service.serviceArea}</span>}
                                        {service.rating && typeof service.rating === 'object' ? (
                                            <span className="meta-item"><FiStar /> {service.rating.average || 0} ({service.rating.count || 0})</span>
                                        ) : (
                                            <span className="meta-item"><FiStar /> {service.rating || 0}</span>
                                        )}
                                    </div>
                                    <div className="service-pricing">
                                        {service.pricing?.type === 'fixed' ? (
                                            <span className="service-price">₹{service.pricing.basePrice?.toLocaleString()}</span>
                                        ) : service.pricing?.type === 'hourly' ? (
                                            <span className="service-price">₹{service.pricing.basePrice?.toLocaleString()}/hr</span>
                                        ) : (
                                            <span className="service-price">Get Quote</span>
                                        )}
                                        <span className="book-link">Book Now →</span>
                                    </div>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default Services
