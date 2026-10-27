import express from 'express';
import cors from 'cors';
import promptRoutes from './routes/promptRoutes';
import healthRoutes from './routes/healthRoutes';
import { errorHandler, notFoundHandler } from './middleware/errorHandler';

export const createApp = () => {
  const app = express();

  // CORS configuration
  const allowedOrigins = (process.env.FRONTEND_ORIGIN || 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.use(
    cors({
      origin: (origin, callback) => {
        // Allow requests with no origin (like mobile apps, curl, or Postman)
        if (!origin) return callback(null, true);
        if (
          allowedOrigins.includes(origin) ||
          allowedOrigins.includes('*') ||
          process.env.NODE_ENV !== 'production'
        ) {
          return callback(null, true);
        }
        return callback(new Error(`CORS policy does not allow access from ${origin}`));
      },
      credentials: true,
      methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization'],
    })
  );

  // Body parser
  app.use(express.json({ limit: '2mb' }));
  app.use(express.urlencoded({ extended: true }));

  // Routes
  app.use('/api/health', healthRoutes);
  app.use('/api/prompts', promptRoutes);

  // 404 & Centralized Error Handler
  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
};
