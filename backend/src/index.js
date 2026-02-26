import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { connectMongoDB } from './config/db.js';
import QueryService from './services/query.service.js';
import queryRoutes from './routes/query.routes.js';
import assignmentRoutes from './routes/assignment.routes.js';
import progressRoutes from './routes/progress.routes.js';

dotenv.config();

const app = express();

// CORS — only allow requests from the frontend origin
const allowedOrigins = [
  process.env.FRONTEND_URL || 'http://localhost:5173',
];

app.use(cors({
  origin: (origin, callback) => {
    // Allow server-to-server or same-origin requests (no origin header)
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error(`CORS blocked: ${origin}`));
    }
  },
  credentials: true,
}));

app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.use('/api/execute', queryRoutes);
app.use('/api/assignments', assignmentRoutes);
app.use('/api/progress', progressRoutes);

// Ping — dead-simple keep-alive (hit this with UptimeRobot every 5 min)
app.get('/api/ping', (req, res) => {
  res.json({ ok: true, ts: Date.now() });
});

// Health Check — shows DB connectivity + uptime
app.get('/health', async (req, res) => {
  const mongoose = (await import('mongoose')).default;
  const mongoState = ['disconnected', 'connected', 'connecting', 'disconnecting'];
  res.status(200).json({
    status:    'ok',
    uptime:    `${Math.floor(process.uptime())}s`,
    timestamp: new Date().toISOString(),
    mongodb:   mongoState[mongoose.connection.readyState] ?? 'unknown',
    env:       process.env.NODE_ENV,
  });
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
  await QueryService.loadAllowedSchemas(); // build schema whitelist from MongoDB
  app.listen(PORT, () => {
    console.log(`🚀 Server running in ${process.env.NODE_ENV} mode on port ${PORT}`);
  });
};

startServer();
