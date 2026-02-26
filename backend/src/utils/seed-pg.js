import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const seedData = async () => {
  const client = new Client(
    process.env.DATABASE_URL
      ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
      : {
          host: process.env.PG_HOST,
          port: process.env.PG_PORT,
          user: process.env.PG_USER,
          password: process.env.PG_PASSWORD,
          database: process.env.PG_DATABASE,
        }
  );

  try {
    await client.connect();
    console.log('✅ Connected to PostgreSQL');

    // ── Drop & recreate tables cleanly ───────────────────────────────────────
    await client.query(`
      DROP TABLE IF EXISTS orders CASCADE;
      DROP TABLE IF EXISTS customers CASCADE;
      DROP TABLE IF EXISTS employees CASCADE;
    `);
    console.log('🗑️  Dropped existing tables');

    // ── employees ─────────────────────────────────────────────────────────────
    // Used by: Find High Salary Employees, Department Count, Highest Paid
    await client.query(`
      CREATE TABLE employees (
        id         SERIAL PRIMARY KEY,
        name       TEXT    NOT NULL,
        salary     INTEGER,
        department TEXT
      );
    `);

    await client.query(`
      INSERT INTO employees (id, name, salary, department) VALUES
        (1, 'Alice',   45000, 'HR'),
        (2, 'Bob',     60000, 'Engineering'),
        (3, 'Charlie', 75000, 'Engineering'),
        (4, 'Diana',   48000, 'Sales'),
        (5, 'Eve',     55000, 'Sales');
    `);
    console.log('✅ employees seeded (5 rows)');

    // ── customers ─────────────────────────────────────────────────────────────
    // Used by: Total Order Value per Customer
    await client.query(`
      CREATE TABLE customers (
        id   SERIAL PRIMARY KEY,
        name TEXT NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO customers (id, name) VALUES
        (1, 'Aman'),
        (2, 'Saurabh');
    `);
    console.log('✅ customers seeded (2 rows)');

    // ── orders ────────────────────────────────────────────────────────────────
    await client.query(`
      CREATE TABLE orders (
        id          SERIAL PRIMARY KEY,
        customer_id INTEGER REFERENCES customers(id),
        amount      REAL    NOT NULL
      );
    `);

    await client.query(`
      INSERT INTO orders (id, customer_id, amount) VALUES
        (1, 1, 1200.5),
        (2, 1, 800.0),
        (3, 2, 1500.0);
    `);
    console.log('✅ orders seeded (3 rows)');

    console.log('\n🎉 PostgreSQL sandbox seeded successfully!');
  } catch (err) {
    console.error('❌ PG Seed failed:', err.message);
    process.exit(1);
  } finally {
    await client.end();
    process.exit(0);
  }
};

seedData();
