import { Injectable } from '@nestjs/common';
import { DatabaseService } from '../db/database.service';
import { Prisma } from 'generated/prisma/client';
import { TransactionClient } from 'generated/prisma/internal/prismaNamespace';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: DatabaseService) {}

  findByEmail(email: string) {
    return this.prisma.user.findUnique({ where: { email } });
  }

  createUser(data: Prisma.UserCreateInput, tx?: TransactionClient) {
    const client = tx ?? this.prisma;
    return client.user.create({ data });
  }

  verify(id: string) {
    return this.prisma.user.update({
      where: { id },
      data: { is_verified: true },
    });
  }
}
