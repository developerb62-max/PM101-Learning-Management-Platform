import { Injectable } from '@nestjs/common';
import { Prisma } from '@prisma/client';

@Injectable()
export abstract class TransactionPort {
  abstract run<T>(fn: (tx: Prisma.TransactionClient) => Promise<T>): Promise<T>;
}
