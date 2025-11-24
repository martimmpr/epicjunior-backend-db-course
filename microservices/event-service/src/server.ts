import dotenv from 'dotenv';
import app from './app';
import { logger } from './shared/utils/logger';
import { connectRabbitMQ } from './messaging/connection';
import { startConsumer } from './messaging/consumer';

dotenv.config();

const PORT = process.env.PORT || 3002;

const server = app.listen(PORT, async () => {
    logger.info(`Event Service on port ${PORT}`);
    
    try {
        await connectRabbitMQ();
        await startConsumer();
        logger.info('Connected to RabbitMQ and started consumer.');
    } catch (error) {
        logger.error('Failed to connect to RabbitMQ:', error);
    }
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received.');
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });
});