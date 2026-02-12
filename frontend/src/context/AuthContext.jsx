/**
 * Authentication Context
 * Manages user authentication state across the application
 */

import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'

const AuthContext = createContext(null)

export const useAuth = () => {
    const context = useContext(AuthContext)
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider')
    }
    return context
}

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null)
    const [admin, setAdmin] = useState(null)
    const [loading, setLoading] = useState(true)
    const [isAuthenticated, setIsAuthenticated] = useState(false)
    const [isAdmin, setIsAdmin] = useState(false)

    // Check for existing auth on mount
    useEffect(() => {
        checkAuth()
    }, [])

    const checkAuth = async () => {
        try {
            const token = localStorage.getItem('token')
            const userType = localStorage.getItem('userType')

            if (!token) {
                setLoading(false)
                return
            }

            if (userType === 'admin') {
                const { data } = await api.get('/admin/profile')
                if (data.success) {
                    setAdmin(data.data)
                    setIsAdmin(true)
                    setIsAuthenticated(true)
                }
            } else {
                const { data } = await api.get('/auth/profile')
                if (data.success) {
                    setUser(data.data)
                    setIsAuthenticated(true)
                }
            }
        } catch (error) {
            console.error('Auth check failed:', error)
            logout()
        } finally {
            setLoading(false)
        }
    }

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password })
        if (data.success) {
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('userType', 'user')
            setUser(data.data.user)
            setIsAuthenticated(true)
            setIsAdmin(false)
        }
        return data
    }

    const register = async (userData) => {
        const { data } = await api.post('/auth/register', userData)
        if (data.success) {
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('userType', 'user')
            setUser(data.data.user)
            setIsAuthenticated(true)
            setIsAdmin(false)
        }
        return data
    }

    const googleLogin = async (credential) => {
        const { data } = await api.post('/auth/google', { credential })
        if (data.success) {
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('userType', 'user')
            setUser(data.data.user)
            setIsAuthenticated(true)
            setIsAdmin(false)
        }
        return data
    }

    const adminLogin = async (email, password) => {
        const { data } = await api.post('/admin/login', { email, password })
        if (data.success) {
            localStorage.setItem('token', data.data.token)
            localStorage.setItem('userType', 'admin')
            setAdmin(data.data.admin)
            setIsAuthenticated(true)
            setIsAdmin(true)
        }
        return data
    }

    const logout = () => {
        localStorage.removeItem('token')
        localStorage.removeItem('userType')
        setUser(null)
        setAdmin(null)
        setIsAuthenticated(false)
        setIsAdmin(false)
    }

    const updateProfile = async (profileData) => {
        const endpoint = isAdmin ? '/admin/profile' : '/auth/profile'
        const { data } = await api.put(endpoint, profileData)
        if (data.success) {
            if (isAdmin) {
                setAdmin(data.data)
            } else {
                setUser(data.data)
            }
        }
        return data
    }

    const value = {
        user,
        admin,
        loading,
        isAuthenticated,
        isAdmin,
        login,
        register,
        googleLogin,
        adminLogin,
        logout,
        updateProfile,
        checkAuth
    }

    return (
        <AuthContext.Provider value={value}>
            {children}
        </AuthContext.Provider>
    )
}

export default AuthContext
