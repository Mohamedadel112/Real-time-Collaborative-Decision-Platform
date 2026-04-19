import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { DecisionsRepository } from '../decisions/decisions.repository';
import { RoomsGateway } from '../rooms/rooms.gateway';
import { DecisionStatus } from '@prisma/client';

// Confidence thresholds as per PRD
const CONFIDENCE_VALID = 0.7;
const CONFIDENCE_WEAK = 0.5;

@Injectable()
export class DecisionEngineService {
  private readonly logger = new Logger(DecisionEngineService.name);

  constructor(
    private readonly decisionRepo: DecisionsRepository,
    private readonly roomsGateway: RoomsGateway,
  ) {}

  @OnEvent('vote.cast', { async: true })
  async handleVoteCast(payload: {
    decisionId: string;
    vote: any;
    weight: number;
    roomId: string;
  }) {
    const { decisionId, roomId } = payload;

    try {
      // Fetch fresh decision with option weights
      const decision = await this.decisionRepo.findById(decisionId);
      if (!decision || decision.status !== DecisionStatus.OPEN) return;

      // Recalculate confidence score
      const result = this.calculateResult(decision);

      // Broadcast live update to the room
      this.roomsGateway.broadcastToRoom(roomId, 'decision:updated', {
        decisionId,
        options: result.options,
        leading: result.leading,
        confidence: result.confidence,
        status: result.status,
        totalWeight: result.totalWeight,
      });

      this.logger.debug(
        `Decision ${decisionId} updated – leading: ${result.leading?.label} (${result.confidence.toFixed(2)}% confidence)`,
      );
    } catch (err) {
      this.logger.error('Error handling vote.cast event', err);
    }
  }

  /**
   * Core algorithm:
   * confidence = winning_weight / total_weight
   *   > 70% → Valid
   *   50–70% → Weak
   *   < 50%  → Invalid
   */
  calculateResult(decision: any) {
    const options = decision.options as Array<{
      id: string;
      label: string;
      totalWeight: number;
    }>;
    const totalWeight = options.reduce((sum, o) => sum + o.totalWeight, 0);

    const sorted = [...options].sort((a, b) => b.totalWeight - a.totalWeight);
    const leading = sorted[0];

    let confidence = 0;
    let status: 'valid' | 'weak' | 'invalid' = 'invalid';

    if (totalWeight > 0) {
      confidence = leading.totalWeight / totalWeight;
      if (confidence >= CONFIDENCE_VALID) status = 'valid';
      else if (confidence >= CONFIDENCE_WEAK) status = 'weak';
      else status = 'invalid';
    }

    return {
      options: sorted.map((o) => ({
        id: o.id,
        label: o.label,
        weight: o.totalWeight,
        percentage: totalWeight > 0 ? (o.totalWeight / totalWeight) * 100 : 0,
      })),
      leading,
      confidence,
      status,
      totalWeight,
    };
  }
}
