/**
 * Admin Enquiries Page
 */

import { useState, useEffect } from 'react'
import { enquiriesAPI } from '../../services/api'
import { FiSearch, FiMessageCircle, FiTrash2 } from 'react-icons/fi'
import toast from 'react-hot-toast'
import './AdminPages.css'

const statuses = ['all', 'new', 'open', 'responded', 'resolved', 'closed']

const AdminEnquiries = () => {
    const [enquiries, setEnquiries] = useState([])
    const [loading, setLoading] = useState(true)
    const [filter, setFilter] = useState('all')
    const [showModal, setShowModal] = useState(false)
    const [selected, setSelected] = useState(null)
    const [response, setResponse] = useState('')

    useEffect(() => { fetchEnquiries() }, [filter])

    const fetchEnquiries = async () => {
        try {
            const params = filter !== 'all' ? { status: filter } : {}
            const { data } = await enquiriesAPI.getAll(params)
            setEnquiries(data.data.enquiries || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const handleRespond = async (e) => {
        e.preventDefault()
        if (!response.trim()) return
        try {
            await enquiriesAPI.respond(selected._id, { message: response })
            toast.success('Response sent')
            setShowModal(false)
            setResponse('')
            fetchEnquiries()
        } catch (error) {
            toast.error('Failed to respond')
        }
    }

    const handleDelete = async (id) => {
        if (!window.confirm('Delete this enquiry?')) return
        try {
            await enquiriesAPI.delete(id)
            toast.success('Deleted')
            fetchEnquiries()
        } catch (error) {
            toast.error('Failed to delete')
        }
    }

    const getPriorityBadge = (priority) => {
        const classes = { low: 'badge-info', medium: 'badge-warning', high: 'badge-danger', urgent: 'badge-danger' }
        return <span className={`badge ${classes[priority] || 'badge-primary'}`}>{priority}</span>
    }

    return (
        <div className="admin-page">
            <div className="filter-tabs">
                {statuses.map(status => (
                    <button key={status} className={`filter-tab ${filter === status ? 'active' : ''}`} onClick={() => setFilter(status)}>
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                    </button>
                ))}
            </div>

            {loading ? <div className="loading-placeholder">Loading...</div> : (
                <div className="table-container">
                    <table className="table">
                        <thead>
                            <tr><th>ID</th><th>Subject</th><th>From</th><th>Type</th><th>Priority</th><th>Status</th><th>Actions</th></tr>
                        </thead>
                        <tbody>
                            {enquiries.map(enq => (
                                <tr key={enq._id}>
                                    <td><strong>{enq.enquiryId}</strong></td>
                                    <td>{enq.subject?.substring(0, 40)}...</td>
                                    <td>{enq.guestInfo?.name || enq.user?.name || 'Guest'}</td>
                                    <td><span className="badge badge-primary">{enq.type}</span></td>
                                    <td>{getPriorityBadge(enq.priority)}</td>
                                    <td><span className={`badge badge-${enq.status === 'new' ? 'info' : enq.status === 'resolved' ? 'success' : 'primary'}`}>{enq.status}</span></td>
                                    <td>
                                        <div className="action-btns">
                                            <button className="btn-icon" onClick={() => { setSelected(enq); setShowModal(true) }}><FiMessageCircle /></button>
                                            <button className="btn-icon danger" onClick={() => handleDelete(enq._id)}><FiTrash2 /></button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                            {enquiries.length === 0 && <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--dark-400)' }}>No enquiries found</td></tr>}
                        </tbody>
                    </table>
                </div>
            )}

            {showModal && selected && (
                <div className="modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="modal modal-lg" onClick={e => e.stopPropagation()}>
                        <div className="modal-header">
                            <h3>Enquiry Details</h3>
                            <button className="modal-close" onClick={() => setShowModal(false)}>×</button>
                        </div>
                        <div className="modal-body">
                            <p><strong>Subject:</strong> {selected.subject}</p>
                            <p><strong>From:</strong> {selected.guestInfo?.name || selected.user?.name} ({selected.guestInfo?.email || selected.user?.email})</p>
                            <p><strong>Message:</strong></p>
                            <div style={{ background: 'rgba(255,255,255,0.03)', padding: '1rem', borderRadius: '8px', marginBottom: '1rem' }}>{selected.message}</div>

                            {selected.responses?.length > 0 && (
                                <div>
                                    <p><strong>Previous Responses:</strong></p>
                                    {selected.responses.map((r, i) => (
                                        <div key={i} style={{ background: 'rgba(139,92,246,0.1)', padding: '0.75rem', borderRadius: '8px', marginBottom: '0.5rem' }}>
                                            <small style={{ color: 'var(--dark-400)' }}>{new Date(r.respondedAt).toLocaleString()}</small>
                                            <p style={{ margin: '0.25rem 0 0' }}>{r.message}</p>
                                        </div>
                                    ))}
                                </div>
                            )}

                            <form onSubmit={handleRespond}>
                                <div className="form-group" style={{ marginTop: '1rem' }}>
                                    <label className="form-label">Send Response</label>
                                    <textarea className="form-input" rows="4" value={response} onChange={e => setResponse(e.target.value)} placeholder="Type your response..."></textarea>
                                </div>
                                <button type="submit" className="btn btn-primary">Send Response</button>
                            </form>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

export default AdminEnquiries
