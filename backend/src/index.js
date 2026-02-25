import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB } from './config/db.js';
import queryRoutes from './routes/query.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';

dotenv.config();

const app = express();

// Middleware
app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/execute', queryRoutes);
app.use('/api/assignments', assignmentRoutes);

// Health Check
app.get('/health', (req, res) => {
  res.status(200).json({ status: 'active', timestamp: new Date() });
});

// Error Handler
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    success: false,
    message: err.message || 'Internal Server Error',
  });
});

const PORT = process.env.PORT || 5000;

const startServer = async () => {
  await connectMongoDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
