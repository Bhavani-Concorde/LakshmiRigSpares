/**
 * Admin Login Page
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff, FiShield } from 'react-icons/fi'
import './Auth.css'

const AdminLogin = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)

    const { adminLogin } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.email || !formData.password) {
            toast.error('Please fill in all fields')
            return
        }

        setLoading(true)
        try {
            const result = await adminLogin(formData.email, formData.password)
            if (result.success) {
                toast.success('Welcome, Admin!')
                navigate('/admin')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed')
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

            <p className="auth-footer-text"><Link to="/login">← Back to User Login</Link></p>
        </div>
    )
}

export default AdminLogin
