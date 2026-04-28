import { useState, useEffect } from 'react';
import { supervisorService, professorService } from '../services/apiService';

export const useSupervisors = () => {
  const [supervisors, setSupervisors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllSupervisors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await supervisorService.getAllSupervisors();
      setSupervisors(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (researchInterests, skills) => {
    setLoading(true);
    setError(null);
    try {
      const response = await supervisorService.getRecommendedSupervisors({
        researchInterests,
        skills,
      });
      setSupervisors(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    supervisors,
    loading,
    error,
    fetchAllSupervisors,
    fetchRecommendations,
  };
};

export const useProfessors = () => {
  const [professors, setProfessors] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchAllProfessors = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await professorService.getAllProfessors();
      setProfessors(response.data.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchRecommendations = async (researchInterests, preferredCountries) => {
    setLoading(true);
    setError(null);
    try {
      const response = await professorService.getRecommendedProfessors({
        researchInterests,
        preferredCountries,
      });
      setProfessors(response.data.data);
      return response.data.data;
    } catch (err) {
      setError(err.message);
      return [];
    } finally {
      setLoading(false);
    }
  };

  return {
    professors,
    loading,
    error,
    fetchAllProfessors,
    fetchRecommendations,
  };
};
