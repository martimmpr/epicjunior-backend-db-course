import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './shared/middleware/errorHandler';

// Import routes from all modules
import authRoutes from './modules/auth/routes.js';
import userRoutes from './modules/users/routes.js';
import eventRoutes from './modules/events/routes.js';
import sessionRoutes from './modules/sessions/routes.js';
import speakerRoutes from './modules/speakers/routes.js';

const app: Express = express();

// Security middleware
app.use(helmet());
app.use(cors());

// Body parsing middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'monolith-backend'
    });
});

// API Routes - all in one application
app.use('/auth', authRoutes);
app.use('/users', userRoutes);
app.use('/events', eventRoutes);
app.use('/sessions', sessionRoutes);
app.use('/speakers', speakerRoutes);

// 404 handler
app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found!' });
});

// Global error handling middleware (must be last)
app.use(errorHandler);

export default app;