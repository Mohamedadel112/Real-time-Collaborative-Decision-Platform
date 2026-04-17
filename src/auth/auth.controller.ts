import {
  Body,
  Controller,
  Post,
  Get,
  Req,
  UseGuards,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  register(@Body() dto: RegisterDto) {
    return this.authService.register(dto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getProfile(@Req() req: any) {
    const user = await this.authService.validateUser(req.user);
    if (!user) return null;
    return {
      id: user.id,
      email: user.email,
      username: user.username,
      role: user.role,
      reputationScore: user.reputationScore,
      accuracyScore: user.accuracyScore,
      votesCount: user.votesCount,
      correctVotes: user.correctVotes,
      isInvitedByAdmin: user.isInvitedByAdmin,
    };
  }
}
