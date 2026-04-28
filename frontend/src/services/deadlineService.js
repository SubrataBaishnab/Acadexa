import apiClient from './apiService';

export const deadlineService = {
  createDeadline: (data) => apiClient.post('/deadline/create', data),
  getDeadlineByStudent: (studentId) => apiClient.get(`/deadline/${studentId}`),
  updateDeadline: (id, data) => apiClient.put(`/deadline/update/${id}`, data),
  analyzeBurnout: (data) => apiClient.post('/deadline/burnout', data),
};