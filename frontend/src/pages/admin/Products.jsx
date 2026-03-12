/**
 * Admin Products Page - Full CRUD with Add/Edit Modal
 */

import { useState, useEffect, useCallback } from 'react'
import { productsAPI, uploadAPI } from '../../services/api'
import { FiPlus, FiEdit, FiTrash2, FiSearch, FiX, FiUpload, FiStar, FiPackage } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './AdminPages.css'
import './AdminProducts.css'

const CATEGORIES = [
    'Rig Equipment', 'Drilling Tools', 'Safety Equipment', 'Pipes & Fittings',
    'Valves', 'Pumps', 'Motors', 'Electrical Components',
    'Hydraulic Parts', 'Spare Parts', 'Consumables', 'Critical Machined Items', 'Other'
]

const UNITS = ['piece', 'set', 'kg', 'meter', 'litre', 'box', 'dozen']

const EMPTY_FORM = {
    name: '', shortDescription: '', description: '', category: '',
    subcategory: '', brand: '', model: '', sku: '',
    price: '', discountPrice: '', stock: '', minOrderQuantity: 1,
    unit: 'piece', warranty: '', isFeatured: false, isActive: true,
    image: '', specifications: [], features: [], tags: ''
}

const AdminProducts = () => {
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')
    const [categoryFilter, setCategoryFilter] = useState('')
    const [showModal, setShowModal] = useState(false)
    const [editingProduct, setEditingProduct] = useState(null)
    const [uploading, setUploading] = useState(false)
    const [saving, setSaving] = useState(false)
    const [formData, setFormData] = useState(EMPTY_FORM)
    const [specInput, setSpecInput] = useState({ key: '', value: '' })
    const [featureInput, setFeatureInput] = useState('')
    const [formError, setFormError] = useState('')

    const fetchProducts = useCallback(async () => {
        setLoading(true)
        try {
            const params = {}
            if (search) params.search = search
            if (categoryFilter) params.category = categoryFilter
            const { data } = await productsAPI.getAdmin(params)
            setProducts(data.data.products || data.data || [])
        } catch (err) {
            toast.error('Failed to load products')
        } finally {
            setLoading(false)
        }
    }, [search, categoryFilter])

    useEffect(() => {
        const timer = setTimeout(fetchProducts, 300)
        return () => clearTimeout(timer)
    }, [fetchProducts])

    const openAddModal = () => {
        setEditingProduct(null)
        setFormData(EMPTY_FORM)
        setFormError('')
        setShowModal(true)
    }

    const openEditModal = (product) => {
        setEditingProduct(product)
        setFormData({
            name: product.name || '',
            shortDescription: product.shortDescription || '',
            description: product.description || '',
            category: product.category || '',
            subcategory: product.subcategory || '',
            brand: product.brand || '',
            model: product.model || '',
            sku: product.sku || '',
            price: product.price || '',
            discountPrice: product.discountPrice || '',
            stock: product.stock || 0,
            minOrderQuantity: product.minOrderQuantity || 1,
            unit: product.unit || 'piece',
            warranty: product.warranty || '',
            isFeatured: product.isFeatured || false,
            isActive: product.isActive !== false,
            image: product.images?.[0]?.url || '',
            specifications: product.specifications || [],
            features: product.features || [],
            tags: (product.tags || []).join(', ')
        })
        setFormError('')
        setShowModal(true)
    }

    const closeModal = () => {
        setShowModal(false)
        setEditingProduct(null)
        setFormError('')
    }

    const handleChange = (e) => {
        const { name, value, type, checked } = e.target
        setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }))
    }

    const handleImageUpload = async (e) => {
        const file = e.target.files[0]
        if (!file) return
        const fd = new FormData()
        fd.append('image', file)
        setUploading(true)
        try {
            const response = await uploadAPI.uploadImage(fd)
            const imageUrl = response.data.imageUrl
            setFormData(prev => ({ ...prev, image: imageUrl }))
            toast.success('Image uploaded!')
        } catch {
            toast.error('Image upload failed')
        } finally {
            setUploading(false)
        }
    }

    const addSpec = () => {
        if (!specInput.key.trim() || !specInput.value.trim()) return
        setFormData(prev => ({ ...prev, specifications: [...prev.specifications, { ...specInput }] }))
        setSpecInput({ key: '', value: '' })
    }

    const removeSpec = (idx) => {
        setFormData(prev => ({ ...prev, specifications: prev.specifications.filter((_, i) => i !== idx) }))
    }

    const addFeature = () => {
        if (!featureInput.trim()) return
        setFormData(prev => ({ ...prev, features: [...prev.features, featureInput.trim()] }))
        setFeatureInput('')
    }

    const removeFeature = (idx) => {
        setFormData(prev => ({ ...prev, features: prev.features.filter((_, i) => i !== idx) }))
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setFormError('')

        if (!formData.name.trim()) return setFormError('Product name is required.')
        if (!formData.category) return setFormError('Category is required.')
        if (!formData.description.trim()) return setFormError('Description is required.')
        if (!formData.price || Number(formData.price) <= 0) return setFormError('A valid price is required.')
        if (formData.stock === '' || Number(formData.stock) < 0) return setFormError('Stock quantity is required.')

        const productPayload = {
            name: formData.name.trim(),
            shortDescription: formData.shortDescription.trim(),
            description: formData.description.trim(),
            category: formData.category,
            subcategory: formData.subcategory.trim(),
            brand: formData.brand.trim(),
            model: formData.model.trim(),
            sku: formData.sku.trim() || undefined,
            price: Number(formData.price),
            discountPrice: formData.discountPrice ? Number(formData.discountPrice) : undefined,
            stock: Number(formData.stock),
            minOrderQuantity: Number(formData.minOrderQuantity) || 1,
            unit: formData.unit,
            warranty: formData.warranty.trim(),
            isFeatured: formData.isFeatured,
            isActive: formData.isActive,
            images: formData.image ? [{ url: formData.image, alt: formData.name, isPrimary: true }] : [],
            specifications: formData.specifications,
            features: formData.features,
            tags: formData.tags ? formData.tags.split(',').map(t => t.trim()).filter(Boolean) : []
        }

        setSaving(true)
        try {
            if (editingProduct) {
                await productsAPI.update(editingProduct._id, productPayload)
                toast.success('Product updated successfully!')
            } else {
                await productsAPI.create(productPayload)
                toast.success('Product added successfully!')
            }
            closeModal()
            fetchProducts()
        } catch (err) {
            const msg = err.response?.data?.message || 'Failed to save product. Please try again.'
            setFormError(msg)
        } finally {
            setSaving(false)
        }
    }

    const handleDelete = async (id, name) => {
        if (!window.confirm(`Delete "${name}"? This action cannot be undone.`)) return
        try {
            await productsAPI.delete(id)
            toast.success('Product deleted')
            fetchProducts()
        } catch {
            toast.error('Failed to delete product')
        }
    }

    const toggleFeatured = async (product) => {
        try {
            await productsAPI.update(product._id, { isFeatured: !product.isFeatured })
            toast.success(product.isFeatured ? 'Removed from featured' : 'Marked as featured')
            fetchProducts()
        } catch {
            toast.error('Update failed')
        }
    }

    return (
        <div className="admin-page">
            {/* Toolbar */}
            <div className="page-toolbar">
                <div className="search-box">
                    <FiSearch />
                    <input
                        type="text"
                        placeholder="Search products..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <select
                    className="filter-select"
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                >
                    <option value="">All Categories</option>
                    {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
                <button className="btn btn-primary" onClick={openAddModal}>
                    <FiPlus /> Add Product
                </button>
            </div>

            {/* Products Table */}
            {loading ? (
                <div className="ap-loading">
                    <div className="ap-spinner"></div>
                    <span>Loading products...</span>
                </div>
            ) : products.length === 0 ? (
                <div className="ap-empty">
                    <FiPackage size={48} />
                    <p>No products found. Click &quot;Add Product&quot; to get started.</p>
                </div>
            ) : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Product</th>
                                <th>Category</th>
                                <th>Price</th>
                                <th>Stock</th>
                                <th>Featured</th>
                                <th>Status</th>
                                <th>Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {products.map(product => (
                                <tr key={product._id}>
                                    <td>
                                        <div className="product-cell">
                                            <img
                                                src={product.images?.[0]?.url || 'https://placehold.co/40x40/1a1a2e/white?text=P'}
                                                alt={product.name}
                                                onError={(e) => { e.target.src = 'https://placehold.co/40x40/1a1a2e/white?text=P' }}
                                            />
                                            <div>
                                                <strong>{product.name}</strong>
                                                <span>{product.sku || product.brand || '—'}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td><span className="ap-category-tag">{product.category}</span></td>
                                    <td>
                                        <div className="ap-price-cell">
                                            <span className="ap-price">₹{product.price?.toLocaleString()}</span>
                                            {product.discountPrice && (
                                                <span className="ap-discount">₹{product.discountPrice?.toLocaleString()}</span>
                                            )}
                                        </div>
                                    </td>
                                    <td>
                                        <span className={`ap-stock ${product.stock === 0 ? 'out' : product.stock <= 5 ? 'low' : 'ok'}`}>
                                            {product.stock} {product.unit}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className={`ap-featured-btn ${product.isFeatured ? 'active' : ''}`}
                                            onClick={() => toggleFeatured(product)}
                                            title={product.isFeatured ? 'Remove from featured' : 'Mark as featured'}
                                        >
                                            <FiStar />
                                        </button>
                                    </td>
                                    <td>
                                        <span className={`badge ${product.isActive ? 'badge-success' : 'badge-danger'}`}>
                                            {product.isActive ? 'Active' : 'Inactive'}
                                        </span>
                                    </td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" onClick={() => openEditModal(product)} title="Edit">
                                                <FiEdit />
                                            </button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(product._id, product.name)} title="Delete">
                                                <FiTrash2 />
                                            </button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            )}

            {/* Add / Edit Modal */}
            {showModal && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal ap-modal" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>{editingProduct ? 'Edit Product' : 'Add New Product'}</h3>
                            <button className="modal-close" onClick={closeModal}><FiX /></button>
                        </div>

                        <form onSubmit={handleSubmit}>
                            <div className="modal-body ap-modal-body">

                                {formError && (
                                    <div className="ap-form-error">⚠ {formError}</div>
                                )}

                                {/* ── Section: Basic Info ── */}
                                <div className="ap-section-title">Basic Information</div>

                                <div className="form-group">
                                    <label className="form-label">Product Name <span className="req">*</span></label>
                                    <input
                                        type="text"
                                        name="name"
                                        className="form-input"
                                        placeholder="e.g. Heavy Duty Drilling Bit"
                                        value={formData.name}
                                        onChange={handleChange}
                                        required
                                    />
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Category <span className="req">*</span></label>
                                        <select name="category" className="form-input" value={formData.category} onChange={handleChange} required>
                                            <option value="">Select Category</option>
                                            {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Subcategory</label>
                                        <input type="text" name="subcategory" className="form-input" placeholder="Optional subcategory" value={formData.subcategory} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Brand</label>
                                        <input type="text" name="brand" className="form-input" placeholder="e.g. Bosch" value={formData.brand} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Model</label>
                                        <input type="text" name="model" className="form-input" placeholder="e.g. XR-2000" value={formData.model} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Short Description</label>
                                    <input type="text" name="shortDescription" className="form-input" placeholder="One-line summary (max 500 chars)" value={formData.shortDescription} onChange={handleChange} maxLength={500} />
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Full Description <span className="req">*</span></label>
                                    <textarea name="description" className="form-input ap-textarea" rows="4" placeholder="Detailed product description..." value={formData.description} onChange={handleChange} required />
                                </div>

                                {/* ── Section: Pricing & Stock ── */}
                                <div className="ap-section-title">Pricing & Inventory</div>

                                <div className="form-row three-col">
                                    <div className="form-group">
                                        <label className="form-label">Price (₹) <span className="req">*</span></label>
                                        <input type="number" name="price" className="form-input" placeholder="0.00" min="0" step="0.01" value={formData.price} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Discount Price (₹)</label>
                                        <input type="number" name="discountPrice" className="form-input" placeholder="Optional" min="0" step="0.01" value={formData.discountPrice} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">SKU</label>
                                        <input type="text" name="sku" className="form-input" placeholder="e.g. SLRS-001" value={formData.sku} onChange={handleChange} />
                                    </div>
                                </div>

                                <div className="form-row three-col">
                                    <div className="form-group">
                                        <label className="form-label">Stock Qty <span className="req">*</span></label>
                                        <input type="number" name="stock" className="form-input" placeholder="0" min="0" value={formData.stock} onChange={handleChange} required />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Min Order Qty</label>
                                        <input type="number" name="minOrderQuantity" className="form-input" placeholder="1" min="1" value={formData.minOrderQuantity} onChange={handleChange} />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Unit</label>
                                        <select name="unit" className="form-input" value={formData.unit} onChange={handleChange}>
                                            {UNITS.map(u => <option key={u} value={u}>{u}</option>)}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label className="form-label">Warranty</label>
                                    <input type="text" name="warranty" className="form-input" placeholder="e.g. 1 Year, 6 Months" value={formData.warranty} onChange={handleChange} />
                                </div>

                                {/* ── Section: Image ── */}
                                <div className="ap-section-title">Product Image</div>

                                <div className="form-group">
                                    <label className="form-label">Image URL</label>
                                    <input
                                        type="text"
                                        name="image"
                                        className="form-input"
                                        placeholder="https://... or upload below"
                                        value={formData.image}
                                        onChange={handleChange}
                                    />
                                </div>

                                <div className="ap-upload-area">
                                    <label htmlFor="product-img-upload" className="ap-upload-label">
                                        <FiUpload />
                                        <span>{uploading ? 'Uploading...' : 'Click to upload image'}</span>
                                    </label>
                                    <input
                                        id="product-img-upload"
                                        type="file"
                                        accept="image/*"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                        style={{ display: 'none' }}
                                    />
                                </div>

                                {formData.image && (
                                    <div className="ap-image-preview">
                                        <img src={formData.image} alt="Preview" onError={(e) => { e.target.style.display = 'none' }} />
                                        <button type="button" className="ap-remove-img" onClick={() => setFormData(p => ({ ...p, image: '' }))}>
                                            <FiX /> Remove
                                        </button>
                                    </div>
                                )}

                                {/* ── Section: Specifications ── */}
                                <div className="ap-section-title">Specifications</div>

                                <div className="ap-spec-row">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Key (e.g. Material)"
                                        value={specInput.key}
                                        onChange={e => setSpecInput(p => ({ ...p, key: e.target.value }))}
                                    />
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="Value (e.g. Stainless Steel)"
                                        value={specInput.value}
                                        onChange={e => setSpecInput(p => ({ ...p, value: e.target.value }))}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addSpec())}
                                    />
                                    <button type="button" className="btn btn-ghost ap-add-spec-btn" onClick={addSpec}>Add</button>
                                </div>

                                {formData.specifications.length > 0 && (
                                    <div className="ap-specs-list">
                                        {formData.specifications.map((spec, idx) => (
                                            <div key={idx} className="ap-spec-tag">
                                                <span><strong>{spec.key}:</strong> {spec.value}</span>
                                                <button type="button" onClick={() => removeSpec(idx)}><FiX /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Section: Features ── */}
                                <div className="ap-section-title">Key Features</div>

                                <div className="ap-spec-row">
                                    <input
                                        type="text"
                                        className="form-input"
                                        placeholder="e.g. Corrosion resistant"
                                        value={featureInput}
                                        onChange={e => setFeatureInput(e.target.value)}
                                        onKeyDown={e => e.key === 'Enter' && (e.preventDefault(), addFeature())}
                                    />
                                    <button type="button" className="btn btn-ghost ap-add-spec-btn" onClick={addFeature}>Add</button>
                                </div>

                                {formData.features.length > 0 && (
                                    <div className="ap-specs-list">
                                        {formData.features.map((f, idx) => (
                                            <div key={idx} className="ap-spec-tag">
                                                <span>• {f}</span>
                                                <button type="button" onClick={() => removeFeature(idx)}><FiX /></button>
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* ── Section: Tags & Settings ── */}
                                <div className="ap-section-title">Tags & Settings</div>

                                <div className="form-group">
                                    <label className="form-label">Tags <span className="ap-hint">(comma separated)</span></label>
                                    <input type="text" name="tags" className="form-input" placeholder="e.g. heavy-duty, oil-rig, drilling" value={formData.tags} onChange={handleChange} />
                                </div>

                                <div className="ap-toggles">
                                    <label className="ap-toggle">
                                        <input type="checkbox" name="isFeatured" checked={formData.isFeatured} onChange={handleChange} />
                                        <span className="ap-toggle-track"></span>
                                        <span>Mark as Featured</span>
                                    </label>
                                    <label className="ap-toggle">
                                        <input type="checkbox" name="isActive" checked={formData.isActive} onChange={handleChange} />
                                        <span className="ap-toggle-track"></span>
                                        <span>Active (visible on site)</span>
                                    </label>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="btn btn-ghost" onClick={closeModal}>Cancel</button>
                                <button type="submit" className="btn btn-primary" disabled={saving || uploading}>
                                    {saving ? 'Saving...' : editingProduct ? 'Update Product' : 'Add Product'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminProducts
