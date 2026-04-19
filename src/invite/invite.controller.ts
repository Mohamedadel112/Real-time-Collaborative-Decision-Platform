import {
  Controller,
  Post,
  Get,
  Body,
  Req,
  UseGuards,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { JwtService } from '@nestjs/jwt';
import { InviteService } from './invite.service';
import { CreateInviteDto } from './dto/create-invite.dto';
import { AcceptInviteDto } from './dto/accept-invite.dto';

@Controller('admin/invite')
export class InviteController {
  constructor(
    private readonly inviteService: InviteService,
    private readonly jwtService: JwtService,
  ) {}

  @Post()
  @UseGuards(AuthGuard('jwt'))
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
  @UseGuards(AuthGuard('jwt'))
  async getInvites(@Req() req: any) {
    const admin = req.user;
    if (admin.role !== 'ADMIN') {
      throw new UnauthorizedException('Only admins can view invite history.');
    }
    return this.inviteService.getInvitesByAdmin(admin.userId || admin.id);
  }

  /**
   * Public endpoint — no JWT guard needed.
   * Called by the invited user when they click the link in the email.
   */
  @Post('accept')
  async acceptInvite(@Body() dto: AcceptInviteDto) {
    const user = await this.inviteService.acceptInvite(dto.token, {
      username: dto.username,
      password: dto.password,
    });

    // Auto-login: issue a JWT token for the new user
    const payload = { sub: user.id, email: user.email, role: user.role };
    const accessToken = this.jwtService.sign(payload);

    return {
      access_token: accessToken,
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        role: user.role,
        reputationScore: user.reputationScore,
      },
    };
  }
}
