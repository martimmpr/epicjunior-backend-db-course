import dotenv from 'dotenv';
import app from './app';
import { logger } from './shared/utils/logger';

// Load environment variables
dotenv.config();

const PORT = process.env.PORT || 3000;

// Start server
const server = app.listen(PORT, () => {
    logger.info(`Monolith server on port ${PORT}`);
    logger.info(`Environment: ${process.env.NODE_ENV || 'development'}`);
    logger.info(`Health check at http://localhost:${PORT}/health`);
});

// Termination signals
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