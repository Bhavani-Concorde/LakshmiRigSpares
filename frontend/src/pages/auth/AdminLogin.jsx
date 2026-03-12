/**
 * Admin Login Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi'
import './Auth.css'

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const { adminLogin } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (error) setError('')
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.email || !formData.password) {
            setError('Please fill in all fields')
            return
        }

        setLoading(true)
        setError('')
        try {
            const success = await adminLogin(formData.email, formData.password)
            if (success) {
                navigate('/admin')
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid admin credentials')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <div className="admin-badge">
                <FiShield />
                <span>Admin Portal</span>
            </div>

            <h1 className="auth-title">Admin Login</h1>
            <p className="auth-subtitle">Sign in to access the admin dashboard</p>

            <div className="local-auth-wrapper">
                {error && (
                    <div className="auth-error-msg">
                        <span>⚠</span> {error}
                    </div>
                )}
                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="form-group">
                        <label className="form-label">Email Address</label>
                        <div className="input-wrapper">
                            <FiMail className="input-icon" />
                            <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Enter admin email" />
                        </div>
                    </div>

                    <div className="form-group">
                        <label className="form-label">Password</label>
                        <div className="input-wrapper">
                            <FiLock className="input-icon" />
                            <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder="Enter password" />
                            <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                                {showPassword ? <FiEyeOff /> : <FiEye />}
                            </button>
                        </div>
                    </div>

                    <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                        {loading ? <span className="btn-loader"></span> : 'Sign In to Admin'}
                    </button>
                </form>
            </div>

            <p className="auth-footer-text"><Link to="/login">← Back to User Login</Link></p>
        </div>
    )
}

export default AdminLogin
