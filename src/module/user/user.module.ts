import { Module } from '@nestjs/common';
import { UserRepository } from './user.repository';
import { DatabaseModule } from '../db/database.module';

@Module({
  providers: [UserRepository],
  imports: [DatabaseModule],
  exports: [UserRepository],
})
export class UserModule {}
