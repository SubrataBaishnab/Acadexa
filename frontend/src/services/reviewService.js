import apiClient from './apiService';

export const reviewService = {
  // Submit a review — type: 'supervisor' | 'professor'
  submitReview: (type, id, data) =>
    apiClient.post(`/reviews/${type}/${id}`, data),

  // Get all reviews + stats
  getReviews: (type, id) =>
    apiClient.get(`/reviews/${type}/${id}`),

  // Check if student already reviewed
  checkReviewed: (type, id, studentId) =>
    apiClient.get(`/reviews/check/${type}/${id}/${studentId}`),

  // Get avg rating summary for all
  getAllSummaries: () =>
    apiClient.get('/reviews/summary/all'),

  // Backward compat aliases
  getReviewsBySupervisor: (id) =>
    apiClient.get(`/reviews/supervisor/${id}`),
};