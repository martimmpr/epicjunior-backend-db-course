import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { errorHandler } from './shared/middleware/errorHandler';
import speakerRoutes from './modules/speakers/routes';

const app = express();

app.use(helmet());
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get('/health', (_req: any, res: any) => {
    res.json({ 
        status: 'ok', 
        timestamp: new Date().toISOString(), 
        service: 'speaker-service' 
    });
});

app.use('/speakers', speakerRoutes);

app.use((_req: any, res: any) => {
    res.status(404).json({ error: 'Route not found!' });
});

app.use(errorHandler);

export default app;