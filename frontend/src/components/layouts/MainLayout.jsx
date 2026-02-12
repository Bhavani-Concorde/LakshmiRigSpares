/**
 * Main Layout Component
 * Layout for public pages with navbar and footer
 */

import { Outlet } from 'react-router-dom'
import Navbar from '../common/Navbar'
import Footer from '../common/Footer'
import './MainLayout.css'

const MainLayout = ({ showSidebar = false }) => {
    return (
        <div className="main-layout">
            <Navbar />
            <main className={`main-content ${showSidebar ? 'with-sidebar' : ''}`}>
                <Outlet />
            </main>
            <Footer />
        </div>
    )
}

export default MainLayout
