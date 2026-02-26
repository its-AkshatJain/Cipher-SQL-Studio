import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Assignment from '../models/Assignment.js';

dotenv.config();

// ── Assignments provided by DB Admin ─────────────────────────────────────────
const ASSIGNMENTS = [
  {
    title: 'Find High Salary Employees',
    description: 'Filter rows using a WHERE clause with a numeric condition to find employees above a salary threshold.',
    difficulty: 'Easy',
    timeEstimate: '10 min',
    question: 'List all employees earning more than 50,000.',
    sampleTables: [
      {
        tableName: 'employees',
        columns: [
          { columnName: 'id',         dataType: 'INTEGER' },
          { columnName: 'name',       dataType: 'TEXT'    },
          { columnName: 'salary',     dataType: 'INTEGER' },
          { columnName: 'department', dataType: 'TEXT'    },
        ],
        rows: [
          { id: 1, name: 'Alice',   salary: 45000, department: 'HR'          },
          { id: 2, name: 'Bob',     salary: 60000, department: 'Engineering' },
          { id: 3, name: 'Charlie', salary: 75000, department: 'Engineering' },
          { id: 4, name: 'Diana',   salary: 48000, department: 'Sales'       },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { id: 2, name: 'Bob',     salary: 60000, department: 'Engineering' },
        { id: 3, name: 'Charlie', salary: 75000, department: 'Engineering' },
      ],
    },
  },

  {
    title: 'Department-wise Employee Count',
    description: 'Use GROUP BY with COUNT() to aggregate employee data by department.',
    difficulty: 'Medium',
    timeEstimate: '20 min',
    question: 'Find the number of employees in each department.',
    sampleTables: [
      {
        tableName: 'employees',
        columns: [
          { columnName: 'id',         dataType: 'INTEGER' },
          { columnName: 'name',       dataType: 'TEXT'    },
          { columnName: 'department', dataType: 'TEXT'    },
        ],
        rows: [
          { id: 1, name: 'Alice',   department: 'HR'          },
          { id: 2, name: 'Bob',     department: 'Engineering' },
          { id: 3, name: 'Charlie', department: 'Engineering' },
          { id: 4, name: 'Diana',   department: 'Sales'       },
          { id: 5, name: 'Eve',     department: 'Sales'       },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { department: 'Engineering', count: '2' },
        { department: 'HR',          count: '1' },
        { department: 'Sales',       count: '2' },
      ],
    },
  },

  {
    title: 'Total Order Value per Customer',
    description: 'Join two tables and use SUM() with GROUP BY to aggregate order amounts per customer.',
    difficulty: 'Medium',
    timeEstimate: '25 min',
    question: 'Find total order value for each customer.',
    sampleTables: [
      {
        tableName: 'customers',
        columns: [
          { columnName: 'id',   dataType: 'INTEGER' },
          { columnName: 'name', dataType: 'TEXT'    },
        ],
        rows: [
          { id: 1, name: 'Aman'    },
          { id: 2, name: 'Saurabh' },
        ],
      },
      {
        tableName: 'orders',
        columns: [
          { columnName: 'id',          dataType: 'INTEGER' },
          { columnName: 'customer_id', dataType: 'INTEGER' },
          { columnName: 'amount',      dataType: 'REAL'    },
        ],
        rows: [
          { id: 1, customer_id: 1, amount: 1200.5 },
          { id: 2, customer_id: 1, amount: 800.0  },
          { id: 3, customer_id: 2, amount: 1500.0 },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { name: 'Aman',    total_amount: 2000.5 },
        { name: 'Saurabh', total_amount: 1500.0 },
      ],
    },
  },

  {
    title: 'Highest Paid Employee',
    description: 'Use a subquery or MAX() to find the employee(s) who earn the maximum salary.',
    difficulty: 'Hard',
    timeEstimate: '30 min',
    question: 'Find the employee(s) with the highest salary.',
    sampleTables: [
      {
        tableName: 'employees',
        columns: [
          { columnName: 'id',     dataType: 'INTEGER' },
          { columnName: 'name',   dataType: 'TEXT'    },
          { columnName: 'salary', dataType: 'INTEGER' },
        ],
        rows: [
          { id: 1, name: 'Alice',   salary: 70000 },
          { id: 2, name: 'Bob',     salary: 85000 },
          { id: 3, name: 'Charlie', salary: 85000 },
        ],
      },
    ],
    expectedOutput: {
      type: 'table',
      value: [
        { id: 2, name: 'Bob',     salary: 85000 },
        { id: 3, name: 'Charlie', salary: 85000 },
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
    console.log(`✅ Seeded ${inserted.length} assignments into MongoDB:`);
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
