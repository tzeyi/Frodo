import { Navigate } from 'react-router-dom';
import { useAuthState } from '../hooks/useAuthState';

/**
 * ProtectedRoute component - Wraps routes that require authentication
 * Shows loading state while checking auth, redirects to login if not authenticated
 */
export default function ProtectedRoute({ children }) {
    const { user, loading } = useAuthState();

    // Show loading state while checking authentication
    if (loading) {
        return (
            <div className="flex items-center justify-center min-h-screen bg-base-200">
                <div className="text-center">
                    <span className="loading loading-spinner loading-lg text-primary"></span>
                    <p className="mt-4 text-base-content/70">Loading...</p>
                </div>
            </div>
        );
    }

    // Redirect to login if not authenticated
    if (!user) {
        return <Navigate to="/login" replace />;
    }

    // User is authenticated, render the protected content
    return children;
}
