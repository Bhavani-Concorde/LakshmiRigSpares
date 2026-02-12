/**
 * Admin Services Page
 */

import { useState, useEffect } from 'react'
import { servicesAPI } from '../../services/api'
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './AdminPages.css'

const AdminServices = () => {
    const [services, setServices] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [uploading, setUploading] = useState(false) // Add uploading state
    const [formData, setFormData] = useState({
        name: '',
        description: '',
        category: '',
        pricing: { type: 'fixed', basePrice: '' },
        duration: '',
        image: '' // Add image field
    })

    useEffect(() => { fetchServices() }, [search])

    const fetchServices = async () => {
        try {
            const { data } = await servicesAPI.getAdmin({ search })
            setServices(data.data.services || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const data = new FormData()
        data.append('image', file)

        setUploading(true)
        try {
            // We need to import uploadAPI. I will add the import next.
            // Assuming uploadAPI is available or using axios directly for now to save a step if needed, 
            // but I will add the import in a separate replace call.
            // For now, let's use the api service we just updated.
            const { uploadAPI } = await import('../../services/api')
            const response = await uploadAPI.uploadImage(data)

            // Backend returns imageUrl: '/uploads/file-....'
            // We need to make sure we prepend the backend URL if it's relative, or just store the path
            // The image src in preview needs to be full URL if running on different port
            // Let's assume proxy handles /uploads or we prepend valid URL
            const imageUrl = `http://localhost:5000${response.data.imageUrl}`
            setFormData(prev => ({ ...prev, image: imageUrl }))
            toast.success('Image uploaded!')
        } catch (error) {
            console.error(error)
            toast.error('Image upload failed')
        } finally {
            setUploading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        // Prepare data for backend
        // Backend expects images array: [{ url: '...', alt: '...' }]
        const serviceData = {
            ...formData,
            images: formData.image ? [{ url: formData.image, alt: formData.name }] : []
        }

        try {
            if (editing) {
                await servicesAPI.update(editing._id, serviceData)
                toast.success('Service updated!')
            } else {
                await servicesAPI.create(serviceData)
                toast.success('Service created!')
            }
            setShowModal(false)
            setEditing(null)
            fetchServices()
        } catch (error) {
            toast.error('Failed to save')
        }
    }

    const handleEdit = (service) => {
        setEditing(service)
        setFormData({
            name: service.name,
            description: service.description,
            category: service.category,
            pricing: service.pricing || { type: 'fixed', basePrice: '' },
            duration: service.duration,
            image: service.images && service.images.length > 0 ? service.images[0].url : ''
        })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this service?')) return
        try {
            await servicesAPI.delete(id)
            toast.success('Service deleted')
            fetchServices()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    return (
        <div className="admin-page">
            <div className="page-toolbar">
                <div className="search-box">
                    <FiSearch />
                    <input type="text" placeholder="Search services..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={() => { setEditing(null); setFormData({ name: '', description: '', category: '', pricing: { type: 'fixed', basePrice: '' }, duration: '' }); setShowModal(true) }}>
                    <FiPlus /> Add Service
                </button>
            </div>

            {loading ? <div className="loading-placeholder">Loading...</div> : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>Service</th><th>Category</th><th>Price</th><th>Duration</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {services.map(service => (
                                <tr key={service._id}>
                                    <td><strong>{service.name}</strong></td>
                                    <td>{service.category}</td>
                                    <td>₹{service.pricing?.basePrice?.toLocaleString()} / {service.pricing?.type}</td>
                                    <td>{service.duration || 'N/A'}</td>
                                    <td><span className={`badge ${service.isActive ? 'badge-success' : 'badge-danger'}`}>{service.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" onClick={() => handleEdit(service)}><FiEdit /></button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(service._id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Service' : 'Add Service'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Service Name</label>
                                    <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <input type="text" className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Duration</label>
                                        <input type="text" className="form-input" value={formData.duration} onChange={e => setFormData({ ...formData, duration: e.target.value })} placeholder="e.g. 2-4 hours" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label