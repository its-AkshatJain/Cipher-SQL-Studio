import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const AssignmentService = {
  getAssignments: async () => {
    // Backend returns { success: true, data: [...] }
    // Axios wraps this in response.data, so actual array is at response.data.data
    const response = await api.get(ENDPOINTS.ASSIGNMENTS);
    return response.data.data;
  },
  getAssignmentById: async (id) => {
    const response = await api.get(`${ENDPOINTS.ASSIGNMENTS}/${id}`);
    return response.data.data;
  },
};

export const QueryService = {
  execute: async (sql) => {
    const response = await api.post(ENDPOINTS.EXECUTE_QUERY, { sql });
    return response.data.data;
  },
  getHint: async (question, schema, currentQuery) => {
    const response = await api.post(`${ENDPOINTS.GET_HINT}`, {
      question,
      schema,
      currentQuery,
    });
    return response.data.hint;
  },
};

export default api;
