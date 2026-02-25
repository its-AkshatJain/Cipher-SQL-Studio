export const STATUS_CODES = {
  SUCCESS: 200,
  CREATED: 201,
  BAD_REQUEST: 400,
  UNAUTHORIZED: 401,
  FORBIDDEN: 403,
  NOT_FOUND: 404,
  INTERNAL_ERROR: 500,
};

export const ERROR_MESSAGES = {
  QUERY_FAILED: 'SQL query execution failed',
  INVALID_QUERY: 'Invalid SQL query or unauthorized operation',
  HINT_FAILED: 'Failed to generate hint',
  ASSIGNMENT_NOT_FOUND: 'Assignment not found',
};

export const DB_TYPES = {
  MONGODB: 'MONGODB',
  POSTGRES: 'POSTGRES',
};
