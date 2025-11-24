import express, { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './shared/middleware/errorHandler';
import authRoutes from './modules/auth/routes';
import userRoutes from './modules/users/routes';

const app: Express = express();

app.use(helmet());
app.use(cors());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req, res) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(),
        service: 'user-service'
    });
});

app.use('/auth', authRoutes);
app.use('/users', userRoutes);

app.use((_req, res) => {
    res.status(404).json({ error: 'Route not found!' });
});

app.use(errorHandler);

export default app;