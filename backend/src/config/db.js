import mongoose from 'mongoose';
import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';

dotenv.config();

// MongoDB Connection
const connectMongoDB = async () => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI);
    console.log(`MongoDB Connected: ${conn.connection.host}`);
  } catch (error) {
    console.error(`MongoDB Connection Error: ${error.message}`);
    // Non-blocking in dev if URI not provided
    if (process.env.NODE_ENV === 'production') process.exit(1);
  }
};

// PostgreSQL (Sandbox) Connection Pool
const pgConfig = process.env.DATABASE_URL 
  ? { connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } }
  : {
      host: process.env.PG_HOST,
      port: process.env.PG_PORT,
      user: process.env.PG_USER,
      password: process.env.PG_PASSWORD,
      database: process.env.PG_DATABASE,
    };

const pgPool = new Pool(pgConfig);

pgPool.on('error', (err) => {
  console.error('Unexpected error on idle pg client', err);
});

export { connectMongoDB, pgPool };
