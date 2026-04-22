import React, { createContext, useState, useEffect, useContext } from 'react';
import { API_URL } from '../services/apiService';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('acadexa_user');
    return saved ? JSON.parse(saved) : null;
  }); // { id: string, role: 'student' | 'supervisor', name: string }
  
  const [availableUsers, setAvailableUsers] = useState({ students: [], supervisors: [] });

  // On mount, perform seed and fetch pseudo users
  useEffect(() => {
    const initializeAuth = async () => {
      try {
        // 1. Seed students (safe to call multiple times)
        await fetch(`${API_URL}/synopsis/seed-students`, { method: 'POST' });
        
        // 2. Fetch login users mapping
        const response = await fetch(`${API_URL}/synopsis/login-users`);
        const data = await response.json();
        
        if (data.students && data.supervisors) {
           setAvailableUsers(data);
        }
      } catch (err) {
        console.error("Failed to initialize auth users:", err);
      }
    };
    initializeAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Run once on mount

  const loginAsStudent = (studentId) => {
    const student = availableUsers.students.find(s => s.studentId === studentId);
    if (student) {
      const userData = { id: student.studentId, role: 'student', name: student.name };
      setUser(userData);
      localStorage.setItem('acadexa_user', JSON.stringify(userData));
    }
  };

  const loginAsSupervisor = (supervisorId) => {
    const supervisor = availableUsers.supervisors.find(s => s._id === supervisorId);
    if (supervisor) {
      const userData = { id: supervisor._id, role: 'supervisor', name: supervisor.name };
      setUser(userData);
      localStorage.setItem('acadexa_user', JSON.stringify(userData));
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('acadexa_user');
  };

  return (
    <AuthContext.Provider value={{ user, availableUsers, loginAsStudent, loginAsSupervisor, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
