import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import './Auth.css'

const Login = () => {
    const { login } = useAuth()
    const navigate = useNavigate()
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    })
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState('')

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
        if (error) setError('') // Clear error when user starts typing
    }

    const handleSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        setError('')
        try {
            const success = await login(formData.email, formData.password)
            if (success) {
                navigate('/')
            }
        } catch (err) {
            const msg = err.response?.data?.message || 'Login failed. Please check your credentials.'
            setError(msg)
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="auth-page">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account</p>

            <div className="local-auth-wrapper">
                {error && (
                    <div className="auth-error-msg">
                        <span>⚠</span> {error}
                    </div>
                )}
                <form className="auth-form" onSubmit={handleSubmit}>
                    <div className="form-group">
                        <label>Email Address</label>
                        <input
                            type="email"
                            name="email"
                            placeholder="Enter your email"
                            value={formData.email}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <div className="form-group">
                        <label>Password</label>
                        <input
                            type="password"
                            name="password"
                            placeholder="Enter your password"
                            value={formData.password}
                            onChange={handleChange}
                            required
                        />
                    </div>
                    <button type="submit" className="auth-submit-btn" disabled={loading}>
                        {loading ? 'Signing in...' : 'Sign In'}
                    </button>
                </form>
            </div>

            <div className="auth-footer-links">
                <p className="auth-footer-text">
                    Don&apos;t have an account? <Link to="/register">Create account</Link>
                </p>
                <div className="admin-link">
                    <Link to="/admin/login">Admin Login →</Link>
                </div>
            </div>
        </div>
    )
}

export default Login
