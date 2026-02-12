/**
 * Login Page
 * User login with email/password and Google OAuth
 */

import { useState } from 'react'
import { Link, useNavigate, useLocation } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiMail, FiLock, FiEye, FiEyeOff } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import './Auth.css'

const Login = () => {
    const [formData, setFormData] = useState({ email: '', password: '' })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)

    const { login, googleLogin } = useAuth()
    const navigate = useNavigate()
    const location = useLocation()
    const from = location.state?.from?.pathname || '/dashboard'

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
            const result = await login(formData.email, formData.password)
            if (result.success) {
                toast.success('Welcome back!')
                navigate(from, { replace: true })
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Login failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (response) => {
        setGoogleLoading(true)
        try {
            // Get the ID token from Google
            const tokenResponse = await fetch(
                `https://www.googleapis.com/oauth2/v3/userinfo?access_token=${response.access_token}`
            )
            const userInfo = await tokenResponse.json()

            // For a proper implementation, you'd use the ID token from the credential response
            // Here we're simulating it with the access token for demo purposes
            const result = await googleLogin(response.access_token)
            if (result.success) {
                toast.success('Welcome!')
                navigate(from, { replace: true })
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Google login failed')
        } finally {
            setGoogleLoading(false)
        }
    }

    const googleLoginHandler = useGoogleLogin({
        onSuccess: handleGoogleSuccess,
        onError: () => toast.error('Google login failed')
    })

    return (
        <div className="auth-page">
            <h1 className="auth-title">Welcome Back</h1>
            <p className="auth-subtitle">Sign in to your account to continue</p>

            {/* Google Login Button */}
            <button
                className="google-btn"
                onClick={() => googleLoginHandler()}
                disabled={googleLoading}
            >
                {googleLoading ? (
                    <span className="btn-loader"></span>
                ) : (
                    <>
                        <FcGoogle className="google-icon" />
                        Continue with Google
                    </>
                )}
            </button>

            <div className="auth-divider">
                <span>or continue with email</span>
            </div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input
                            type="email"
                            name="email"
                            value={formData.email}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your email"
                        />
                    </div>
                </div>

                <div className="form-group">
                    <div className="label-row">
                        <label className="form-label">Password</label>
                        <Link to="/forgot-password" className="forgot-link">Forgot password?</Link>
                    </div>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            name="password"
                            value={formData.password}
                            onChange={handleChange}
                            className="form-input"
                            placeholder="Enter your password"
                        />
                        <button
                            type="button"
                            className="password-toggle"
                            onClick={() => setShowPassword(!showPassword)}
                        >
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? <span className="btn-loader"></span> : 'Sign In'}
                </button>
            </form>

            <p className="auth-footer-text">
                Don't have an account? <Link to="/register">Create account</Link>
            </p>

            <div className="admin-link">
                <Link to="/admin/login">Admin Login →</Link>
            </div>
        </div>
    )
}

export default Login
