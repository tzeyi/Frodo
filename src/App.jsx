import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { useEffect } from 'react';
import { initializeTheme } from './utils/themeLoader';
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
  // Listen for theme changes from SettingsPage and apply them globally
  useEffect(() => {
    const handleThemeChange = (event) => {
      const { theme } = event.detail;
      document.documentElement.setAttribute('data-theme', theme);
    };

    window.addEventListener('themeChanged', handleThemeChange);
    return () => window.removeEventListener('themeChanged', handleThemeChange);
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage/>} />
        <Route path="/tickets" element={<TicketsPage/>} />
        <Route path="/forum" element={<ForumPage/>} />
        <Route path="/settings" element={<SettingsPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/onboarding" element={<OnboardingPage/>} />
        <Route path="/admin/seed-data" element={<DataSeedingPage/>} />
      </Routes>
    </BrowserRouter>
  );
}