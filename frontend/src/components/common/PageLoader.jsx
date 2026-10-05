/**
 * Page Loader Component
 * Displays during initial app loading
 */

import './PageLoader.css'

const PageLoader = () => {
    return (
        <div className="page-loader">
            <div className="loader-content">
                <div className="loader-logo">
                    <span className="logo-icon">🏭</span>
                    <span className="logo-text">Sri Lakshmi Rig Spares</span>
                </div>
                <div className="loader-spinner">
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                    <div className="spinner-ring"></div>
                </div>
                <p className="loader-text">Loading...</p>
            </div>
        </div>
    )
}

export default PageLoader
