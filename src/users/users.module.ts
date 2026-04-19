import { Module } from '@nestjs/common';
import { UsersController } from './users.controller';
import { UsersService } from './users.service';
import { UsersRepository } from './users.repository';
import { ExpertObserver } from './expert.observer';

@Module({
  controllers: [UsersController],
  providers: [UsersService, UsersRepository, ExpertObserver],
  exports: [UsersService, UsersRepository],
})
export class UsersModule {}
