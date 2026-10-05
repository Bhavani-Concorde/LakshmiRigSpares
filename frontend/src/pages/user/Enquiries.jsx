/**
 * User Enquiries Page
 */

import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { enquiriesAPI } from '../../services/api'
import { FiMessageSquare, FiPlus } from 'react-icons/fi'

const UserEnquiries = () => {
    const [enquiries, setEnquiries] = useState([])
    const [loading, setLoading] = useState(true)

    useEffect(() => { fetchEnquiries() }, [])

    const fetchEnquiries = async () => {
        try {
            const { data } = await enquiriesAPI.getUserEnquiries()
            setEnquiries(data.data.enquiries || data.data)
        } catch (error) {
            console.error('Error:', error)
        } finally {
            setLoading(false)
        }
    }

    const getStatusBadge = (status) => {
        const classes = { new: 'badge-info', open: 'badge-warning', responded: 'badge-primary', resolved: 'badge-success', closed: 'badge-danger' }
        return <span className={`badge ${classes[status] || 'badge-primary'}`}>{status}</span>
    }

    return (
        <div className="enquiries-page" style={{ padding: 'var(--spacing-xl) 0' }}>
            <div className="container">
                <div className="page-header-row">
                    <h1 className="page-title">My Enquiries</h1>
                    <Link to="/enquiry/new" className="btn btn-primary"><FiPlus /> New Enquiry</Link>
                </div>
                {loading ? (
                    <div className="loading-placeholder">Loading...</div>
                ) : enquiries.length === 0 ? (
                    <div className="empty-state card">
                        <FiMessageSquare style={{ fontSize: '3rem', opacity: 0.5 }} />
                        <p>No enquiries yet</p>
                        <Link to="/enquiry/new" className="btn btn-primary">Create Enquiry</Link>
                    </div>
                ) : (
                    <div className="orders-list">
                        {enquiries.map((enq) => (
                            <div key={enq._id} className="order-card card">
                                <div className="order-header">
                                    <div className="order-id">
                                        <strong>{enq.enquiryId}</strong>
                                        <span>{new Date(enq.createdAt).toLocaleDateString()}</span>
                                    </div>
                                    {getStatusBadge(enq.status)}
                                </div>
                                <div style={{ marginBottom: '1rem' }}>
                                    <p style={{ color: 'var(--light-50)', fontWeight: 500, marginBottom: '0.5rem' }}>{enq.subject}</p>
                                    <p style={{ color: 'var(--dark-400)', fontSize: '0.9rem' }}>{enq.message?.substring(0, 150)}...</p>
                                </div>
                                <div className="order-footer">
                                    <span className="badge badge-primary">{enq.type}</span>
                                    {enq.responses?.length > 0 && <span style={{ color: 'var(--success)', fontSize: '0.9rem' }}>{enq.responses.length} response(s)</span>}
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

export default UserEnquiries
