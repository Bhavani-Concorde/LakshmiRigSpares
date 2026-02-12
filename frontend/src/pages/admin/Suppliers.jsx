/**
 * Admin Suppliers Page
 */

import { useState, useEffect } from 'react'
import { suppliersAPI } from '../../services/api'
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './AdminPages.css'

const AdminSuppliers = () => {
    const [suppliers, setSuppliers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editing, setEditing] = useState(null)
    const [formData, setFormData] = useState({ name: '', companyName: '', email: '', phone: '', gstin: '' })

    useEffect(() => { fetchSuppliers() }, [search])

    const fetchSuppliers = async () => {
        try {
            const { data } = await suppliersAPI.getAll({ search })
            setSuppliers(data.data.suppliers || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editing) {
                await suppliersAPI.update(editing._id, formData)
                toast.success('Supplier updated!')
            } else {
                await suppliersAPI.create(formData)
                toast.success('Supplier created!')
            }
            setShowModal(false)
            setEditing(null)
            fetchSuppliers()
        } catch (error) {
            toast.error('Failed to save')
        }
    }

    const handleEdit = (supplier) => {
        setEditing(supplier)
        setFormData({ name: supplier.name, companyName: supplier.companyName, email: supplier.email, phone: supplier.phone, gstin: supplier.gstin })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this supplier?')) return
        try {
            await suppliersAPI.delete(id)
            toast.success('Supplier deleted')
            fetchSuppliers()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    return (
        <div className="admin-page">
            <div className="page-toolbar">
                <div className="search-box">
                    <FiSearch />
                    <input type="text" placeholder="Search suppliers..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={() => { setEditing(null); setFormData({ name: '', companyName: '', email: '', phone: '', gstin: '' }); setShowModal(true) }}>
                    <FiPlus /> Add Supplier
                </button>
            </div>

            {loading ? <div className="loading-placeholder">Loading...</div> : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>Supplier</th><th>Company</th><th>Email</th><th>Phone</th><th>GSTIN</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {suppliers.map(supplier => (
                                <tr key={supplier._id}>
                                    <td><strong>{supplier.name}</strong></td>
                                    <td>{supplier.companyName}</td>
                                    <td>{supplier.email}</td>
                                    <td>{supplier.phone}</td>
                                    <td>{supplier.gstin || 'N/A'}</td>
                                    <td><span className={`badge ${supplier.status === 'active' ? 'badge-success' : 'badge-warning'}`}>{supplier.status}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" onClick={() => handleEdit(supplier)}><FiEdit /></button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(supplier._id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {suppliers.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--dark-400)' }}>No suppliers found</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editing ? 'Edit Supplier' : 'Add Supplier'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Contact Name</label>
                                    <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Company Name</label>
                                    <input type="text" className="form-input" value={formData.companyName} onChange={e => setFormData({ ...formData, companyName: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Email</label>
                                    <input type="email" className="form-input" value={formData.email} onChange={e => setFormData({ ...formData, email: e.target.value })} required />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Phone</label>
                                    <input type="tel" className="form-input" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">GSTIN</label>
                                    <input type="text" className="form-input" value={formData.gstin} onChange={e => setFormData({ ...formData, gstin: e.target.value })} />
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editing ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminSuppliers
