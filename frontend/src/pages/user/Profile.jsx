/**
 * User Profile Page
 */

import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import toast from 'react-hot-toast'
import { FiUser, FiMail, FiPhone, FiMapPin, FiLock } from 'react-icons/fi'
import './Profile.css'

const UserProfile = () => {
    const { user, updateProfile } = useAuth()
    const [loading, setLoading] = useState(false)
    const [activeTab, setActiveTab] = useState('profile')
    const [formData, setFormData] = useState({
        name: user?.name || '',
        phone: user?.phone || '',
        company: user?.company || '',
        address: {
            street: user?.address?.street || '',
            city: user?.address?.city || '',
            state: user?.address?.state || '',
            pincode: user?.address?.pincode || '',
            country: user?.address?.country || 'India'
        }
    })
    const [passwordData, setPasswordData] = useState({ currentPassword: '', newPassword: '', confirmPassword: '' })

    const handleChange = (e) => {
        const { name, value } = e.target
        if (name.startsWith('address.')) {
            const field = name.split('.')[1]
            setFormData({ ...formData, address: { ...formData.address, [field]: value } })
        } else {
            setFormData({ ...formData, [name]: value })
        }
    }

    const handlePasswordChange = (e) => setPasswordData({ ...passwordData, [e.target.name]: e.target.value })

    const handleProfileSubmit = async (e) => {
        e.preventDefault()
        setLoading(true)
        try {
            await updateProfile(formData)
            toast.success('Profile updated successfully!')
        } catch (error) {
            toast.error('Failed to update profile')
        } finally {
            setLoading(false)
        }
    }

    const handlePasswordSubmit = async (e) => {
        e.preventDefault()
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            toast.error('Passwords do not match')
            return
        }
        setLoading(true)
        try {
            await updateProfile({ password: passwordData.newPassword, currentPassword: passwordData.currentPassword })
            toast.success('Password updated!')
            setPasswordData({ currentPassword: '', newPassword: '', confirmPassword: '' })
        } catch (error) {
            toast.error('Failed to update password')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="profile-page">
            <div className="container">
                <h1 className="page-title">My Profile</h1>

                <div className="profile-layout">
                    {/* Sidebar */}
                    <div className="profile-sidebar">
                        <div className="profile-avatar-large">
                            {user?.avatar ? <img src={user.avatar} alt={user.name} /> : <FiUser />}
                        </div>
                        <h2>{user?.name}</h2>
                        <p>{user?.email}</p>
                        <div className="profile-tabs">
                            <button className={activeTab === 'profile' ? 'active' : ''} onClick={() => setActiveTab('profile')}>
                                <FiUser /> Profile Info
                            </button>
                            <button className={activeTab === 'password' ? 'active' : ''} onClick={() => setActiveTab('password')}>
                                <FiLock /> Change Password
                            </button>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="profile-content">
                        {activeTab === 'profile' ? (
                            <form onSubmit={handleProfileSubmit} className="card">
                                <h3>Profile Information</h3>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Full Name</label>
                                        <input type="text" name="name" value={formData.name} onChange={handleChange} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Email</label>
                                        <input type="email" value={user?.email} className="form-input" disabled />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Phone</label>
                                        <input type="tel" name="phone" value={formData.phone} onChange={handleChange} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Company</label>
                                        <input type="text" name="company" value={formData.company} onChange={handleChange} className="form-input" />
                                    </div>
                                </div>

                                <h3 style={{ marginTop: '2rem' }}>Address</h3>
                                <div className="form-group">
                                    <label className="form-label">Street</label>
                                    <input type="text" name="address.street" value={formData.address.street} onChange={handleChange} className="form-input" />
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">City</label>
                                        <input type="text" name="address.city" value={formData.address.city} onChange={handleChange} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">State</label>
                                        <input type="text" name="address.state" value={formData.address.state} onChange={handleChange} className="form-input" />
                                    </div>
                                </div>
                                <div className="form-row">
                                    <div className="form-group">
                                        <label className="form-label">Pincode</label>
                                        <input type="text" name="address.pincode" value={formData.address.pincode} onChange={handleChange} className="form-input" />
                                    </div>
                                    <div className="form-group">
                                        <label className="form-label">Country</label>
                                        <input type="text" name="address.country" value={formData.address.country} onChange={handleChange} className="form-input" />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Saving...' : 'Save Changes'}
                                </button>
                            </form>
                        ) : (
                            <form onSubmit={handlePasswordSubmit} className="card">
                                <h3>Change Password</h3>
                                <div className="form-group">
                                    <label className="form-label">Current Password</label>
                                    <input type="password" name="currentPassword" value={passwordData.currentPassword} onChange={handlePasswordChange} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">New Password</label>
                                    <input type="password" name="newPassword" value={passwordData.newPassword} onChange={handlePasswordChange} className="form-input" />
                                </div>
                                <div className="form-group">
                                    <label className="form-label">Confirm New Password</label>
                                    <input type="password" name="confirmPassword" value={passwordData.confirmPassword} onChange={handlePasswordChange} className="form-input" />
                                </div>
                                <button type="submit" className="btn btn-primary" disabled={loading}>
                                    {loading ? 'Updating...' : 'Update Password'}
                                </button>
                            </form>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}

export default UserProfile
