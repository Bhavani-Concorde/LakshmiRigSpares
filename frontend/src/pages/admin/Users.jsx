/**
 * Admin Users Page
 */

import { useState, useEffect } from 'react'
import { adminAPI } from '../../services/api'
import { FiSearch, FiCheck, FiX } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './AdminPages.css'

const AdminUsers = () => {
    const [users, setUsers] = useState([])
    const [loading, setLoading] = useState(true)
    const [search, setSearch] = useState('')

    useEffect(() => { fetchUsers() }, [search])

    const fetchUsers = async () => {
        try {
            const { data } = await adminAPI.getUsers({ search })
            setUsers(data.data.users || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleToggleStatus = async (userId, currentStatus) => {
        try {
            await adminAPI.updateUserStatus(userId, !currentStatus)
            toast.success('User status updated')
            fetchUsers()
        } catch (error) {
            toast.error('Failed to update status')
        }
    }

    return (
        <div className="admin-page">
            <div className="page-toolbar">
                <div className="search-box">
                    <FiSearch />
                    <input type="text" placeholder="Search users..." value={search} onChange={(e) => setSearch(e.target.value)} />
                </div>
            </div>

            {loading ? <div className="loading-placeholder">Loading...</div> : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>User</th><th>Email</th><th>Phone</th><th>Company</th><th>Joined</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {users.map(user => (
                                <tr key={user._id}>
                                    <td>
                                        <div className="product-cell">
                                            <div style={{ width: 40, height: 40, borderRadius: '50%', background: 'var(--gradient-primary)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'white', fontWeight: 600 }}>
                                                {user.name?.charAt(0)}
                                            </div>
                                            <div><strong>{user.name}</strong><span>{user.authProvider}</span></div>
                                        </div>
                                    </td>
                                    <td>{user.email}</td>
                                    <td>{user.phone || 'N/A'}</td>
                                    <td>{user.company || 'N/A'}</td>
                                    <td>{new Date(user.createdAt).toLocaleDateString()}</td>
                                    <td><span className={`badge ${user.isActive ? 'badge-success' : 'badge-danger'}`}>{user.isActive ? 'Active' : 'Inactive'}</span></td>
                                    <td>
                                        <button className={`btn btn-sm ${user.isActive ? 'btn-danger' : 'btn-primary'}`} onClick={() => handleToggleStatus(user._id, user.isActive)}>
                                            {user.isActive ? <><FiX /> Deactivate</> : <><FiCheck /> Activate</>}
                                        </button>
                                    </td>
                                </tr>
                            ))}
                            {users.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--dark-400)' }}>No users found</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}
        </div>
    )
}

export default AdminUsers
