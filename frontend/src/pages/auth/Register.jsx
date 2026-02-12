/**
 * Register Page
 * User registration with email/password
 */

import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useGoogleLogin } from '@react-oauth/google'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiLock, FiEye, FiEyeOff, FiPhone, FiBriefcase } from 'react-icons/fi'
import { FcGoogle } from 'react-icons/fc'
import './Auth.css'

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        email: '',
        password: '',
        confirmPassword: '',
        phone: '',
        company: ''
    })
    const [showPassword, setShowPassword] = useState(false)
    const [loading, setLoading] = useState(false)
    const [googleLoading, setGoogleLoading] = useState(false)
    const [agreeTerms, setAgreeTerms] = useState(false)

    const { register, googleLogin } = useAuth()
    const navigate = useNavigate()

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e) => {
        e.preventDefault()

        if (!formData.name || !formData.email || !formData.password) {
            toast.error('Please fill in all required fields')
            return
        }

        if (formData.password !== formData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }

        if (formData.password.length < 6) {
            toast.error('Password must be at least 6 characters')
            return
        }

        if (!agreeTerms) {
            toast.error('Please agree to the terms and conditions')
            return
        }

        setLoading(true)
        try {
            const result = await register({
                name: formData.name,
                email: formData.email,
                password: formData.password,
                phone: formData.phone,
                company: formData.company
            })
            if (result.success) {
                toast.success('Account created successfully!')
                navigate('/dashboard')
            }
        } catch (error) {
            toast.error(error.response?.data?.message || 'Registration failed')
        } finally {
            setLoading(false)
        }
    }

    const handleGoogleSuccess = async (response) => {
        setGoogleLoading(true)
        try {
            const result = await googleLogin(response.access_token)
            if (result.success) {
                toast.success('Welcome!')
                navigate('/dashboard')
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
            <h1 className="auth-title">Create Account</h1>
            <p className="auth-subtitle">Sign up to get started with Sri Lakshmi Rig Spares</p>

            <button className="google-btn" onClick={() => googleLoginHandler()} disabled={googleLoading}>
                {googleLoading ? <span className="btn-loader"></span> : <><FcGoogle className="google-icon" /> Sign up with Google</>}
            </button>

            <div className="auth-divider"><span>or continue with email</span></div>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label className="form-label">Full Name *</label>
                    <div className="input-wrapper">
                        <FiUser className="input-icon" />
                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" placeholder="Enter your full name" />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Email Address *</label>
                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input type="email" name="email" value={formData.email} onChange={handleChange} className="form-input" placeholder="Enter your email" />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Phone Number</label>
                    <div className="input-wrapper">
                        <FiPhone className="input-icon" />
                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" placeholder="Enter phone number" />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Company Name</label>
                    <div className="input-wrapper">
                        <FiBriefcase className="input-icon" />
                        <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-input" placeholder="Enter company name" />
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Password *</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input type={showPassword ? 'text' : 'password'} name="password" value={formData.password} onChange={handleChange} className="form-input" placeholder="Create a password" />
                        <button type="button" className="password-toggle" onClick={() => setShowPassword(!showPassword)}>
                            {showPassword ? <FiEyeOff /> : <FiEye />}
                        </button>
                    </div>
                </div>

                <div className="form-group">
                    <label className="form-label">Confirm Password *</label>
                    <div className="input-wrapper">
                        <FiLock className="input-icon" />
                        <input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleChange} className="form-input" placeholder="Confirm your password" />
                    </div>
                </div>

                <div className="form-group">
                    <label className="terms-label">
                        <input type="checkbox" className="terms-checkbox" checked={agreeTerms} onChange={(e) => setAgreeTerms(e.target.checked)} />
                        <span className="terms-text">I agree to the <Link to="/terms">Terms of Service</Link> and <Link to="/privacy">Privacy Policy</Link></span>
                    </label>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? <span className="btn-loader"></span> : 'Create Account'}
                </button>
            </form>

            <p className="auth-footer-text">Already have an account? <Link to="/login">Sign in</Link></p>
        </div>
    )
}

export default Register
