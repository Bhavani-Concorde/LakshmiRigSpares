/**
 * Protected Route Component
 * Restricts access based on authentication status
 */

import { Navigate, useLocation } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
import PageLoader from './PageLoader'

const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { isAuthenticated, isAdmin, loading } = useAuth()
    const location = useLocation()

    if (loading) {
        return <PageLoader />
    }

    if (!isAuthenticated) {
        // Save the attempted URL for redirecting after login
        return <Navigate to="/login" state={{ from: location }} replace />
    }

    if (adminOnly && !isAdmin) {
        return <Navigate to="/dashboard" replace />
    }

    if (!adminOnly && isAdmin && location.pathname.startsWith('/dashboard')) {
        return <Navigate to="/admin" replace />
    }

    return children
}

export default ProtectedRoute
