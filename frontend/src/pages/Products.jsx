/**
 * Products Page - List all products with filtering
 */

import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { productsAPI } from '../services/api'
import { FiSearch, FiFilter, FiGrid, FiList, FiChevronLeft, FiChevronRight } from 'react-icons/fi'
import './Products.css'

const Products = () => {
    const [searchParams, setSearchParams] = useSearchParams()
    const [products, setProducts] = useState([])
    const [loading, setLoading] = useState(true)
    const [pagination, setPagination] = useState({ page: 1, pages: 1, total: 0 })
    const [categories, setCategories] = useState([])
    const [viewMode, setViewMode] = useState('grid')
    const [filters, setFilters] = useState({
        search: searchParams.get('search') || '',
        category: searchParams.get('category') || '',
        sort: searchParams.get('sort') || '',
        page: parseInt(searchParams.get('page')) || 1
    })

    useEffect(() => {
        fetchProducts()
        fetchCategories()
    }, [filters])

    const fetchProducts = async () => {
        setLoading(true)
        try {
            const { data } = await productsAPI.getAll(filters)
            setProducts(data.data.products)
            setPagination(data.data.pagination)
        } catch (error) {
            console.error('Error fetching products:', error)
        } finally {
            setLoading(false)
        }
    }

    const fetchCategories = async () => {
        try {
            const { data } = await productsAPI.getCategories()
            setCategories(data.data)
        } catch (error) {
            console.error('Error fetching categories:', error)
        }
    }

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value, page: 1 }
        setFilters(newFilters)
        setSearchParams(newFilters)
    }

    const handlePageChange = (page) => {
        const newFilters = { ...filters, page }
        setFilters(newFilters)
        setSearchParams(newFilters)
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    return (
        <div className="products-page">
            <div className="container">
                {/* Header */}
                <div className="page-header">
                    <div className="header-content">
                        <h1 className="page-title">Our Products</h1>
                        <p className="page-subtitle">Explore our wide range of industrial equipment and spare parts</p>
                    </div>
                </div>

                {/* Filters */}
                <div className="filters-bar">
                    <div className="search-box">
                        <FiSearch className="search-icon" />
                        <input type="text" placeholder="Search products..." value={filters.search} onChange={(e) => handleFilterChange('search', e.target.value)} className="search-input" />
                    </div>

                    <div className="filter-group">
                        <select value={filters.category} onChange={(e) => handleFilterChange('category', e.target.value)} className="filter-select">
                            <option value="">All Categories</option>
                            {categories.map((cat) => (<option key={cat} value={cat}>{cat}</option>))}
                        </select>

                        <select value={filters.sort} onChange={(e) => handleFilterChange('sort', e.target.value)} className="filter-select">
                            <option value="">Sort By</option>
                            <option value="price_asc">Price: Low to High</option>
                            <option value="price_desc">Price: High to Low</option>
                            <option value="name">Name</option>
                            <option value="popular">Popular</option>
                        </select>

                        <div className="view-toggle">
                            <button className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`} onClick={() => setViewMode('grid')}><FiGrid /></button>
                            <button className={`view-btn ${viewMode === 'list' ? 'active' : ''}`} onClick={() => setViewMode('list')}><FiList /></button>
                        </div>
                    </div>
                </div>

                {/* Results Count */}
                <div className="results-info">
                    <span>Showing {products.length} of {pagination.total} products</span>
                </div>

                {/* Products Grid */}
                {loading ? (
                    <div className="loading-grid">
                        {[...Array(8)].map((_, i) => (<div key={i} className="product-skeleton"></div>))}
                    </div>
                ) : products.length === 0 ? (
                    <div className="empty-state">
                        <p>No products found</p>
                        <button className="btn btn-outline" onClick={() => setFilters({ search: '', category: '', sort: '', page: 1 })}>Clear Filters</button>
                    </div>
                ) : (
                    <div className={`products-grid ${viewMode}`}>
                        {products.map((product) => (
                            <Link to={`/products/${product.slug}`} key={product._id} className="product-card">
                                <div className="product-image">
                                    <img src={product.images?.[0]?.url || 'https://via.placeholder.com/300x200?text=No+Image'} alt={product.name} />
                                    {product.discountPrice && <span className="discount-badge">-{product.discountPercentage}%</span>}
                                    {product.isFeatured && <span className="featured-badge">Featured</span>}
                                </div>
                                <div className="product-info">
                                    <span className="product-category">{product.category}</span>
                                    <h3 className="product-name">{product.name}</h3>
                                    <div className="product-price">
                                        {product.discountPrice ? (
                                            <>
                                                <span className="current-price">₹{product.discountPrice.toLocaleString()}</span>
                                                <span className="original-price">₹{product.price.toLocaleString()}</span>
                                            </>
                                        ) : (
                                            <span className="current-price">₹{product.price.toLocaleString()}</span>
                                        )}
                                    </div>
                                    <span className={`stock-status ${product.stock > 0 ? 'in-stock' : 'out-of-stock'}`}>
                                        {product.stock > 0 ? 'In Stock' : 'Out of Stock'}
                                    </span>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {pagination.pages > 1 && (
                    <div className="pagination">
                        <button className="page-btn" onClick={() => handlePageChange(pagination.page - 1)} disabled={pagination.page === 1}><FiChevronLeft /></button>
                        {[...Array(pagination.pages)].map((_, i) => (
                            <button key={i + 1} className={`page-btn ${pagination.page === i + 1 ? 'active' : ''}`} onClick={() => handlePageChange(i + 1)}>{i + 1}</button>
                        ))}
                        <button className="page-btn" onClick={() => handlePageChange(pagination.page + 1)} disabled={pagination.page === pagination.pages}><FiChevronRight /></button>
                    </div>
                )}
            </div>
        </div>
    )
}

export default Products
