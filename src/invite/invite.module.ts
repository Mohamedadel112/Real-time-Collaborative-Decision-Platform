import { Module } from '@nestjs/common';
import { AuthModule } from '../auth/auth.module';
import { InviteController } from './invite.controller';
import { InviteService } from './invite.service';

@Module({
  imports: [AuthModule], // Need JwtService for token generation in accept flow
  controllers: [InviteController],
  providers: [InviteService],
  exports: [InviteService],
})
export class InviteModule {}
