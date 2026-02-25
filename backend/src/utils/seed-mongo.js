import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assignment from '../models/Assignment.js';

dotenv.config();

const ASSIGNMENTS = [
  {
    title: 'Basic Select Queries',
    description: 'Learn the fundamentals of SQL by retrieving data from a simple employees table.',
    difficulty: 'Easy',
    timeEstimate: '10 min',
    question: "Write a query to retrieve the name, role, and salary for all employees in the 'Engineering' department.",
    schema: {
      employees: [
        { name: 'id',         type: 'SERIAL'  },
        { name: 'name',       type: 'VARCHAR' },
        { name: 'role',       type: 'VARCHAR' },
        { name: 'department', type: 'VARCHAR' },
        { name: 'salary',     type: 'DECIMAL' },
      ],
    },
    tables: ['employees'],
  },
  {
    title: 'Aggregate Functions',
    description: 'Master GROUP BY and aggregate functions to perform data analysis.',
    difficulty: 'Medium',
    timeEstimate: '20 min',
    question: 'Find the total salary expenditure for each department. Return the department name and the sum of salaries.',
    schema: {
      employees: [
        { name: 'id',         type: 'SERIAL'  },
        { name: 'name',       type: 'VARCHAR' },
        { name: 'role',       type: 'VARCHAR' },
        { name: 'department', type: 'VARCHAR' },
        { name: 'salary',     type: 'DECIMAL' },
      ],
    },
    tables: ['employees'],
  },
  {
    title: 'Complex Joins',
    description: 'Learn how to combine data from multiple tables using JOINs.',
    difficulty: 'Hard',
    timeEstimate: '35 min',
    question: 'Find all orders placed by Premium members. Return the member name, order amount, and order date.',
    schema: {
      users: [
        { name: 'id',              type: 'SERIAL'  },
        { name: 'name',            type: 'VARCHAR' },
        { name: 'membership_type', type: 'VARCHAR' },
      ],
      orders: [
        { name: 'id',         type: 'SERIAL'  },
        { name: 'user_id',    type: 'INTEGER' },
        { name: 'amount',     type: 'DECIMAL' },
        { name: 'order_date', type: 'DATE'    },
      ],
    },
    tables: ['users', 'orders'],
  },
];

const seed = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('✅ Connected to MongoDB Atlas');

    await Assignment.deleteMany({});
    console.log('🗑️  Cleared existing assignments');

    const inserted = await Assignment.insertMany(ASSIGNMENTS);
    console.log(`✅ Seeded ${inserted.length} assignments into MongoDB`);
    inserted.forEach(a => console.log(`   • [${a._id}] ${a.title}`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected from MongoDB');
    process.exit(0);
  }
};

seed();
