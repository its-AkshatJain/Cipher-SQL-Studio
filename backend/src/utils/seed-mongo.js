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
    sampleTables: [
      {
        tableName: 'employees',
        columns: [
          { columnName: 'id',         dataType: 'INTEGER' },
          { columnName: 'name',       dataType: 'TEXT'    },
          { columnName: 'role',       dataType: 'TEXT'    },
          { columnName: 'department', dataType: 'TEXT'    },
          { columnName: 'salary',     dataType: 'REAL'    },
        ],
        rows: [
          { id: 1, name: 'Alice Johnson', role: 'Developer', department: 'Engineering', salary: 85000 },
          { id: 2, name: 'Bob Smith',     role: 'Designer',  department: 'Creative',    salary: 75000 },
          { id: 3, name: 'Charlie Brown', role: 'Developer', department: 'Engineering', salary: 90000 },
          { id: 4, name: 'Diana Prince',  role: 'Manager',   department: 'Product',     salary: 110000 },
          { id: 5, name: 'Evan Wright',   role: 'Analyst',   department: 'Data',        salary: 65000 },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { name: 'Alice Johnson', role: 'Developer', salary: 85000 },
        { name: 'Charlie Brown', role: 'Developer', salary: 90000 },
      ],
    },
  },

  {
    title: 'Aggregate Functions',
    description: 'Master GROUP BY and aggregate functions to perform data analysis.',
    difficulty: 'Medium',
    timeEstimate: '20 min',
    question: 'Find the total salary expenditure for each department. Return the department name and the sum of salaries, ordered by total salary descending.',
    sampleTables: [
      {
        tableName: 'employees',
        columns: [
          { columnName: 'id',         dataType: 'INTEGER' },
          { columnName: 'name',       dataType: 'TEXT'    },
          { columnName: 'role',       dataType: 'TEXT'    },
          { columnName: 'department', dataType: 'TEXT'    },
          { columnName: 'salary',     dataType: 'REAL'    },
        ],
        rows: [
          { id: 1, name: 'Alice Johnson', role: 'Developer', department: 'Engineering', salary: 85000 },
          { id: 2, name: 'Bob Smith',     role: 'Designer',  department: 'Creative',    salary: 75000 },
          { id: 3, name: 'Charlie Brown', role: 'Developer', department: 'Engineering', salary: 90000 },
          { id: 4, name: 'Diana Prince',  role: 'Manager',   department: 'Product',     salary: 110000 },
          { id: 5, name: 'Evan Wright',   role: 'Analyst',   department: 'Data',        salary: 65000 },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { department: 'Product',     total_salary: 110000 },
        { department: 'Engineering', total_salary: 175000 },
        { department: 'Creative',    total_salary: 75000  },
        { department: 'Data',        total_salary: 65000  },
      ],
    },
  },

  {
    title: 'Complex Joins',
    description: 'Learn how to combine data from multiple tables using JOINs.',
    difficulty: 'Hard',
    timeEstimate: '35 min',
    question: 'Find all orders placed by Premium members. Return the member name, order amount, and order date.',
    sampleTables: [
      {
        tableName: 'users',
        columns: [
          { columnName: 'id',              dataType: 'INTEGER' },
          { columnName: 'name',            dataType: 'TEXT'    },
          { columnName: 'membership_type', dataType: 'TEXT'    },
        ],
        rows: [
          { id: 1, name: 'Akshat Jain', membership_type: 'Premium'  },
          { id: 2, name: 'Jane Doe',    membership_type: 'Standard' },
          { id: 3, name: 'John Wick',   membership_type: 'Premium'  },
        ],
      },
      {
        tableName: 'orders',
        columns: [
          { columnName: 'id',         dataType: 'INTEGER' },
          { columnName: 'user_id',    dataType: 'INTEGER' },
          { columnName: 'amount',     dataType: 'REAL'    },
          { columnName: 'order_date', dataType: 'DATE'    },
        ],
        rows: [
          { id: 1, user_id: 1, amount: 150.00,  order_date: '2024-02-01' },
          { id: 2, user_id: 1, amount: 250.00,  order_date: '2024-02-15' },
          { id: 3, user_id: 2, amount: 45.00,   order_date: '2024-02-20' },
          { id: 4, user_id: 3, amount: 1200.00, order_date: '2024-02-25' },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { name: 'Akshat Jain', amount: 150.00,  order_date: '2024-02-01' },
        { name: 'Akshat Jain', amount: 250.00,  order_date: '2024-02-15' },
        { name: 'John Wick',   amount: 1200.00, order_date: '2024-02-25' },
      ],
    },
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
    inserted.forEach(a => console.log(`   • [${a._id}] ${a.title} (${a.difficulty})`));
  } catch (err) {
    console.error('❌ Seed failed:', err.message);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    process.exit(0);
  }
};

seed();
