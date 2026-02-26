import axios from 'axios';
import { API_BASE_URL, ENDPOINTS } from '../constants';

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
  execute: async (sql, pgSchema) => {
    const response = await api.post(ENDPOINTS.EXECUTE_QUERY, { sql, pgSchema });
    return response.data.data;
  },
  getHint: async (question, schema, currentQuery) => {
    const response = await api.post(ENDPOINTS.GET_HINT, { question, schema, currentQuery });
    return response.data.hint;
  },
};

// ── User Progress (Clerk userId — no auth middleware needed on backend) ────────
export const ProgressService = {
  /**
   * Load saved query + completion status for a user + assignment.
   * @param {string} userId       - Clerk user_id ("user_abc123") or fallback sessionId
   * @param {string} assignmentId - MongoDB ObjectId of the assignment
   */
  load: async (userId, assignmentId) => {
    if (!userId) return null;
    try {
      const response = await api.get(`${ENDPOINTS.PROGRESS}/${userId}/${assignmentId}`);
      return response.data.data;
    } catch {
      return null;
    }
  },

  /**
   * Save / update progress for a user + assignment (upsert).
   * @param {string} userId       - Clerk user_id
   * @param {string} assignmentId - MongoDB ObjectId
   * @param {{ sqlQuery: string, isCompleted: boolean }} data
   */
  save: async (userId, assignmentId, { sqlQuery, isCompleted = false }) => {
    if (!userId) return null;
    try {
      const response = await api.post(ENDPOINTS.PROGRESS, {
        sessionId: userId,    // backend field name stays 'sessionId' → maps to userId in DB
        assignmentId,
        sqlQuery,
        isCompleted,
      });
      return response.data.data;
    } catch (err) {
      console.error('[ProgressService] save failed:', err.message);
      return null;
    }
  },

  /**
   * Get all progress records for a user (for the assignments list page).
   * Returns a map: { [assignmentId]: { isCompleted, attemptCount } }
   */
  getAll: async (userId) => {
    if (!userId) return {};
    try {
      const response = await api.get(`${ENDPOINTS.PROGRESS}/user/${userId}`);
      const list = response.data.data ?? [];
      return Object.fromEntries(
        list.map(p => [String(p.assignmentId), { isCompleted: p.isCompleted, attemptCount: p.attemptCount }])
      );
    } catch {
      return {};
    }
  },
};

export default api;
