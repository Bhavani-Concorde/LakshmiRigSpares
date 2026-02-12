/**
 * Main App Component
 * Handles routing and layout for the application
 */

import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'

// Layouts
import MainLayout from './components/layouts/MainLayout'
import AdminLayout from './components/layouts/AdminLayout'
import AuthLayout from './components/layouts/AuthLayout'

// Public Pages
import Home from './pages/Home'
import Products from './pages/Products'
import ProductDetail from './pages/ProductDetail'
import Services from './pages/Services'
import ServiceDetail from './pages/ServiceDetail'
import About from './pages/About'
import Contact from './pages/Contact'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import AdminLogin from './pages/auth/AdminLogin'
import ForgotPassword from './pages/auth/ForgotPassword'

// User Dashboard Pages
import UserDashboard from './pages/user/Dashboard'
import UserProfile from './pages/user/Profile'
import UserOrders from './pages/user/Orders'
import UserBookings from './pages/user/Bookings'
import UserEnquiries from './pages/user/Enquiries'
import BookService from './pages/user/BookService'
import CreateEnquiry from './pages/user/CreateEnquiry'

// Admin Dashboard Pages
import AdminDashboard from './pages/admin/Dashboard'
import AdminProducts from './pages/admin/Products'
import AdminServices from './pages/admin/Services'
import AdminOrders from './pages/admin/Orders'
import AdminBookings from './pages/admin/Bookings'
import AdminEnquiries from './pages/admin/Enquiries'
import AdminUsers from './pages/admin/Users'
import AdminSuppliers from './pages/admin/Suppliers'

// Components
import PageLoader from './components/common/PageLoader'
import ProtectedRoute from './components/common/ProtectedRoute'

function App() {
    const { loading } = useAuth()

    if (loading) {
        return <PageLoader />
    }

    return (
        <Routes>
            {/* Public Routes */}
            <Route element={<MainLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/products" element={<Products />} />
                <Route path="/products/:slug" element={<ProductDetail />} />
                <Route path="/services" element={<Services />} />
                <Route path="/services/:slug" element={<ServiceDetail />} />
                <Route path="/about" element={<About />} />
                <Route path="/contact" element={<Contact />} />
            </Route>

            {/* Auth Routes */}
            <Route element={<AuthLayout />}>
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/admin/login" element={<AdminLogin />} />
                <Route path="/forgot-password" element={<ForgotPassword />} />
            </Route>

            {/* User Dashboard Routes */}
            <Route element={<ProtectedRoute><MainLayout showSidebar /></ProtectedRoute>}>
                <Route path="/dashboard" element={<UserDashboard />} />
                <Route path="/profile" element={<UserProfile />} />
                <Route path="/my-orders" element={<UserOrders />} />
                <Route path="/my-bookings" element={<UserBookings />} />
                <Route path="/my-enquiries" element={<UserEnquiries />} />
                <Route path="/book-service/:serviceId" element={<BookService />} />
                <Route path="/enquiry/new" element={<CreateEnquiry />} />
            </Route>

            {/* Admin Routes */}
            <Route element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
                <Route path="/admin" element={<AdminDashboard />} />
                <Route path="/admin/products" element={<AdminProducts />} />
                <Route path="/admin/services" element={<AdminServices />} />
                <Route path="/admin/orders" element={<AdminOrders />} />
                <Route path="/admin/bookings" element={<AdminBookings />} />
                <Route path="/admin/enquiries" element={<AdminEnquiries />} />
                <Route path="/admin/users" element={<AdminUsers />} />
                <Route path="/admin/suppliers" element={<AdminSuppliers />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
    )
}

export default App
