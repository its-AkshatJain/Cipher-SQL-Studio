import { pgPool } from '../config/db.js';
import Assignment from '../models/Assignment.js';

// Schema name safety regex — only lowercase letters, digits, underscores.
// This format alone cannot inject SQL into SET search_path.
const SAFE_SCHEMA_RE = /^[a-z][a-z0-9_]*$/;

class QueryService {
  constructor() {
    this._allowedSchemas = new Set();
    this._loaded = false;
  }

  /**
   * Load valid pgSchema values dynamically from MongoDB.
   * Called once at server startup. Any new assignment added to MongoDB
   * is automatically valid — no manual code updates needed.
   */
  async loadAllowedSchemas() {
    try {
      const schemas = await Assignment.distinct('pgSchema');
      this._allowedSchemas = new Set(schemas.filter(Boolean));
      this._loaded = true;
      console.log(`✅ QueryService: ${this._allowedSchemas.size} allowed schemas:`, [...this._allowedSchemas]);
    } catch (err) {
      console.warn('⚠️  QueryService: could not load schemas from MongoDB, using regex-only validation.', err.message);
    }
  }

  _validateSchema(pgSchema) {
    // 1. Format check — rejects anything with special characters (prevents SQL injection)
    if (!pgSchema || !SAFE_SCHEMA_RE.test(pgSchema)) {
      throw new Error(`Invalid schema name: "${pgSchema}".`);
    }
    // 2. Existence check — only schemas that exist in MongoDB are allowed
    if (this._loaded && !this._allowedSchemas.has(pgSchema)) {
      throw new Error(`Schema "${pgSchema}" is not registered to any assignment.`);
    }
  }

  async executeQuery(sql, pgSchema = 'public') {
    this._validateSchema(pgSchema);

    const forbidden = ['DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE', 'CREATE USER', 'CREATE DATABASE', 'CREATE SCHEMA'];
    if (forbidden.some(w => sql.toUpperCase().trim().includes(w))) {
      throw new Error('This operation is not permitted in the sandbox.');
    }

    const client = await pgPool.connect();
    try {
      await client.query('BEGIN');
      await client.query(`SET LOCAL search_path TO ${pgSchema}, public;`);
      const result = await client.query(sql);
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
