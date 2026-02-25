import pkg from 'pg';
const { Client } = pkg;
import dotenv from 'dotenv';

dotenv.config();

const createTablesAndSeed = async (dbClient) => {
  // Create Sample Table: employees
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS employees (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      role VARCHAR(100),
      department VARCHAR(100),
      salary DECIMAL(10, 2)
    );
  `);

  // Create Sample Table: users
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id SERIAL PRIMARY KEY,
      name VARCHAR(100),
      membership_type VARCHAR(50)
    );
  `);

  // Create Sample Table: orders
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS orders (
      id SERIAL PRIMARY KEY,
      user_id INTEGER REFERENCES users(id),
      amount DECIMAL(10, 2),
      order_date DATE DEFAULT CURRENT_DATE
    );
  `);

  // Insert Sample Data
  await dbClient.query(`
    INSERT INTO employees (name, role, department, salary) VALUES
    ('Alice Johnson', 'Developer', 'Engineering', 85000),
    ('Bob Smith', 'Designer', 'Creative', 75000),
    ('Charlie Brown', 'Developer', 'Engineering', 90000),
    ('Diana Prince', 'Manager', 'Product', 110000),
    ('Evan Wright', 'Analyst', 'Data', 65000)
    ON CONFLICT DO NOTHING;
  `);

  await dbClient.query(`
    INSERT INTO users (name, membership_type) VALUES
    ('Akshat Jain', 'Premium'),
    ('Jane Doe', 'Standard'),
    ('John Wick', 'Premium')
    ON CONFLICT DO NOTHING;
  `);

  await dbClient.query(`
    INSERT INTO orders (user_id, amount, order_date) VALUES
    (1, 150.00, '2024-02-01'),
    (1, 250.00, '2024-02-15'),
    (2, 45.00, '2024-02-20'),
    (3, 1200.00, '2024-02-25')
    ON CONFLICT DO NOTHING;
  `);
};

const seedData = async () => {
  const connectionString = process.env.DATABASE_URL;
  
  if (connectionString) {
    console.log(`Connecting to Postgres via Connection String...`);
    const dbClient = new Client({
      connectionString,
      ssl: { rejectUnauthorized: false }
    });

    try {
      await dbClient.connect();
      console.log('Connected to target database.');
      await createTablesAndSeed(dbClient);
      console.log('✅ PostgreSQL Sandbox seeded successfully!');
      await dbClient.end();
    } catch (error) {
      console.error('❌ Error seeding PostgreSQL:', error.message);
      process.exit(1);
    }
  } else {
    // Local fallback
    const client = new Client({
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: 'postgres',
    });

    try {
      await client.connect();
      console.log('Connected to default postgres database.');
      await client.query(`CREATE DATABASE ${process.env.PG_DATABASE}`).catch(() => {
        console.log(`Database ${process.env.PG_DATABASE} already exists.`);
      });
      await client.end();

      const dbClient = new Client({
        host: process.env.PG_HOST,
        port: process.env.PG_PORT,
        user: process.env.PG_USER,
        password: process.env.PG_PASSWORD,
        database: process.env.PG_DATABASE,
      });
      
      await dbClient.connect();
      console.log('Connected to target database.');
      await createTablesAndSeed(dbClient);
      console.log('✅ PostgreSQL Sandbox seeded successfully!');
      await dbClient.end();
    } catch (error) {
      console.error('❌ Error seeding PostgreSQL:', error.message);
      process.exit(1);
    }
  }
};

seedData();
