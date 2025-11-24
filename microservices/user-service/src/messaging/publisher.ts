import { getChannel } from './connection';
import { logger } from '../shared/utils/logger';

export const publishUserEnrolled = async (data: {userId: string; eventId: string; enrolled: boolean}) => {
    try {
        const channel = getChannel();
        if (!channel) {
            logger.error('RabbitMQ channel not available!');
            return;
        }

        const exchange = 'user_events';
        const routingKey = 'user.enrolled';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        
        const message = JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
        });

        channel.publish(exchange, routingKey, Buffer.from(message), {
            persistent: true,
        });

        logger.info(`Published user.enrolled event: ${message}`);
    } catch (error) {
        logger.error('Error publishing user.enrolled event:', error);
    }
};

export const publishUserSessionAttended = async (data: {
    userId: string;
    sessionId: string;
    eventId: string;
    attended: boolean;
}) => {
    try {
        const channel = getChannel();
        if (!channel) {
            logger.error('RabbitMQ channel not available!');
            return;
        }

        const exchange = 'user_events';
        const routingKey = 'user.session.attended';

        await channel.assertExchange(exchange, 'topic', { durable: true });
        
        const message = JSON.stringify({
            ...data,
            timestamp: new Date().toISOString(),
        });

        channel.publish(exchange, routingKey, Buffer.from(message), {
            persistent: true,
        });

        logger.info(`Published user.session.attended event: ${message}`);
    } catch (error) {
        logger.error('Error publishing user.session.attended event:', error);
    }
};