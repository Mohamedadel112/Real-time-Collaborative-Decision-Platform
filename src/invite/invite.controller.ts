import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';

@Controller('admin/invite')
export class InviteController {
  constructor(private readonly inviteService: InviteService) {}

  @Post()
  async createInvite(
    @Req() req: any,
    @Body() createInviteDto: CreateInviteDto,
  ) {
    const admin = req.user;
    if (admin.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can create invites.');
    }
    return this.inviteService.createInvite(
      admin.userId || admin.id,
      createInviteDto.email,
    );
  }

  @Get('history')
  async getInvites(@Req() req: any) {
    const admin = req.user;
    if (admin.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can view invite history.');
    }
    return this.inviteService.getInvitesByAdmin(admin.userId || admin.id);
  }
}
