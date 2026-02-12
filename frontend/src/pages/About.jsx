/**
 * About Page
 */

import { FiAward, FiUsers, FiTruck, FiShield } from 'react-icons/fi'
import './About.css'

const About = () => {
    const stats = [
        { value: '30+', label: 'Years Experience' },
        { value: '1000+', label: 'Happy Clients' },
        { value: '500+', label: 'Products' },
        { value: '50+', label: 'Team Members' }
    ]

    const values = [
        { icon: FiShield, title: 'Quality First', description: 'We never compromise on the quality of our products and services.' },
        { icon: FiUsers, title: 'Customer Focus', description: 'Our customers are at the heart of everything we do.' },
        { icon: FiAward, title: 'Excellence', description: 'We strive for excellence in every aspect of our business.' },
        { icon: FiTruck, title: 'Reliability', description: 'You can count on us for timely delivery and consistent service.' }
    ]

    return (
        <div className="about-page">
            {/* Hero Section */}
            <section className="about-hero">
                <div className="container">
                    <div className="hero-content">
                        <h1 className="hero-title">About <span className="gradient-text">Sri Lakshmi Rig Spares</span></h1>
                        <p className="hero-description">
                            Since 1990, we have been a trusted name in the industrial equipment sector,
                            providing premium quality rig spares, drilling tools, and professional services
                            to the oil & gas industry across India.
                        </p>
                    </div>
                </div>
            </section>

            {/* Stats Section */}
            <section className="about-stats">
                <div className="container">
                    <div className="stats-grid">
                        {stats.map((stat, idx) => (
                            <div key={idx} className="stat-card">
                                <span className="stat-value">{stat.value}</span>
                                <span className="stat-label">{stat.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Story Section */}
            <section className="about-story section">
                <div className="container">
                    <div className="story-grid">
                        <div className="story-content">
                            <h2>Our Story</h2>
                            <p>
                                Sri Lakshmi Rig Spares was founded in 1990 with a vision to become the
                                leading supplier of industrial equipment in India. What started as a small
                                trading company has grown into a comprehensive industrial solutions provider.
                            </p>
                            <p>
                                Over the years, we have built strong relationships with manufacturers
                                worldwide, enabling us to offer the best products at competitive prices.
                                Our commitment to quality and customer satisfaction has earned us the
                                trust of major companies in the oil & gas sector.
                            </p>
                            <p>
                                Today, we continue to innovate and expand our offerings, staying true to
                                our founding principles of quality, integrity, and customer focus.
                            </p>
                        </div>
                        <div className="story-image">
                            <img src="https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=600&h=400&fit=crop" alt="Our facility" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Values Section */}
            <section className="about-values section">
                <div className="container">
                    <div className="section-header">
                        <h2 className="section-title">Our Core Values</h2>
                        <p className="section-subtitle">The principles that guide everything we do</p>
                    </div>
                    <div className="values-grid">
                        {values.map((value, idx) => (
                            <div key={idx} className="value-card card">
                                <div className="value-icon"><value.icon /></div>
                                <h3>{value.title}</h3>
                                <p>{value.description}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    )
}

export default About
