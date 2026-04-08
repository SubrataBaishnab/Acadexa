import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SupervisorsPage from './pages/SupervisorsPage';
import ProfessorsPage from './pages/ProfessorsPage';
import DeadlinePage from './pages/DeadlinePage';
import VivaPage from './pages/VivaPage';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

const navLinks = [
  { to: '/', label: 'Find Supervisor', hoverColor: 'hover:text-blue-600' },
  { to: '/phd-professors', label: 'Find PhD Advisor', hoverColor: 'hover:text-purple-600' },
  { to: '/deadline', label: 'Deadline Tracker', hoverColor: 'hover:text-orange-500' },
  { to: '/viva-prep', label: 'Viva Prep', hoverColor: 'hover:text-teal-600' },
];

function NavBar() {
  const location = useLocation();

  return (
    <nav className="bg-white shadow-md sticky top-0 z-30">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold text-blue-600">
          Acadexa
        </Link>
        <div className="flex gap-6">
          {navLinks.map(({ to, label, hoverColor }) => (
            <Link
              key={to}
              to={to}
              className={`text-sm font-semibold transition-colors ${
                location.pathname === to
                  ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                  : `text-gray-700 ${hoverColor}`
              }`}
            >
              {label}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}

function App() {
  return (
    <Router>
      <div className="App">
        <NavBar />

        <Routes>
          <Route path="/" element={<SupervisorsPage />} />
          <Route path="/phd-professors" element={<ProfessorsPage />} />
          <Route path="/deadline" element={<DeadlinePage />} />
          <Route path="/viva-prep" element={<VivaPage />} />
        </Routes>

        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;