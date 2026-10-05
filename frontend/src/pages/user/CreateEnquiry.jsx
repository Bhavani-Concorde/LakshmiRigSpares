/**
 * Create Enquiry Page
 */

import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { enquiriesAPI } from '../../services/api'
import toast from 'react-hot-toast'
import { FiSend } from 'react-icons/fi'

const CreateEnquiry = () => {
    const navigate = useNavigate()
    const [loading, setLoading] = useState(false)
    const [formData, setFormData] = useState({ type: 'general', subject: '', message: '', priority: 'medium' })

    const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value })

    const handleSubmit = async (e) => {
        e.preventDefault()
        if (!formData.subject || !formData.message) {
            toast.error('Please fill in all required fields')
            return
        }
        setLoading(true)
        try {
            await enquiriesAPI.create(formData)
            toast.success('Enquiry submitted!')
            navigate('/my-enquiries')
        } catch (error) {
            toast.error('Failed to submit enquiry')
        } finally {
            setLoading(false)
        }
    }

    return (
        <div style={{ padding: 'var(--spacing-xl) 0' }}>
            <div className="container" style={{ maxWidth: '600px' }}>
                <h1 className="page-title">New Enquiry</h1>
                <form onSubmit={handleSubmit} className="card" style={{ padding: '2rem' }}>
                    <div className="form-group">
                        <label className="form-label">Enquiry Type</label>
                        <select name="type" value={formData.type} onChange={handleChange} className="form-input">
                            <option value="general">General Enquiry</option>
                            <option value="product">Product Enquiry</option>
                            <option value="service">Service Enquiry</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Priority</label>
                        <select name="priority" value={formData.priority} onChange={handleChange} className="form-input">
                            <option value="low">Low</option>
                            <option value="medium">Medium</option>
                            <option value="high">High</option>
                            <option value="urgent">Urgent</option>
                        </select>
                    </div>
                    <div className="form-group">
                        <label className="form-label">Subject *</label>
                        <input type="text" name="subject" value={formData.subject} onChange={handleChange} className="form-input" placeholder="Brief subject of your enquiry" />
                    </div>
                    <div className="form-group">
                        <label className="form-label">Message *</label>
                        <textarea name="message" value={formData.message} onChange={handleChange} className="form-input" rows="6" placeholder="Describe your enquiry in detail..."></textarea>
                    </div>
                    <button type="submit" className="btn btn-primary btn-lg" style={{ width: '100%' }} disabled={loading}>
                        {loading ? 'Submitting...' : <><FiSend /> Submit Enquiry</>}
                    </button>
                </form>
            </div>
        </div>
    )
}

export default CreateEnquiry
