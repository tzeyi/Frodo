import { BrowserRouter, Routes, Route } from 'react-router-dom';
import DashboardPage from './pages/DashboardPage';


export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<DashboardPage/>} />
        {/* <Route path="/tickets" element={<Tickets />} /> */}
      </Routes>
    </BrowserRouter>
  );
}