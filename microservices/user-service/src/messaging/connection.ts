import amqp from 'amqplib';
import { logger } from '../shared/utils/logger';

let connection: any = null;
let channel: any = null;

const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

export const connectRabbitMQ = async (): Promise<void> => {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();

        logger.info('RabbitMQ connection established');
    } catch (error) {
        logger.error('Failed to connect to RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000);
    }
};

export const getChannel = (): any => {
    return channel;
};

export const closeRabbitMQ = async (): Promise<void> => {
    try {
        if (channel) await channel.close();
        if (connection) await connection.close();
        
        logger.info('RabbitMQ connection closed.');
    } catch (error) {
        logger.error('Error closing RabbitMQ connection:', error);
    }
};