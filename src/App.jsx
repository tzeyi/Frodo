import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';
import TicketsPage from './pages/TicketsPage';
import './App.css';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage/>} />
        <Route path="/tickets" element={<TicketsPage/>} />
      </Routes>
    </BrowserRouter>
  );
}