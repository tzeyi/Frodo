import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import SettingsPage from './pages/SettingsPage';
import ForumPage from './pages/ForumPage';
import LoginPage from './pages/LoginPage';
import OnboardingPage from './pages/OnboardingPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage/>} />
        <Route path="/tickets" element={<TicketsPage/>} />
        <Route path="/forum" element={<ForumPage/>} />
        <Route path="/settings" element={<SettingsPage/>} />
        <Route path="/login" element={<LoginPage/>} />
        <Route path="/onboarding" element={<OnboardingPage/>} />
      </Routes>
    </BrowserRouter>
  );
}