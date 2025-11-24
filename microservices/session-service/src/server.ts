import dotenv from 'dotenv';
import app from './app';
import { logger } from './shared/utils/logger';
import { startGrpcServer } from './grpc/server';

dotenv.config();

const PORT = process.env.PORT || 3003;

const server = app.listen(PORT, async () => {
    logger.info(`Session Service on port ${PORT}`);
    
    try {
        await startGrpcServer();
        logger.info('Started gRPC server.');
    } catch (error) {
        logger.error('Failed to start services:', error);
    }
});

process.on('SIGTERM', () => {
    logger.info('SIGTERM signal received.');
    server.close(() => {
        logger.info('HTTP server closed.');
        process.exit(0);
    });
});