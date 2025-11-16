import { useEffect } from 'react'

/**
 * Toast notification component that appears at the top center of the page
 * Follows scroll position and auto-dismisses after duration
 * 
 * @param {string} message - The message to display (success or error)
 * @param {string} type - 'success' or 'error'
 * @param {number} duration - How long to show in ms (default: 5000)
 * @param {function} onClose - Callback when toast closes
 */
export default function Toast({ message, type = 'success', duration = 5000, onClose }) {
    useEffect(() => {
        if (message && onClose) {
            const timer = setTimeout(() => {
                onClose()
            }, duration)
            
            return () => clearTimeout(timer)
        }
    }, [message, duration, onClose])

    if (!message) return null

    return (
        <div className="fixed top-4 right-4 z-50 w-full max-w-md px-4">
            <div className={`alert ${type === 'success' ? 'alert-success' : 'alert-error'} shadow-lg animate-[slideDown_0.3s_ease-out]`}>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    className="stroke-current shrink-0 h-6 w-6" 
                    fill="none" 
                    viewBox="0 0 24 24"
                >
                    {type === 'success' ? (
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                    ) : (
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z" 
                        />
                    )}
                </svg>
                <span>{message}</span>
                <button 
                    className="btn btn-sm btn-ghost btn-circle"
                    onClick={onClose}
                    aria-label="Close notification"
                >
                    <svg 
                        xmlns="http://www.w3.org/2000/svg" 
                        className="h-4 w-4" 
                        fill="none" 
                        viewBox="0 0 24 24" 
                        stroke="currentColor"
                    >
                        <path 
                            strokeLinecap="round" 
                            strokeLinejoin="round" 
                            strokeWidth="2" 
                            d="M6 18L18 6M6 6l12 12" 
                        />
                    </svg>
                </button>
            </div>
        </div>
    )
}
