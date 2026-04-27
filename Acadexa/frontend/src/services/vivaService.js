import apiClient from './apiService';

export const vivaService = {
  addQuestion: (data) => apiClient.post('/viva/question/add', data),
  getQuestions: (params) => apiClient.get('/viva/questions', { params }),
  mockVivaSession: (data) => apiClient.post('/viva/mock-session', data),
};
