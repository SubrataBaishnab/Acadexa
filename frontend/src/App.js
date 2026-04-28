import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, useLocation } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Pages & Components
import EligibilityPage from './pages/EligibilityPage';
import SupervisorsPage from './pages/SupervisorsPage';
import ProfessorsPage from './pages/ProfessorsPage';
import DeadlinePage from './pages/DeadlinePage';
import VivaPage from './pages/VivaPage';
import ProgressPage from './pages/ProgressPage';
import SupervisorProgressPage from './pages/SupervisorProgressPage';
import ThesisArchivePage from './pages/ThesisArchivePage'; 
import SynopsisDashboard from './pages/SynopsisDashboard'; 
import PortfolioPage from './pages/PortfolioPage'; 
import ApplicationTrackerPage from './pages/ApplicationTrackerPage'; 
import ResearchAlignmentPage from './pages/ResearchAlignmentPage'; 
import AdminWorkloadPage from './pages/AdminWorkloadPage';
import AdminDashboard from './pages/AdminDashboard';
import StudentDashboard from './pages/StudentDashboard';
import SupervisorReviewPage from './pages/SupervisorReviewPage';
import ProfessorReviewPage from './pages/ProfessorReviewPage';
import ChatbotWidget from './components/ChatbotWidget';
import './App.css';

function NavBar() {
  const location = useLocation();
  const [isOpen, setIsOpen] = useState(false);

  const navLinks = [
    { to: '/',                   label: 'Verify Eligibility', hoverColor: 'hover:text-green-600' },
    { to: '/supervisors',        label: 'Supervisors',        hoverColor: 'hover:text-blue-600' },
    { to: '/phd-professors',     label: 'Grow',               hoverColor: 'hover:text-purple-600' },
    { to: '/deadline',           label: 'Deadline Tracker',   hoverColor: 'hover:text-orange-500' },
    { to: '/viva-prep',          label: 'Viva Prep',          hoverColor: 'hover:text-teal-600' },
    { to: '/progress',           label: 'My Progress',        hoverColor: 'hover:text-indigo-600' },
    { to: '/supervisor-progress',label: 'Student Progress',   hoverColor: 'hover:text-pink-600' },
    { to: '/thesis-archive',     label: 'Thesis Archive',     hoverColor: 'hover:text-amber-600' }, 
    { to: '/applications',       label: 'My Applications',    hoverColor: 'hover:text-red-600' }, 
    { to: '/synopsis',           label: 'Synopsis',           hoverColor: 'hover:text-cyan-600' }, 
    { to: '/research-alignment', label: 'Research Alignment', hoverColor: 'hover:text-cyan-600' },
    { to: '/dashboard',          label: 'My Dashboard',       hoverColor: 'hover:text-teal-500' },
    { to: '/admin',              label: 'Admin',              hoverColor: 'hover:text-gray-600' },
    { to: '/admin/workload',     label: 'Admin Workload',     hoverColor: 'hover:text-blue-600' }
  ];

  return (
    <nav className="bg-white shadow-md sticky top-0 z-30 relative">
      <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center">
        
        {/* Logo */}
        <Link to="/" className="text-2xl font-bold text-blue-600 mr-4">
          Acadexa
        </Link>

        {/* --- DESKTOP / TABLET MENU --- */}
        <div className="hidden md:flex gap-4 lg:gap-6 flex-wrap items-center flex-1">
          {navLinks.map(({ to, label, hoverColor }, index) => {
            const isFirstFour = index < 4;
            return (
              <Link
                key={to}
                to={to}
                className={`text-sm font-semibold transition-colors ${
                  location.pathname === to
                    ? 'text-blue-600 border-b-2 border-blue-600 pb-0.5'
                    : `text-gray-700 ${hoverColor}`
                } ${isFirstFour ? 'block' : 'hidden lg:block'}`}
              >
                {label}
              </Link>
            );
          })}
        </div>

        {/* --- HAMBURGER BUTTON --- */}
        <div className="lg:hidden ml-auto">
          <button
            onClick={() => setIsOpen(!isOpen)}
            className="text-gray-600 hover:text-blue-600 focus:outline-none p-2"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* --- MOBILE / TABLET DROPDOWN MENU --- */}
      {isOpen && (
        <div className="lg:hidden bg-white border-t border-gray-100 shadow-lg animate-fade-in absolute w-full left-0 top-full pb-4">
          <div className="px-4 pt-2 space-y-1 max-h-[70vh] overflow-y-auto">
            {navLinks.map(({ to, label, hoverColor }, index) => {
              const isFirstFour = index < 4;
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={() => setIsOpen(false)} 
                  className={`px-3 py-3 rounded-md text-base font-semibold transition-colors ${
                    location.pathname === to
                      ? 'text-blue-600 bg-blue-50'
                      : `text-gray-700 ${hoverColor} hover:bg-gray-50`
                  } ${isFirstFour ? 'block md:hidden' : 'block'}`}
                >
                  {label}
                </Link>
              );
            })}
          </div>
        </div>
      )}
    </nav>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="App">
          <NavBar />

          <Routes>
            <Route path="/" element={<EligibilityPage />} />
            <Route path="/supervisors" element={<SupervisorsPage />} />
            <Route path="/phd-professors" element={<ProfessorsPage />} />
            <Route path="/progress" element={<ProgressPage />} />
            <Route path="/supervisor-progress" element={<SupervisorProgressPage />} />
            <Route path="/deadline" element={<DeadlinePage />} />
            <Route path="/viva-prep" element={<VivaPage />} />
            <Route path="/applications" element={<ApplicationTrackerPage />} /> 
            <Route path="/thesis-archive" element={<ThesisArchivePage />} /> 
            <Route path="/synopsis" element={<SynopsisDashboard />} /> 
            <Route path="/portfolio/:studentId" element={<PortfolioPage />} /> 
            <Route path="/admin/workload" element={<AdminWorkloadPage />} />
            <Route path="/research-alignment" element={<ResearchAlignmentPage />} />
            <Route path="/dashboard" element={<StudentDashboard />} />
            <Route path="/admin" element={<AdminDashboard />} />
            <Route path="/supervisor-reviews/:supervisorId" element={<SupervisorReviewPage />} />
            <Route path="/professor-reviews/:professorId" element={<ProfessorReviewPage />} />
          </Routes>

          <ChatbotWidget />
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;