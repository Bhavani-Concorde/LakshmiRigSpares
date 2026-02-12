/**
 * Admin Products Page
 */

import { useState, useEffect } from 'react'
import { productsAPI } from '../../services/api'
import { FiPlus, FiEdit, FiTrash2, FiSearch } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './AdminPages.css'

const AdminProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [formData, setFormData] = useState({ name: '', description: '', category: '', price: '', stock: '', sku: '' })

    useEffect(() => { fetchProducts() }, [search])

    const fetchProducts = async () => {
        try {
            const { data } = await productsAPI.getAdmin({ search })
            setProducts(data.data.products || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        try {
            if (editingProduct) {
                await productsAPI.update(editingProduct._id, formData)
                toast.success('Product updated!')
            } else {
                await productsAPI.create(formData)
                toast.success('Product created!')
            }
            setShowModal(false)
            setEditingProduct(null)
            setFormData({ name: '', description: '', category: '', price: '', stock: '', sku: '' })
            fetchProducts()
        } catch (error) {
            toast.error('Failed to save product')
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({ name: product.name, description: product.description, category: product.category, price: product.price, stock: product.stock, sku: product.sku })
        setShowModal(true)
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this product?')) return
        try {
            await productsAPI.delete(id)
            toast.success('Product deleted')
            fetchProducts()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    return (
        <div className="admin-page">
            <div className="page-toolbar">
                <div className="search-box">
                    <FiSearch />
                    <input type="text" placeholder="Search products..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
                <button className="btn btn-primary" onClick={() => { setEditingProduct(null); setFormData({ name: '', description: '', category: '', price: '', stock: '', sku: '' }); setShowModal(true) }}>
                    <FiPlus /> Add Product
                </button>
            </div>

            {loading ? <div className="loading-placeholder">Loading...</div> : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>Product</th><th>Category</th><th>Price</th><th>Stock</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="product-cell">
                                            <img src={product.images?.[0]?.url || 'https://via.placeholder.com/40'} alt="" />
                                            <div><strong>{product.name}</strong><span>{product.sku}</span></div>
                                        </div>
                                    </td>
                                    <td>{product.category}</td>
                                    <td>₹{product.price?.toLocaleString()}</td>
                                    <td>{product.stock}</td>
                                    <td><span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>{product.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" onClick={() => handleEdit(product)}><FiEdit /></button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(product._id)}><FiTrash2 /></button>
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
                            <h3>{editingProduct ? 'Edit Product' : 'Add Product'}</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <form onSubmit={handleSubmit}>
                            <div className="modal-body">
                                <div className="form-group">
                                    <label className="form-label">Product Name</label>
                                    <input type="text" className="form-input" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} required />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Category</label>
                                        <input type="text" className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">SKU</label>
                                        <input type="text" className="form-input" value={formData.sku} onChange={e => setFormData({ ...formData, sku: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Price (₹)</label>
                                        <input type="number" className="form-input" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Stock</label>
                                        <input type="number" className="form-input" value={formData.stock} onChange={e => setFormData({ ...formData, stock: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Description</label>
                                    <textarea className="form-input" rows="4" value={formData.description} onChange={e => setFormData({ ...formData, description: e.target.value })}></textarea>
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary">{editingProduct ? 'Update' : 'Create'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminProducts
