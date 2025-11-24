import { getChannel } from './connection';
import { logger } from '../shared/utils/logger';

export const publishEventCreated = async (data: any) => {
    try {
        const channel = getChannel();
        if (!channel) return;

        const exchange = 'event_events';
        await channel.assertExchange(exchange, 'topic', { durable: true });
        channel.publish(exchange, 'event.created', Buffer.from(JSON.stringify({ ...data, timestamp: new Date().toISOString() })), { persistent: true });

        logger.info(`Published event.created`);
    } catch (error) {
        logger.error('Error publishing:', error);
    }
};