import { Body, Controller, Get, Param, Post, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { VotingService } from './voting.service';
import { CastVoteDto } from './dto/cast-vote.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('decisions/:decisionId/votes')
@UseGuards(AuthGuard('jwt'))
export class VotingController {
  constructor(private readonly votingService: VotingService) {}

  @Post()
  castVote(
    @Param('decisionId') decisionId: string,
    @Body() dto: CastVoteDto,
    @CurrentUser() user: any,
  ) {
    return this.votingService.castVote(decisionId, dto.optionId, user.id);
  }

  @Get()
  getVotes(@Param('decisionId') decisionId: string) {
    return this.votingService.getVotes(decisionId);
  }
}
