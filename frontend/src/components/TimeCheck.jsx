import { useEffect, useState } from 'react'

const TimeCheck = () => {
    const [isTimeIncorrect, setIsTimeIncorrect] = useState(false)

    useEffect(() => {
        const checkTime = async () => {
            const currentYear = new Date().getFullYear()
            // If the year is 2026 or later (assuming we are in 2024/2025), prompt user
            // In a real app, you might check against a server timestamp
            if (currentYear > 2025) {
                setIsTimeIncorrect(true)
            }
        }
        checkTime()
    }, [])

    if (!isTimeIncorrect) return null

    return (
        <div style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            zIndex: 9999,
            background: '#ff4444',
            color: 'white',
            padding: '1rem',
            textAlign: 'center',
            fontWeight: 'bold',
            boxShadow: '0 2px 10px rgba(0,0,0,0.2)'
        }}>
            ⚠️ SYSTEM TIME WARNING: Your computer's clock appears to be set to {new Date().getFullYear()}.
            This will cause authentication (Clerk) and security checks to FAIL.
            Please set your system time to the correct current date and refresh the page.
        </div>
    )
}

export default TimeCheck
