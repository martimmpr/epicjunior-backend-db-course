import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { getSessionById } from '../modules/sessions/service';
import { logger } from '../shared/utils/logger';

const PROTO_PATH = path.join(__dirname, '../../proto/session.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const sessionProto: any = grpc.loadPackageDefinition(packageDefinition).session;

export const startGrpcServer = async () => {
    const server = new grpc.Server();
    server.addService(sessionProto.SessionService.service, {
        ValidateSession: async (call: any, callback: any) => {
            try {
                const session = await getSessionById(call.request.sessionId);
                callback(null, { exists: !!session, message: session ? 'Session exists' : 'Session not found' });
            } catch (error) {
                callback(error);
            }
        },
    });

    const PORT = process.env.GRPC_PORT || 50051;

    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err: any, port: any) => {
        if (err) { 
            logger.error('gRPC server error:', err); 
            return; 
        }
        
        logger.info(`gRPC server running on port ${port}`);
    });
};