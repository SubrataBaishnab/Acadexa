import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import SupervisorsPage from './pages/SupervisorsPage';
import ProfessorsPage from './pages/ProfessorsPage';
import EligibilityPage from './pages/EligibilityPage';
import DeadlinePage from './pages/DeadlinePage';
import VivaPage from './pages/VivaPage';
import ProgressPage from './pages/ProgressPage';
import SupervisorProgressPage from './pages/SupervisorProgressPage';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

function NavBar() {
  const location = useLocation();

  const navLinks = [
    { to: '/', label: 'Verify Eligibility', hoverColor: 'hover:text-green-600' },
    { to: '/supervisors', label: 'Find Supervisor', hoverColor: 'hover:text-blue-600' },
    { to: '/phd-professors', label: 'Find PhD Advisor', hoverColor: 'hover:text-purple-600' },
    { to: '/deadline', label: 'Deadline Tracker', hoverColor: 'hover:text-orange-500' },
    { to: '/viva-prep', label: 'Viva Prep', hoverColor: 'hover:text-teal-600' },
    { to: '/progress', label: 'My Progress', hoverColor: 'hover:text-indigo-600' },
    { to: '/supervisor-progress', label: 'Student Progress', hoverColor: 'hover:text-pink-600' },
  ];

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

        {/* Routes */}
        <Routes>
          <Route path="/" element={<EligibilityPage />} />
          <Route path="/supervisors" element={<SupervisorsPage />} />
          <Route path="/phd-professors" element={<ProfessorsPage />} />
          <Route path="/progress" element={<ProgressPage />} />
          <Route path="/supervisor-progress" element={<SupervisorProgressPage />} />
          <Route path="/deadline" element={<DeadlinePage />} />
          <Route path="/viva-prep" element={<VivaPage />} />
        </Routes>

        {/* Chatbot Widget */}
        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;