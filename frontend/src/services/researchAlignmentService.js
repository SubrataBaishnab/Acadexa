import axios from "axios";

const API_BASE_URL =
  process.env.REACT_APP_API_URL || "http://127.0.0.1:1002/api";

export const analyzeResearchAlignment = async ({
  topic,
  abstract,
  domains,
}) => {
  const response = await axios.post(
    `${API_BASE_URL}/research-alignment/analyze`,
    { topic, abstract, domains }
  );
  return response.data;
};