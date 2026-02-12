/**
 * Auth Layout Component
 * Layout for authentication pages
 */

import { Outlet, Link } from 'react-router-dom'
import './AuthLayout.css'

const AuthLayout = () => {
    return (
        <div className="auth-layout">
            <div className="auth-background">
                <div className="auth-gradient-1"></div>
                <div className="auth-gradient-2"></div>
                <div className="auth-gradient-3"></div>
            </div>

            <div className="auth-container">
                <div className="auth-header">
                    <Link to="/" className="auth-logo">
                        <span className="logo-icon">🏭</span>
                        <div className="logo-text">
                            <span className="logo-primary">Sri Lakshmi</span>
                            <span className="logo-secondary">Rig Spares</span>
                        </div>
                    </Link>
                </div>

                <div className="auth-card">
                    <Outlet />
                </div>

                <p className="auth-footer">
                    &copy; {new Date().getFullYear()} Sri Lakshmi Rig Spares. All rights reserved.
                </p>
            </div>
        </div>
    )
}

export default AuthLayout
