import axios from 'axios';

// Pointing to the route we built in your Node backend
const API_URL = 'http://127.0.0.1:5000/api/alignment';

// Renamed to perfectly match Member 3's import statement
export const analyzeResearchAlignment = async (topicData) => {
    try {
        const response = await axios.post(`${API_URL}/analyze`, topicData);
        return response.data;
    } catch (error) {
        console.error("API Error in Research Alignment:", error);
        throw error;
    }
};