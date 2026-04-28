import apiClient from './apiService';

// GET /api/archive — public searchable list
// params: { search, department, year, page, limit }
export const getTheses = (params = {}) =>
  apiClient.get('/archive', { params });

// GET /api/archive/:id — single thesis
export const getThesisById = (id) =>
  apiClient.get(`/archive/${id}`);

// GET /api/archive/meta/filters — departments + years for dropdowns
export const getArchiveFilters = () =>
  apiClient.get('/archive/meta/filters');

// POST /api/archive — supervisor uploads a thesis (multipart/form-data)
export const uploadThesis = (formData) =>
  apiClient.post('/archive', formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });

// DELETE /api/archive/:id — supervisor removes a thesis
export const deleteThesis = (id) =>
  apiClient.delete(`/archive/${id}`);