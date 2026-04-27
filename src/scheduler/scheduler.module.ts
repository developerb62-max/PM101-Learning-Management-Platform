import { Module } from '@nestjs/common';
import { OutboxTask } from './tasks/outbox.task';
import { AuthModule } from 'src/module/auth/auth.module';
import { MailModule } from 'src/shared/mail/mail.module';

@Module({
  providers: [OutboxTask],
  imports: [AuthModule, MailModule],
})
export class SchedulerModule {}
