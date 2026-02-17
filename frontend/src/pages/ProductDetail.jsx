/**
 * Product Detail Page
 */

import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { productsAPI, enquiriesAPI } from '../services/api'
import { useAuth } from '../context/AuthContext'
import { useCart } from '../context/CartContext'
import toast from 'react-hot-toast'
import { FiShoppingCart, FiMessageSquare, FiCheck, FiPackage, FiTruck, FiShield, FiArrowLeft } from 'react-icons/fi'
import './ProductDetail.css'

const ProductDetail = () => {
    const { slug } = useParams()
    const { isAuthenticated } = useAuth()
    const { addToCart } = useCart()
    const [product, setProduct] = useState(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState(0)
    const [quantity, setQuantity] = useState(1)
    const [enquiryModal, setEnquiryModal] = useState(false)
    const [enquiryMessage, setEnquiryMessage] = useState('')
    const [submitting, setSubmitting] = useState(false)

    useEffect(() => {
        fetchProduct()
    }, [slug])

    const fetchProduct = async () => {
        setLoading(true)
        try {
            const { data } = await productsAPI.getBySlug(slug)
            setProduct(data.data)
        } catch (error) {
            console.error('Error fetching product:', error)
            toast.error('Product not found')
        } finally {
            setLoading(false)
        }
    }

    const handleEnquiry = async (e) => {
        e.preventDefault()
        if (!isAuthenticated) {
            toast.error('Please login to submit an enquiry')
            return
        }
        setSubmitting(true)
        try {
            await enquiriesAPI.create({
                type: 'product',
                product: product._id,
                subject: `Enquiry for ${product.name}`,
                message: enquiryMessage,
                quantity
            })
            toast.success('Enquiry submitted successfully!')
            setEnquiryModal(false)
            setEnquiryMessage('')
        } catch (error) {
            toast.error('Failed to submit enquiry')
        } finally {
            setSubmitting(false)
        }
    }

    if (loading) {
        return <div className="product-detail-page"><div className="container"><div className="loading-state">Loading...</div></div></div>
    }

    if (!product) {
        return <div className="product-detail-page"><div className="container"><div className="empty-state"><h2>Product not found</h2><Link to="/products" className="btn btn-primary">Back to Products</Link></div></div></div>
    }

    return (
        <div className="product-detail-page">
            <div className="container">
                <Link to="/products" className="back-link"><FiArrowLeft /> Back to Products</Link>

                <div className="product-detail">
                    {/* Images */}
                    <div className="product-gallery">
                        <div className="main-image">
                            <img src={product.images?.[selectedImage]?.url || 'https://via.placeholder.com/600x500?text=No+Image'} alt={product.name} />
                            {product.discountPrice && <span className="discount-badge">-{product.discountPercentage}%</span>}
                        </div>
                        {product.images?.length > 1 && (
                            <div className="thumbnail-list">
                                {product.images.map((img, idx) => (
                                    <button key={idx} className={`thumbnail ${selectedImage === idx ? 'active' : ''}`} onClick={() => setSelectedImage(idx)}>
                                        <img src={img.url} alt={`${product.name} ${idx + 1}`} />
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Info */}
                    <div className="product-info">
                        <span className="product-category">{product.category}</span>
                        <h1 className="product-title">{product.name}</h1>
                        {product.brand && <p className="product-brand">Brand: <strong>{product.brand}</strong></p>}

                        <div className="product-price-box">
                            {product.discountPrice ? (
                                <>
                                    <span className="current-price">₹{product.discountPrice.toLocaleString()}</span>
                                    <span className="original-price">₹{product.price.toLocaleString()}</span>
                                    <span className="save-badge">Save ₹{(product.price - product.discountPrice).toLocaleString()}</span>
                                </>
                            ) : (
                                <span className="current-price">₹{product.price.toLocaleString()}</span>
                            )}
                        </div>

                        <div className="stock-info">
                            <span className={`stock-badge ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                <FiPackage /> {product.stock > 0 ? `${product.stock} in Stock` : 'Out of Stock'}
                            </span>
                            {product.sku && <span className="sku">SKU: {product.sku}</span>}
                        </div>

                        <p className="product-description">{product.shortDescription || product.description}</p>

                        <div className="quantity-selector">
                            <label>Quantity:</label>
                            <div className="qty-input">
                                <button onClick={() => setQuantity(Math.max(1, quantity - 1))}>-</button>
                                <input type="number" value={quantity} onChange={(e) => setQuantity(Math.max(1, parseInt(e.target.value) || 1))} min="1" max={product.stock} />
                                <button onClick={() => setQuantity(Math.min(product.stock, quantity + 1))}>+</button>
                            </div>
                        </div>

                        <div className="action-buttons">
                            <button className="btn btn-primary btn-lg" onClick={() => setEnquiryModal(true)}>
                                <FiMessageSquare /> Send Enquiry
                            </button>
                            <button
                                className="btn btn-secondary btn-lg"
                                disabled={product.stock === 0}
                                onClick={() => addToCart(product, quantity)}
                            >
                                <FiShoppingCart /> Add to Cart
                            </button>
                        </div>

                        <div className="product-features">
                            <div className="feature"><FiTruck /> Free shipping on orders over ₹10,000</div>
                            <div className="feature"><FiShield /> {product.warranty || '1 Year Warranty'}</div>
                            <div className="feature"><FiCheck /> Quality Assured</div>
                        </div>
                    </div>
                </div>

                {/* Specifications */}
                {product.specifications?.length > 0 && (
                    <div className="product-section">
                        <h2>Specifications</h2>
                        <div className="specs-table">
                            {product.specifications.map((spec, idx) => (
                                <div key={idx} className="spec-row">
                                    <span className="spec-key">{spec.key}</span>
                                    <span className="spec-value">{spec.value}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Description */}
                <div className="product-section">
                    <h2>Description</h2>
                    <div className="product-full-description">{product.description}</div>
                </div>

                {/* Enquiry Modal */}
                {enquiryModal && (
                    <div className="modal-overlay" onClick={() => setEnquiryModal(false)}>
                        <div className="modal" onClick={(e) => e.stopPropagation()}>
                            <div className="modal-header">
                                <h3 className="modal-title">Product Enquiry</h3>
                                <button className="modal-close" onClick={() => setEnquiryModal(false)}>×</button>
                            </div>
                            <form onSubmit={handleEnquiry}>
                                <div className="modal-body">
                                    <p className="enquiry-product">{product.name}</p>
                                    <p className="enquiry-qty">Quantity: {quantity}</p>
                                    <div className="form-group">
                                        <label className="form-label">Your Message</label>
                                        <textarea className="form-input form-textarea" value={enquiryMessage} onChange={(e) => setEnquiryMessage(e.target.value)} placeholder="Enter your enquiry details..." required></textarea>
                                    </div>
                                </div>
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-ghost" onClick={() => setEnquiryModal(false)}>Cancel</button>
                                    <button type="submit" className="btn btn-primary" disabled={submitting}>
                                        {submitting ? 'Submitting...' : 'Submit Enquiry'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

export default ProductDetail
