/**
 * Footer Component
 */

import { Link } from 'react-router-dom'
import { FiFacebook, FiTwitter, FiLinkedin, FiInstagram, FiMail, FiPhone, FiMapPin } from 'react-icons/fi'
import './Footer.css'

const Footer = () => {
    const currentYear = new Date().getFullYear()

    return (
        <footer className="footer">
            <div className="footer-container">
                <div className="footer-grid">
                    {/* Company Info */}
                    <div className="footer-section">
                        <div className="footer-brand">
                            <span className="footer-logo">🏭</span>
                            <div>
                                <h3 className="footer-title">Sri Lakshmi Rig Spares</h3>
                                <p className="footer-tagline">Your Trusted Industrial Partner</p>
                            </div>
                        </div>
                        <p className="footer-description">
                            Leading supplier of premium industrial equipment, rig spares, and professional services for the oil & gas industry.
                        </p>
                        <div className="footer-social">
                            <a href="#" className="social-link"><FiFacebook /></a>
                            <a href="#" className="social-link"><FiTwitter /></a>
                            <a href="#" className="social-link"><FiLinkedin /></a>
                            <a href="#" className="social-link"><FiInstagram /></a>
                        </div>
                    </div>

                    {/* Quick Links */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Quick Links</h4>
                        <ul className="footer-links">
                            <li><Link to="/products">Products</Link></li>
                            <li><Link to="/services">Services</Link></li>
                            <li><Link to="/about">About Us</Link></li>
                            <li><Link to="/contact">Contact</Link></li>
                            <li><Link to="/login">Customer Portal</Link></li>
                        </ul>
                    </div>

                    {/* Product Categories */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Categories</h4>
                        <ul className="footer-links">
                            <li><Link to="/products?category=Rig Equipment">Rig Equipment</Link></li>
                            <li><Link to="/products?category=Drilling Tools">Drilling Tools</Link></li>
                            <li><Link to="/products?category=Pumps">Pumps & Valves</Link></li>
                            <li><Link to="/products?category=Safety Equipment">Safety Equipment</Link></li>
                            <li><Link to="/products?category=Spare Parts">Spare Parts</Link></li>
                        </ul>
                    </div>

                    {/* Contact Info */}
                    <div className="footer-section">
                        <h4 className="footer-heading">Contact Us</h4>
                        <ul className="footer-contact">
                            <li>
                                <FiMapPin className="contact-icon" />
                                <span>Perumanallur Road,Kunnathur,Tiruppur Dist, Tamil Nadu, India</span>
                            </li>
                            <li>
                                <FiPhone className="contact-icon" />
                                <span>+91 9842764681</span>
                            </li>
                            <li>
                                <FiMail className="contact-icon" />
                                <span>srilakshmirigspares2788@gmail.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="footer-bottom">
                    <p>&copy; {currentYear} Sri Lakshmi Rig Spares. All rights reserved.</p>
                    <div className="footer-legal">
                        <Link to="/privacy">Privacy Policy</Link>
                        <Link to="/terms">Terms of Service</Link>
                    </div>
                </div>
            </div>
        </footer>
    )
}

export default Footer
