import { pgPool } from '../config/db.js';

// Safe schema name whitelist — only allowed schema names can be used
const ALLOWED_SCHEMAS = new Set([
  'asgn_high_salary',
  'asgn_dept_count',
  'asgn_order_value',
  'asgn_highest_paid',
]);

class QueryService {
  /**
   * Execute a SQL query inside an isolated assignment schema.
   * Uses ROLLBACK after execution so students can't permanently mutate shared data.
   * @param {string} sql         - The SQL query from the student
   * @param {string} pgSchema    - The PostgreSQL schema name for this assignment
   */
  async executeQuery(sql, pgSchema = 'public') {
    // Validate schema name to prevent SQL injection via search_path
    if (!ALLOWED_SCHEMAS.has(pgSchema)) {
      throw new Error(`Invalid schema: "${pgSchema}". Query execution aborted.`);
    }

    // Basic command-level validation: block destructive DDL
    const forbidden = ['DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE', 'CREATE USER', 'CREATE DATABASE', 'CREATE SCHEMA'];
    const upperSQL = sql.toUpperCase().trim();
    if (forbidden.some(word => upperSQL.includes(word))) {
      throw new Error('This operation is not permitted in the sandbox.');
    }

    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');

      // Set search_path to the assignment's isolated schema
      // Students write "SELECT * FROM employees" and it resolves to the right schema
      await client.query(`SET LOCAL search_path TO ${pgSchema}, public;`);

      const result = await client.query(sql);

      // ROLLBACK: learning platform — don't let writes persist
      await client.query('ROLLBACK');

      return {
        rows:     result.rows,
        rowCount: result.rowCount,
        fields:   result.fields?.map(f => f.name) || [],
      };
    } catch (error) {
      await client.query('ROLLBACK').catch(() => {});
      throw error;
    } finally {
      client.release();
    }
  }
}

export default new QueryService();
