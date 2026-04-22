import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const LoginPrompt = ({ title = "Welcome to Acadexa" }) => {
  const { availableUsers, loginAsStudent, loginAsSupervisor } = useAuth();
  const [loginForm, setLoginForm] = useState({ name: '', id: '' });
  const [loginError, setLoginError] = useState('');

  const handleLoginSubmit = (e) => {
    e.preventDefault();
    setLoginError('');
    const { name, id } = loginForm;

    if (!availableUsers) {
      setLoginError('User data is still loading... Please wait.');
      return;
    }

    const checkName = name.trim().toLowerCase();
    const checkId = id.trim();

    const student = availableUsers.students?.find(s => s.studentId === checkId && s.name.toLowerCase() === checkName);
    if (student) {
      loginAsStudent(student.studentId);
      return;
    }

    const supervisor = availableUsers.supervisors?.find(s => s.serial.toString() === checkId && s.name.toLowerCase() === checkName);
    if (supervisor) {
      loginAsSupervisor(supervisor._id);
      return;
    }

    setLoginError('Invalid Name or ID. Please try again.');
  };

  return (
    <div className="max-w-md mx-auto p-4 md:p-8 text-center mt-12 bg-white rounded-xl shadow-lg border border-gray-100">
      <h1 className="text-3xl font-extrabold text-blue-900 mb-8">{title}</h1>
      <p className="text-gray-500 mb-6">Please log in to access this feature.</p>
      <form onSubmit={handleLoginSubmit} className="space-y-5 text-left">
        {loginError && <div className="p-3 bg-red-100 text-red-700 rounded-md text-sm">{loginError}</div>}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">Name</label>
          <input 
            type="text" required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 font-medium"
            placeholder="Enter your name"
            value={loginForm.name}
            onChange={e => setLoginForm({...loginForm, name: e.target.value})}
          />
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-1">ID</label>
          <input 
            type="text" required
            className="w-full p-3 border border-gray-300 rounded-md focus:ring-blue-500 font-medium"
            placeholder="Enter your ID"
            value={loginForm.id}
            onChange={e => setLoginForm({...loginForm, id: e.target.value})}
          />
        </div>
        <button type="submit" className="w-full py-3 bg-blue-600 text-white rounded-md font-bold text-lg hover:bg-blue-700 transition-colors">
          Login
        </button>
      </form>
    </div>
  );
};

export default LoginPrompt;
