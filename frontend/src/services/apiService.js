import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const apiClient = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Supervisor services
export const supervisorService = {
  getAllSupervisors: () => apiClient.get('/supervisors'),
  getSupervisorById: (id) => apiClient.get(`/supervisors/${id}`),
  getRecommendedSupervisors: (data) => apiClient.post('/supervisors/recommendations', data),
  searchSupervisors: (keyword) => apiClient.get('/supervisors', { params: { keyword } }),
};

// Professor services
export const professorService = {
  getAllProfessors: () => apiClient.get('/professors'),
  getProfessorById: (id) => apiClient.get(`/professors/${id}`),
  getRecommendedProfessors: (data) => apiClient.post('/professors/recommendations', data),
  searchProfessors: (query) => apiClient.get('/professors/search', { params: query }),
};

// Chatbot services
export const chatbotService = {
  getSmartRecommendation: (data) => apiClient.post('/chatbot/recommendation', data),
  generateEmailDraft: (data) => apiClient.post('/chatbot/email-draft', data),
};

export default apiClient;
