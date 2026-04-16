import {
  WebSocketGateway,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  WebSocketServer,
  OnGatewayInit,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { RedisService } from '../redis/redis.service';
import { WeightService, WeightResult } from '../weight/weight.service';
import { PrismaService } from '../database/prisma.service';
import { EventEmitter2 } from '@nestjs/event-emitter';

@WebSocketGateway({
  cors: {
    origin: '*',
  },
})
export class EventsGateway
  implements OnGatewayInit, OnGatewayConnection, OnGatewayDisconnect
{
  @WebSocketServer()
  server: Server;

  constructor(
    private readonly redisService: RedisService,
    private readonly weightService: WeightService,
    private readonly prisma: PrismaService,
    private readonly eventEmitter: EventEmitter2,
  ) {}

  afterInit(server: Server) {
    // Subscribe to Redis updates
    this.redisService.subscribe('room-updates', (message: any) => {
      // Message shape: { roomId: string, ...data }
      if (message.roomId) {
        this.server.to(message.roomId).emit('receiveUpdate', message);
      }
    });
  }

  handleConnection(client: Socket) {
    // Basic connection handling
  }

  handleDisconnect(client: Socket) {
    // Cleanup if needed
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(
    @MessageBody() data: { roomId: string },
    @ConnectedSocket() client: Socket,
  ) {
    client.join(data.roomId);
    return { event: 'joined', data: { roomId: data.roomId } };
  }

  @SubscribeMessage('vote')
  async handleVote(
    @MessageBody()
    data: { userId: string; decisionId: string; optionId: string },
    @ConnectedSocket() client: Socket,
  ) {
    try {
      // 1. Distributed lock to prevent double voting race conditions
      const lockKey = `lock:vote:${data.userId}:${data.decisionId}`;
      // Basic lock: set nx ex (Not perfect redlock, but good enough for single node redis)
      const lockAcquired = await this.redisService.client.set(
        lockKey,
        'locked',
        'EX',
        10,
        'NX',
      );
      if (!lockAcquired) {
        return { event: 'error', data: { message: 'Vote already processing' } };
      }

      // Check for existing vote
      const existingVote = await this.prisma.vote.findUnique({
        where: {
          decisionId_userId: {
            decisionId: data.decisionId,
            userId: data.userId,
          },
        },
      });

      if (existingVote) {
        await this.redisService.client.del(lockKey);
        return {
          event: 'error',
          data: { message: 'User already voted on this decision' },
        };
      }

      // 2. Fetch User and Decision
      const user = await this.prisma.user.findUnique({
        where: { id: data.userId },
        include: { skills: true },
      });
      const decision = await this.prisma.decision.findUnique({
        where: { id: data.decisionId },
      });

      if (!user || !decision) {
        await this.redisService.client.del(lockKey);
        return {
          event: 'error',
          data: { message: 'Invalid user or decision' },
        };
      }

      // 3. Calculate Weight
      const weightResult: WeightResult = this.weightService.calculateUserWeight(
        user,
        decision,
      );

      // 4. Store Vote
      const vote = await this.prisma.$transaction(async (tx) => {
        const newVote = await tx.vote.create({
          data: {
            userId: user.id,
            decisionId: decision.id,
            optionId: data.optionId,
            weight: weightResult.weight,
            validation: 'PENDING',
          },
        });

        await tx.decisionOption.update({
          where: { id: data.optionId },
          data: {
            totalWeight: { increment: weightResult.weight },
            votesCount: { increment: 1 },
          },
        });

        return newVote;
      });

      // 5. Update user votes count and trigger observer
      await this.prisma.user.update({
        where: { id: user.id },
        data: { votesCount: { increment: 1 } },
      });
      this.eventEmitter.emit('user.score.updated', user.id);

      // 6. Publish via Redis Pub/Sub
      const broadcastData = {
        roomId: decision.roomId,
        type: 'NEW_VOTE',
        decisionId: decision.id,
        optionId: data.optionId,
        weight: weightResult.weight,
        explanation: weightResult.explanation,
      };

      await this.redisService.publish('room-updates', broadcastData);

      // Release lock
      await this.redisService.client.del(lockKey);

      // Return weight explanation to the specific voter
      return { event: 'voteConfirmed', data: weightResult };
    } catch (error) {
      console.error(error);
      return { event: 'error', data: { message: 'Failed to process vote' } };
    }
  }
}
