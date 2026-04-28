import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { DatabaseModule } from '../db/database.module';
import { TokenRepository } from './repository/token.repository';
import { OutboxRepository } from './repository/outbox.repository';

@Module({
  providers: [AuthService, TokenRepository, OutboxRepository],
  controllers: [AuthController],
  imports: [UserModule, DatabaseModule],
  exports: [OutboxRepository],
})
export class AuthModule {}
