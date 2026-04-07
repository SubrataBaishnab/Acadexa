import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import SupervisorsPage from './pages/SupervisorsPage';
import ProfessorsPage from './pages/ProfessorsPage';
import EligibilityPage from './pages/EligibilityPage';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation */}
        <nav className="bg-white shadow-md sticky top-0 z-30">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
            <Link to="/" className="text-2xl font-bold text-blue-600">
              Acadexa
            </Link>
            <div className="space-x-6">
              <Link
                to="/"
                className="text-gray-700 hover:text-green-600 font-semibold transition-colors"
              >
                1. Verify Eligibility
              </Link>
              <Link
                to="/supervisors"
                className="text-gray-700 hover:text-blue-600 font-semibold transition-colors"
              >
                2. Find Supervisor
              </Link>
              <Link
                to="/phd-professors"
                className="text-gray-700 hover:text-purple-600 font-semibold transition-colors"
              >
                3. Find PhD Advisor
              </Link>
            </div>
          </div>
        </nav>

        {/* Routes */}
        <Routes>
          <Route path="/" element={<EligibilityPage />} />
          <Route path="/supervisors" element={<SupervisorsPage />} />
          <Route path="/phd-professors" element={<ProfessorsPage />} />
        </Routes>

        {/* Chatbot Widget */}
        <ChatbotWidget />
      </div>
    </Router>
  );
}

export default App;