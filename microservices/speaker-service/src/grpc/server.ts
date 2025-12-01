import * as grpc from '@grpc/grpc-js';
import * as protoLoader from '@grpc/proto-loader';
import path from 'path';
import { getSpeakerById } from '../modules/speakers/service';
import { logger } from '../shared/utils/logger';

const PROTO_PATH = path.join(__dirname, '../../proto/speaker.proto');
const packageDefinition = protoLoader.loadSync(PROTO_PATH, {});
const speakerProto: any = grpc.loadPackageDefinition(packageDefinition).speaker;

export const startGrpcServer = async () => {
    const server = new grpc.Server();
    server.addService(speakerProto.SpeakerService.service, {
        ValidateSpeaker: async (call: any, callback: any) => {
            try {
                const speaker = await getSpeakerById(call.request.speakerId);
                callback(null, { exists: !!speaker, message: speaker ? 'Speaker already exists.' : 'Speaker not found!' });
            } catch (error) {
                callback(error);
            }
        },
    });

    const PORT = process.env.GRPC_PORT || 50052;
    
    server.bindAsync(`0.0.0.0:${PORT}`, grpc.ServerCredentials.createInsecure(), (err: any, port: any) => {
        if (err) { 
            logger.error('gRPC server error:', err); 
            return; 
        }
        
        logger.info(`gRPC server running on port ${port}`);
    });
};