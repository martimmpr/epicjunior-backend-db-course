import dotenv from 'dotenv';
import app from './app';
import { logger } from './shared/utils/logger';
import { connectRabbitMQ } from './messaging/connection';

dotenv.config();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, async () => {
    logger.info(`User Service on port ${PORT}`);
    
    try {
        await connectRabbitMQ();
        logger.info('Connected to RabbitMQ');
    } catch (error) {
        logger.error('Failed to connect to RabbitMQ:', error);
    }
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received: closing HTTP server.');
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });
});

process.on('SIGINT', () => {
    logger.info('SIGINT signal received: closing HTTP server.');
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });
});