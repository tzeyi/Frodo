import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeTheme } from './utils/themeLoader';
import ProtectedRoute from './components/ProtectedRoute';
import { useAuthState } from './hooks/useAuthState';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import SettingsPage from './pages/SettingsPage';
import ForumPage from './pages/ForumPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import DataSeedingPage from './pages/DataSeedingPage';
import './App.css';

// Initialize theme on app startup
initializeTheme();

export default function App() {
  const { user, loading } = useAuthState();

  // Listen for theme changes from SettingsPage and apply them globally
  useEffect(() => {
    const handleThemeChange = (event) => {
      const { theme } = event.detail;
      document.documentElement.setAttribute('data-theme', theme);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  // Show loading screen while checking authentication status
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

  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes - redirect to dashboard if already logged in */}
        <Route 
          path="/login" 
          element={user ? <Navigate to="/" replace /> : <LoginPage />} 
        />
        
        {/* Protected routes - require authentication */}
        <Route path="/" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
        <Route path="/tickets" element={<ProtectedRoute><TicketsPage /></ProtectedRoute>} />
        <Route path="/forum" element={<ProtectedRoute><ForumPage /></ProtectedRoute>} />
        <Route path="/settings" element={<ProtectedRoute><SettingsPage /></ProtectedRoute>} />
        <Route path="/onboarding" element={<ProtectedRoute><OnboardingPage /></ProtectedRoute>} />
        <Route path="/admin/seed-data" element={<ProtectedRoute><DataSeedingPage /></ProtectedRoute>} />
      </Routes>
    </BrowserRouter>
  );
}