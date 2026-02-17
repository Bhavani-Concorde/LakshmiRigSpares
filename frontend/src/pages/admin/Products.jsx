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
    const [uploading, setUploading] = useState(false)
    const [formData, setFormData] = useState({ name: '', description: '', category: '', price: '', stock: '', sku: '', image: '' })

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

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return

        const data = new FormData()
        data.append('image', file)

        setUploading(true)
        try {
            const { uploadAPI } = await import('../../services/api')
            const response = await uploadAPI.uploadImage(data)

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

        const productData = {
            ...formData,
            images: formData.image ? [{ url: formData.image, alt: formData.name }] : []
        }

        try {
            if (editingProduct) {
                await productsAPI.update(editingProduct._id, productData)
                toast.success('Product updated!')
            } else {
                await productsAPI.create(productData)
                toast.success('Product created!')
            }
            setShowModal(false)
            setEditingProduct(null)
            setFormData({ name: '', description: '', category: '', price: '', stock: '', sku: '', image: '' })
            fetchProducts()
        } catch (error) {
            toast.error('Failed to save product')
        }
    }

    const handleEdit = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name,
            description: product.description,
            category: product.category,
            price: product.price,
            stock: product.stock,
            sku: product.sku,
            image: product.images && product.images.length > 0 ? product.images[0].url : ''
        })
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
                                        <select className="form-input" value={formData.category} onChange={e => setFormData({ ...formData, category: e.target.value })} required>
                                            <option value="">Select Category</option>
                                            <option value="Rig Equipment">Rig Equipment</option>
                                            <option value="Drilling Tools">Drilling Tools</option>
                                            <option value="Safety Equipment">Safety Equipment</option>
                                            <option value="Pipes & Fittings">Pipes & Fittings</option>
                                            <option value="Valves">Valves</option>
                                            <option value="Pumps">Pumps</option>
                                            <option value="Motors">Motors</option>
                                            <option value="Electrical Components">Electrical Components</option>
                                            <option value="Hydraulic Parts">Hydraulic Parts</option>
                                            <option value="Spare Parts">Spare Parts</option>
                                            <option value="Consumables">Consumables</option>
                                            <option value="Critical Machined Items">Critical Machined Items</option>
                                            <option value="Other">Other</option>
                                        </select>
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
                                <div className="form-group">
                                    <label className="form-label">Product Image</label>

                                    <div className="image-input-methods" style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                                        <input
                                            type="text"
                                            className="form-input"
                                            placeholder="Enter Image URL or Upload below"
                                            value={formData.image}
                                            onChange={(e) => setFormData({ ...formData, image: e.target.value })}
                                        />

                                        <div className="divider" style={{ textAlign: 'center', color: '#666', fontSize: '0.9rem' }}>- OR -</div>

                                        <div className="image-upload-container">
                                            <input
                                                type="file"
                                                accept="image/*"
                                                onChange={handleImageUpload}
                                                className="form-input"
                                                id="product-image-upload"
                                            />
                                            {uploading && <span className="upload-status">Uploading...</span>}
                                        </div>
                                    </div>

                                    {formData.image && (
                                        <div className="image-preview">
                                            <img src={formData.image} alt="Preview" style={{ height: '150px', marginTop: '10px', objectFit: 'cover', borderRadius: '8px', border: '1px solid #333' }} />
                                            <button type="button" className="btn-icon danger" onClick={() => setFormData({ ...formData, image: '' })} style={{ marginLeft: '10px' }}>
                                                <FiTrash2 /> Remove
                                            </button>
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={uploading}>
                                    {editingProduct ? 'Update' : 'Create'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div >
            )}
        </div >
    )
}

export default AdminProducts
