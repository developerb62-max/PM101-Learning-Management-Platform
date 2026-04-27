import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { TransactionClient } from 'generated/prisma/internal/prismaNamespace';
import { DatabaseService } from 'src/module/db/database.service';
import { STATUS_OUTBOX } from '../../../../generated/prisma/enums';

@Injectable()
export class OutboxRepository {
  constructor(private prisma: DatabaseService) {}

  create(data: Prisma.OutboxCreateInput, tx?: TransactionClient) {
    const client = tx ?? this.prisma;
    return client.outbox.create({ data });
  }

  findMany() {
    const now = new Date();

    return this.prisma.outbox.findMany({
      where: {
        status: STATUS_OUTBOX.PENDING,
        nextRetryAt: { lte: now },
      },
      take: 10,
      orderBy: {
        created_at: 'asc',
      },
    });
  }

  updateStatus(id: string, data: Partial<Prisma.OutboxCreateInput>) {
    return this.prisma.outbox.update({
      where: { id },
      data,
    });
  }
}
