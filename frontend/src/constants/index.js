// API Endpoints
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:5000/api';

export const ENDPOINTS = {
  ASSIGNMENTS: '/assignments',
  EXECUTE_QUERY: '/execute',       // POST /api/execute
  GET_HINT: '/execute/hint',       // POST /api/execute/hint
};

// UI Constants
export const BREAKPOINTS = {
  MOBILE: '320px',
  TABLET: '641px',
  LAPTOP: '1024px',
  DESKTOP: '1281px',
};

export const DIFFICULTY_LEVELS = {
  EASY: 'Easy',
  MEDIUM: 'Medium',
  HARD: 'Hard',
};

export const STORAGE_KEYS = {
  THEME: 'ciphersql_theme',
  ATTEMPTS: 'ciphersql_attempts',
};
