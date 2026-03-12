/**
 * Home Page
 * Landing page with hero section and features
 */

import { Link } from 'react-router-dom'
import { FiArrowRight, FiCheck, FiShield, FiTruck, FiHeadphones, FiAward } from 'react-icons/fi'
import './Home.css'

const features = [
    { icon: FiShield, title: 'Quality Assured', description: 'All products meet international quality standards' },
    { icon: FiTruck, title: 'Fast Delivery', description: 'Quick and reliable delivery across India' },
    { icon: FiHeadphones, title: '24/7 Support', description: 'Round the clock customer support' },
    { icon: FiAward, title: '10+ Years Experience', description: 'Trusted by industry leaders since 2017' }
]

const categories = [
    { name: 'Rig Equipment', image: 'https://images.unsplash.com/photo-1504328345606-18bbc8c9d7d1?w=400&h=300&fit=crop', count: '150+ Products' },
    { name: 'Drilling Tools', image: 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400&h=300&fit=crop', count: '200+ Products' },
    { name: 'Pumps & Valves', image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTeFa96nA9G-skpti3Jlte3dV9ZfWvIcoam1Q&s', count: '100+ Products' },
    { name: 'Safety Equipment', image: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?w=400&h=300&fit=crop', count: '80+ Products' }
]

const stats = [
    { value: '500+', label: 'Products' },
    { value: '1000+', label: 'Happy Clients' },
    { value: '10+', label: 'Years Experience' },
    { value: '24/7', label: 'Support' }
]

const Home = () => {
    return (
        <div className="home-page">
            {/* Hero Section */}
            <section className="hero">
                <div className="hero-content container">
                    <div className="hero-text">
                        <span className="hero-badge">🏆 Trusted by 1000+ Companies</span>
                        <h1 className="hero-title">
                            Premium Industrial
                            <span className="gradient-text"> Equipment & Solutions</span>
                        </h1>
                        <p className="hero-description">
                            Your trusted partner for high-quality rig spares, drilling tools, and industrial equipment.
                            Serving the oil & gas industry with excellence since 2017.
                        </p>
                        <div className="hero-actions">
                            <Link to="/products" className="btn btn-primary btn-lg">
                                Explore Products <FiArrowRight />
                            </Link>
                            <Link to="/services" className="btn btn-outline btn-lg">
                                Our Services
                            </Link>
                        </div>
                        <div className="hero-features">
                            <div className="hero-feature"><FiCheck /> ISO Certified</div>
                            <div className="hero-feature"><FiCheck /> Premium Quality</div>
                            <div className="hero-feature"><FiCheck /> Expert Support</div>
                        </div>
                    </div>
                    <div className="hero-visual">
                        <div className="hero-image-container">
                            <img
                                src="https://images.jdmagicbox.com/comp/def_content/machine-part-dealers/shutterstock-517513315-machine-part-dealers-7-wr6mp.jpg"
                                alt="Industrial Equipment"
                                className="hero-image"
                            />
                            <div className="hero-floating-card card-1">
                                <span className="card-icon">📦</span>
                                <span className="card-value">500+</span>
                                <span className="card-label">Products</span>
                            </div>
                            <div className="hero-floating-card card-2">
                                <span className="card-icon">⭐</span>
                                <span className="card-value">4.9</span>
                                <span className="card-label">Rating</span>
                            </div>
                        </div>
                    </div>
                </div>
                <div className="hero-bg-shapes">
                    <div className="shape shape-1"></div>
                    <div className="shape shape-2"></div>
                    <div className="shape shape-3"></div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="stats-section">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Why Choose Us?</h2>
                        <p className="section-subtitle">
                            We are committed to providing the best industrial solutions with unmatched quality and service
                        </p>
                    </div>
                    <div className="features-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-card card">
                                <div className="feature-icon">
                                    <feature.icon />
                                </div>
                                <h3 className="feature-title">{feature.title}</h3>
                                <p className="feature-description">{feature.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Categories Section */}
            <section className="categories-section section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Browse Categories</h2>
                        <p className="section-subtitle">
                            Explore our wide range of industrial products and equipment
                        </p>
                    </div>
                    <div className="categories-grid">
                        {categories.map((category, index) => (
                            <Link to={`/products?category=${encodeURIComponent(category.name)}`} key={index} className="category-card">
                                <img src={category.image} alt={category.name} className="category-image" />
                                <div className="category-overlay">
                                    <h3 className="category-name">{category.name}</h3>
                                    <span className="category-count">{category.count}</span>
                                </div>
                            </Link>
                        ))}
                    </div>
                    <div className="text-center mt-xl">
                        <Link to="/products" className="btn btn-primary btn-lg">
                            View All Products <FiArrowRight />
                        </Link>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="container">
                    <div className="cta-content">
                        <h2 className="cta-title">Ready to Get Started?</h2>
                        <p className="cta-description">
                            Contact us today for a free consultation and quote for your industrial equipment needs
                        </p>
                        <div className="cta-actions">
                            <Link to="/contact" className="btn btn-primary btn-lg">
                                Contact Us <FiArrowRight />
                            </Link>
                            <Link to="/enquiry/new" className="btn btn-ghost btn-lg">
                                Request Quote
                            </Link>
                        </div>
                    </div>
                </div>
            </section>
        </div>
    )
}

export default Home
