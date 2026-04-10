import apiClient from './apiService';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:1002/api';

// Submit a new progress update (Student)
export const submitProgressUpdate = async (data) => {
  return apiClient.post('/progress', data);
};

// Get all updates for a student
export const getStudentProgress = async (studentId) => {
  return apiClient.get(`/progress/student/${studentId}`);
};

// Get all updates for a supervisor
export const getSupervisorProgress = async (supervisorId) => {
  return apiClient.get(`/progress/supervisor/${supervisorId}`);
};

// Update status (Supervisor)
export const updateProgressStatus = async (id, status) => {
  return apiClient.patch(`/progress/${id}/status`, { status });
};

// Add comment (Supervisor)
export const addProgressComment = async (id, commentData) => {
  return apiClient.post(`/progress/${id}/comment`, commentData);
};

// Delete update (Student)
export const deleteProgressUpdate = async (id) => {
  return apiClient.delete(`/progress/${id}`);
};
