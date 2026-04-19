import {
  Body,
  Controller,
  Get,
  Param,
  Post,
  Patch,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { DecisionsService } from './decisions.service';
import { CreateDecisionDto } from './dto/create-decision.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('rooms/:roomId/decisions')
@UseGuards(AuthGuard('jwt'))
export class DecisionsController {
  constructor(private readonly decisionsService: DecisionsService) {}

  @Post()
  create(@Param('roomId') roomId: string, @Body() dto: CreateDecisionDto) {
    return this.decisionsService.create(roomId, dto);
  }

  @Get()
  findAll(@Param('roomId') roomId: string) {
    return this.decisionsService.findByRoom(roomId);
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.decisionsService.findOne(id);
  }

  @Patch(':id/close')
  close(@Param('id') id: string, @CurrentUser() user: any) {
    return this.decisionsService.close(id, user.id);
  }

  @Patch(':id/validate')
  validate(
    @Param('id') id: string,
    @Body() body: { winningOptionId: string },
    @CurrentUser() user: any,
  ) {
    return this.decisionsService.manualValidate(
      id,
      body.winningOptionId,
      user.id,
    );
  }
}
