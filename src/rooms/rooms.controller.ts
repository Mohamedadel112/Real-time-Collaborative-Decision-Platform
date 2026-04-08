import {
  Body, Controller, Delete, Get, Param, Post, UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { RoomsService } from './rooms.service';
import { CreateRoomDto } from './dto/create-room.dto';
import { CurrentUser } from '../common/decorators/current-user.decorator';

@Controller('rooms')
@UseGuards(AuthGuard('jwt'))
export class RoomsController {
  constructor(private readonly roomsService: RoomsService) {}

  @Post()
  create(@CurrentUser() user: any, @Body() dto: CreateRoomDto) {
    return this.roomsService.create(user.id, dto);
  }

  @Get()
  findAll() {
    return this.roomsService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.roomsService.findOne(id);
  }

  @Post(':id/join')
  join(@Param('id') id: string, @CurrentUser() user: any) {
    return this.roomsService.join(id, user.id);
  }

  @Delete(':id/leave')
  leave(@Param('id') id: string, @CurrentUser() user: any) {
    return this.roomsService.leave(id, user.id);
  }

  @Get(':id/presence')
  getPresence(@Param('id') id: string) {
    return this.roomsService.getPresence(id);
  }
}
