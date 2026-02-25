import axios from 'axios';
import { API_BASE_URL, ENDPOINTS, getSessionId } from '../constants';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

// ── Assignments ───────────────────────────────────────────────────────────────
export const AssignmentService = {
  getAssignments: async () => {
    const response = await api.get(ENDPOINTS.ASSIGNMENTS);
    return response.data.data;
  },
  getAssignmentById: async (id) => {
    const response = await api.get(`${ENDPOINTS.ASSIGNMENTS}/${id}`);
    return response.data.data;
  },
};

// ── Query Execution ───────────────────────────────────────────────────────────
export const QueryService = {
  execute: async (sql) => {
    const response = await api.post(ENDPOINTS.EXECUTE_QUERY, { sql });
    return response.data.data;
  },
  getHint: async (question, schema, currentQuery) => {
    const response = await api.post(ENDPOINTS.GET_HINT, { question, schema, currentQuery });
    return response.data.hint;
  },
};

// ── User Progress (sessionId-based, no auth) ──────────────────────────────────
export const ProgressService = {
  /** Load saved query + completion status for this session + assignment */
  load: async (assignmentId) => {
    const sessionId = getSessionId();
    try {
      const response = await api.get(`${ENDPOINTS.PROGRESS}/${sessionId}/${assignmentId}`);
      return response.data.data; // { sqlQuery, isCompleted, attemptCount, lastAttempt }
    } catch {
      return null;
    }
  },

  /** Save/update progress for this session + assignment */
  save: async (assignmentId, { sqlQuery, isCompleted = false }) => {
    const sessionId = getSessionId();
    try {
      const response = await api.post(ENDPOINTS.PROGRESS, {
        sessionId,
        assignmentId,
        sqlQuery,
        isCompleted,
      });
      return response.data.data;
    } catch (err) {
      console.error('[ProgressService] save failed:', err.message);
      // Silently fail — don't break the user experience
      return null;
    }
  },
};

export default api;
