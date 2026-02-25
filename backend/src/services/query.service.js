import { pgPool } from '../config/db.js';

class QueryService {
  /**
   * Execute a query in a transaction and roll back to prevent permanent changes to sandbox
   */
  async executeQuery(sql) {
    const client = await pgPool.connect();
    
    try {
      // Basic validation: Prevention of administrative commands
      const forbidden = ['DROP', 'TRUNCATE', 'ALTER', 'GRANT', 'REVOKE', 'CREATE USER', 'CREATE DATABASE'];
      if (forbidden.some(word => sql.toUpperCase().includes(word))) {
        throw new Error('This operation is not permitted in the sandbox.');
      }

      await client.query('BEGIN');
      
      const result = await client.query(sql);
      
      // We ROLLBACK because this is a learning platform and we don't want 
      // users to permanently alter the sample data for others.
      // If we want to allow writes for a specific session, we'd need a per-user schema.
      await client.query('ROLLBACK');
      
      return {
        rows: result.rows,
        rowCount: result.rowCount,
        fields: result.fields?.map(f => f.name) || []
      };
    } catch (error) {
      if (client) await client.query('ROLLBACK');
      throw error;
    } finally {
      client.release();
    }
  }

  async getTableSchema(tableName) {
    const sql = `
      SELECT column_name, data_type 
      FROM information_schema.columns 
      WHERE table_name = $1
      ORDER BY ordinal_position;
    `;
    const result = await pgPool.query(sql, [tableName]);
    return result.rows;
  }
}

export default new QueryService();
