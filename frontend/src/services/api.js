/**
 * API Service
 * Axios instance with interceptors for authentication
 */

import axios from 'axios'

const API_URL = '/api'

const api = axios.create({
    baseURL: API_URL,
    headers: {
        'Content-Type': 'application/json'
    },
    withCredentials: true
})

// Request interceptor - Add auth token
api.interceptors.request.use(
    (config) => {
        const token = localStorage.getItem('token')
        if (token) {
            config.headers.Authorization = `Bearer ${token}`
        }
        return config
    },
    (error) => {
        return Promise.reject(error)
    }
)

// Response interceptor - Handle errors
api.interceptors.response.use(
    (response) => response,
    async (error) => {
        const originalRequest = error.config

        // Handle 401 Unauthorized
        if (error.response?.status === 401 && !originalRequest._retry) {
            originalRequest._retry = true

            try {
                // Try to refresh token
                const { data } = await axios.post(`${API_URL}/auth/refresh-token`, {}, { withCredentials: true })
                if (data.success) {
                    localStorage.setItem('token', data.token)
                    originalRequest.headers.Authorization = `Bearer ${data.token}`
                    return api(originalRequest)
                }
            } catch (refreshError) {
                // Refresh failed, logout
                localStorage.removeItem('token')
                localStorage.removeItem('userType')
                window.location.href = '/login'
            }
        }

        return Promise.reject(error)
    }
)

export default api

// ========================================
// Auth API
// ========================================
export const authAPI = {
    login: (data) => api.post('/auth/login', data),
    register: (data) => api.post('/auth/register', data),
    googleAuth: (credential) => api.post('/auth/google', { credential }),
    getProfile: () => api.get('/auth/profile'),
    updateProfile: (data) => api.put('/auth/profile', data),
    updatePassword: (data) => api.put('/auth/password', data),
    forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
    resetPassword: (token, password) => api.post(`/auth/reset-password/${token}`, { password }),
    logout: () => api.post('/auth/logout')
}

// ========================================
// Admin API
// ========================================
export const adminAPI = {
    login: (data) => api.post('/admin/login', data),
    getProfile: () => api.get('/admin/profile'),
    updateProfile: (data) => api.put('/admin/profile', data),
    getDashboard: () => api.get('/admin/dashboard'),
    getUsers: (params) => api.get('/admin/users', { params }),
    updateUserStatus: (id, isActive) => api.put(`/admin/users/${id}/status`, { isActive }),
    logout: () => api.post('/admin/logout')
}

// ========================================
// Products API
// ========================================
export const productsAPI = {
    getAll: (params) => api.get('/products', { params }),
    getOne: (id) => api.get(`/products/${id}`),
    getBySlug: (slug) => api.get(`/products/slug/${slug}`),
    getCategories: () => api.get('/products/categories'),
    create: (data) => api.post('/products', data),
    update: (id, data) => api.put(`/products/${id}`, data),
    delete: (id) => api.delete(`/products/${id}`),
    getAdmin: (params) => api.get('/products/admin/all', { params })
}

// ========================================
// Services API
// ========================================
export const servicesAPI = {
    getAll: (params) => api.get('/services', { params }),
    getOne: (id) => api.get(`/services/${id}`),
    getBySlug: (slug) => api.get(`/services/slug/${slug}`),
    getCategories: () => api.get('/services/categories'),
    create: (data) => api.post('/services', data),
    update: (id, data) => api.put(`/services/${id}`, data),
    delete: (id) => api.delete(`/services/${id}`),
    getAdmin: (params) => api.get('/services/admin/all', { params })
}

// ========================================
// Bookings API
// ========================================
export const bookingsAPI = {
    create: (data) => api.post('/bookings', data),
    getUserBookings: (params) => api.get('/bookings/my-bookings', { params }),
    getOne: (id) => api.get(`/bookings/${id}`),
    cancel: (id, reason) => api.post(`/bookings/${id}/cancel`, { reason }),
    addFeedback: (id, data) => api.post(`/bookings/${id}/feedback`, data),
    getAll: (params) => api.get('/bookings', { params }),
    updateStatus: (id, data) => api.put(`/bookings/${id}/status`, data)
}

// ========================================
// Enquiries API
// ========================================
export const enquiriesAPI = {
    create: (data) => api.post('/enquiries', data),
    getUserEnquiries: (params) => api.get('/enquiries/my-enquiries', { params }),
    getOne: (id) => api.get(`/enquiries/${id}`),
    getAll: (params) => api.get('/enquiries', { params }),
    respond: (id, data) => api.post(`/enquiries/${id}/respond`, data),
    updateStatus: (id, data) => api.put(`/enquiries/${id}/status`, data),
    delete: (id) => api.delete(`/enquiries/${id}`)
}

// ========================================
// Orders API
// ========================================
export const ordersAPI = {
    create: (data) => api.post('/orders', data),
    getUserOrders: (params) => api.get('/orders/my-orders', { params }),
    getOne: (id) => api.get(`/orders/${id}`),
    cancel: (id, reason) => api.post(`/orders/${id}/cancel`, { reason }),
    getAll: (params) => api.get('/orders', { params }),
    updateStatus: (id, data) => api.put(`/orders/${id}/status`, data)
}

// ========================================
// Suppliers API
// ========================================
export const suppliersAPI = {
    getAll: (params) => api.get('/suppliers', { params }),
    getOne: (id) => api.get(`/suppliers/${id}`),
    getStats: () => api.get('/suppliers/stats'),
    create: (data) => api.post('/suppliers', data),
    update: (id, data) => api.put(`/suppliers/${id}`, data),
    updateStatus: (id, status) => api.put(`/suppliers/${id}/status`, { status }),
    delete: (id) => api.delete(`/suppliers/${id}`)
}

export const uploadAPI = {
    uploadImage: (formData) => api.post('/upload', formData, {
        headers: {
            'Content-Type': 'multipart/form-data'
        }
    })
}
