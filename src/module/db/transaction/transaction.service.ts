import { Injectable } from '@nestjs/common';
import { TransactionPort } from './transaction.port';
import { TransactionClient } from 'generated/prisma/internal/prismaNamespace';
import { DatabaseService } from '../database.service';

@Injectable()
export class TransactionService implements TransactionPort {
  constructor(private readonly prisma: DatabaseService) {}

  async run<T>(fn: (tx: TransactionClient) => Promise<T>): Promise<T> {
    return this.prisma.$transaction((tx) => fn(tx));
  }
}
