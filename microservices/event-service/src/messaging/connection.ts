import amqp from 'amqplib';
import { logger } from '../shared/utils/logger';

let connection: any = null;
let channel: any = null;
const RABBITMQ_URL = process.env.RABBITMQ_URL || 'amqp://localhost:5672';

export const connectRabbitMQ = async (): Promise<void> => {
    try {
        connection = await amqp.connect(RABBITMQ_URL);
        channel = await connection.createChannel();
        
        logger.info('RabbitMQ connected.');
    } catch (error) {
        logger.error('Failed to connect to RabbitMQ:', error);
        setTimeout(connectRabbitMQ, 5000);
    }
};

export const getChannel = (): any => channel;