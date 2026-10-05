/**
 * Forgot Password Page
 */

import { useState } from 'react'
import { Link } from 'react-router-dom'
import { authAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiMail, FiArrowLeft, FiCheckCircle } from 'react-icons/fi'
import './Auth.css'

const ForgotPassword = () => {
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)
    const [sent, setSent] = useState(false)

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!email) {
            toast.error('Please enter your email')
            return
        }

        setLoading(true)
        try {
            await authAPI.forgotPassword(email)
            setSent(true)
            toast.success('Password reset email sent!')
        } catch (error) {
            toast.error(error.response?.data?.message || 'Failed to send reset email')
        } finally {
            setLoading(false)
        }
    }

    if (sent) {
        return (
            <div className="auth-page">
                <div className="success-icon">
                    <FiCheckCircle />
                </div>
                <h1 className="auth-title">Check Your Email</h1>
                <p className="auth-subtitle">We've sent a password reset link to <strong>{email}</strong></p>
                <p className="auth-footer-text"><Link to="/login"><FiArrowLeft /> Back to Login</Link></p>
            </div>
        )
    }

    return (
        <div className="auth-page">
            <h1 className="auth-title">Forgot Password?</h1>
            <p className="auth-subtitle">Enter your email and we'll send you a reset link</p>

            <form onSubmit={handleSubmit} className="auth-form">
                <div className="form-group">
                    <label className="form-label">Email Address</label>
                    <div className="input-wrapper">
                        <FiMail className="input-icon" />
                        <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className="form-input" placeholder="Enter your email" />
                    </div>
                </div>

                <button type="submit" className="btn btn-primary btn-block" disabled={loading}>
                    {loading ? <span className="btn-loader"></span> : 'Send Reset Link'}
                </button>
            </form>

            <p className="auth-footer-text"><Link to="/login"><FiArrowLeft /> Back to Login</Link></p>
        </div>
    )
}

export default ForgotPassword
