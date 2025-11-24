import { getChannel } from './connection';
import { logger } from '../shared/utils/logger';

export const startConsumer = async () => {
    try {
        const channel = getChannel();
        if (!channel) return;

        const exchange = 'user_events';
        await channel.assertExchange(exchange, 'topic', { durable: true });

        const q = await channel.assertQueue('', { exclusive: true });
        await channel.bindQueue(q.queue, exchange, 'user.enrolled');

        channel.consume(q.queue, (msg: any) => {
            if (msg) {
                const data = JSON.parse(msg.content.toString());
                logger.info(`Received user.enrolled: ${JSON.stringify(data)}`);
                channel.ack(msg);
            }
        });

        logger.info('Event consumer started');
    } catch (error) {
        logger.error('Consumer error:', error);
    }
};