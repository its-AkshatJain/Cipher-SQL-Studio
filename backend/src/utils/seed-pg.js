import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// ── Per-assignment schema definitions ─────────────────────────────────────────
// Each assignment gets its own isolated PostgreSQL schema with its own table data.
// This prevents data conflicts between assignments that use the same table names.
const SCHEMAS = [
  {
    name: 'asgn_high_salary',
    setup: async (client) => {
      await client.query(`
        CREATE TABLE asgn_high_salary.employees (
          id         SERIAL PRIMARY KEY,
          name       TEXT    NOT NULL,
          salary     INTEGER NOT NULL,
          department TEXT    NOT NULL
        );
        INSERT INTO asgn_high_salary.employees (id, name, salary, department) VALUES
          (1, 'Alice',   45000, 'HR'),
          (2, 'Bob',     60000, 'Engineering'),
          (3, 'Charlie', 75000, 'Engineering'),
          (4, 'Diana',   48000, 'Sales');
      `);
    },
  },
  {
    name: 'asgn_dept_count',
    setup: async (client) => {
      await client.query(`
        CREATE TABLE asgn_dept_count.employees (
          id         SERIAL PRIMARY KEY,
          name       TEXT NOT NULL,
          department TEXT NOT NULL
        );
        INSERT INTO asgn_dept_count.employees (id, name, department) VALUES
          (1, 'Alice',   'HR'),
          (2, 'Bob',     'Engineering'),
          (3, 'Charlie', 'Engineering'),
          (4, 'Diana',   'Sales'),
          (5, 'Eve',     'Sales');
      `);
    },
  },
  {
    name: 'asgn_order_value',
    setup: async (client) => {
      await client.query(`
        CREATE TABLE asgn_order_value.customers (
          id   SERIAL PRIMARY KEY,
          name TEXT NOT NULL
        );
        CREATE TABLE asgn_order_value.orders (
          id          SERIAL PRIMARY KEY,
          customer_id INTEGER REFERENCES asgn_order_value.customers(id),
          amount      REAL NOT NULL
        );
        INSERT INTO asgn_order_value.customers (id, name) VALUES
          (1, 'Aman'),
          (2, 'Saurabh');
        INSERT INTO asgn_order_value.orders (id, customer_id, amount) VALUES
          (1, 1, 1200.5),
          (2, 1, 800.0),
          (3, 2, 1500.0);
      `);
    },
  },
  {
    name: 'asgn_highest_paid',
    setup: async (client) => {
      await client.query(`
        CREATE TABLE asgn_highest_paid.employees (
          id     SERIAL PRIMARY KEY,
          name   TEXT    NOT NULL,
          salary INTEGER NOT NULL
        );
        INSERT INTO asgn_highest_paid.employees (id, name, salary) VALUES
          (1, 'Alice',   70000),
          (2, 'Bob',     85000),
          (3, 'Charlie', 85000);
      `);
    },
  },
];

const seedData = async () => {
  const client = new Client(
    process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.PG_HOST,
          port: parseInt(process.env.PG_PORT),
          user: process.env.PG_USER,
          password: process.env.PG_PASSWORD,
          database: process.env.PG_DATABASE,
        }
  );

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL\n');

    // Drop all existing assignment schemas
    for (const schema of SCHEMAS) {
      await client.query(`DROP SCHEMA IF EXISTS ${schema.name} CASCADE;`);
      console.log(`🗑️  Dropped schema: ${schema.name}`);
    }

    // Re-create each schema with its isolated data
    for (const schema of SCHEMAS) {
      await client.query(`CREATE SCHEMA ${schema.name};`);
      await schema.setup(client);
      console.log(`✅ Created schema: ${schema.name}`);
    }

    console.log('\n🎉 PostgreSQL sandbox seeded successfully!');
    console.log('   Each assignment now has its own isolated schema.');
  } catch (err) {
    console.error('❌ PG Seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
};

seedData();
