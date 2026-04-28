import apiClient from './apiService';

export const deadlineService = {
  createDeadline:      (data)      => apiClient.post('/deadline/create', data),
  getDeadlineByStudent:(studentId) => apiClient.get(`/deadline/${studentId}`),
  updateDeadline:      (id, data)  => apiClient.put(`/deadline/update/${id}`, data),
  getStudentAnalytics: (studentId) => apiClient.get(`/deadline/analytics/${studentId}`),
  getAdminAnalytics:   ()          => apiClient.get('/deadline/analytics/admin'),
  scheduleMeeting:     (data)      => apiClient.post('/deadline/schedule-meeting', data),
};