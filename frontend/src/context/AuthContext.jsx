import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import toast from 'react-hot-toast'
import PropTypes from 'prop-types'

const AuthContext = createContext()

export const useAuth = () => useContext(AuthContext)

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)
    const [loading, setLoading] = useState(true)

    // Initialize Auth State on Startup
    useEffect(() => {
        const initAuth = async () => {
            const token = localStorage.getItem('token')
            const adminToken = localStorage.getItem('adminToken')
            const userType = localStorage.getItem('userType')

            if (adminToken && userType === 'admin') {
                try {
                    const { data } = await api.get('/admin/profile')
                    setUser(data.data)
                    setIsAuthenticated(true)
                    setIsAdmin(true)
                } catch (error) {
                    console.error('Admin auto-login failed:', error)
                    localStorage.removeItem('adminToken')
                    localStorage.removeItem('userType')
                }
            } else if (token && userType === 'user') {
                try {
                    const { data } = await api.get('/auth/profile')
                    setUser(data.data)
                    setIsAuthenticated(true)
                    setIsAdmin(false)
                } catch (error) {
                    console.error('User auto-login failed:', error)
                    localStorage.removeItem('token')
                    localStorage.removeItem('userType')
                }
            }
            setLoading(false)
        }

        initAuth()
    }, [])

    // --- Actions ---

    // Standard User Registration
    const register = async (userData) => {
        try {
            const { data } = await api.post('/auth/register', userData)
            if (data.success) {
                localStorage.setItem('token', data.data.token)
                localStorage.setItem('userType', 'user')
                setUser(data.data.user)
                setIsAuthenticated(true)
                setIsAdmin(false)
                toast.success('Registration Successful')
                return true
            }
        } catch (error) {
            console.error('Registration Error:', error)
            toast.error(error.response?.data?.message || 'Registration failed')
            throw error
        }
    }

    // Standard User Login
    const login = async (email, password) => {
        try {
            const { data } = await api.post('/auth/login', { email, password })
            if (data.success) {
                localStorage.setItem('token', data.data.token)
                localStorage.setItem('userType', 'user')
                setUser(data.data.user)
                setIsAuthenticated(true)
                setIsAdmin(false)
                toast.success('Login Successful')
                return true
            }
        } catch (error) {
            console.error('Login Error:', error)
            toast.error(error.response?.data?.message || 'Login failed')
            throw error
        }
    }

    // Admin Login
    const adminLogin = async (email, password) => {
        try {
            const { data } = await api.post('/admin/login', { email, password })
            if (data.success) {
                localStorage.setItem('adminToken', data.token)
                localStorage.setItem('userType', 'admin')
                setUser(data.admin)
                setIsAuthenticated(true)
                setIsAdmin(true)
                toast.success('Admin Login Successful')
                return true
            }
        } catch (error) {
            console.error('Admin Login Error:', error)
            toast.error(error.response?.data?.message || 'Admin Login failed')
            throw error
        }
    }

    // Universal Logout
    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('adminToken')
        localStorage.removeItem('userType')
        setUser(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
        toast.success('Logged out successfully')
    }

    const updateProfile = async (data) => {
        try {
            const endpoint = isAdmin ? '/admin/profile' : '/auth/profile'
            const response = await api.put(endpoint, data)
            setUser(response.data.data)
            toast.success('Profile updated')
            return response.data
        } catch (error) {
            toast.error(error.response?.data?.message || 'Update failed')
            throw error
        }
    }

    return (
        <AuthContext.Provider value={{
            user,
            isAuthenticated,
            isAdmin,
            loading,
            register,
            login,
            adminLogin,
            logout,
            updateProfile
        }}>
            {children}
        </AuthContext.Provider>
    )
}

AuthProvider.propTypes = {
    children: PropTypes.node.isRequired
}
