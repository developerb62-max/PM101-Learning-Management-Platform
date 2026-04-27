import { BadRequestException, Injectable } from '@nestjs/common';
import { UserRepository } from '../user/user.repository';
import { CreateUserDTO } from './dto/createUser.dto';
import { randomBytes } from 'crypto';
import * as bcrypt from 'bcrypt';
import { TokenRepository } from './repository/token.repository';
import { EVENT_TYPE } from '../../../generated/prisma/enums';
import { mintesToMilliseconds } from 'src/shared/time/time.util';
import { TransactionPort } from '../db/transaction/transaction.port';
import { OutboxRepository } from './repository/outbox.repository';

@Injectable()
export class AuthService {
  constructor(
    private readonly userRepo: UserRepository,
    private readonly tokenRepo: TokenRepository,
    private readonly transaction: TransactionPort,
    private readonly ouboxRepo: OutboxRepository,
  ) {}

  /**
   * Registers a new user and sends a verification email token.
   *
   * @param dto - The user registration data (name, email, password)
   * @returns A success message prompting the user to check their inbox
   * @throws {BadRequestException} If the email is already associated with an account
   *
   * @remarks
   * This method runs user creation and token generation inside a single
   * database transaction to ensure atomicity — if either operation fails,
   * both are rolled back.
   *
   * @example
   * const result = await authService.register({
   *   name: 'John',
   *   email: 'john@example.com',
   *   password: 'securePassword123',
   * });
   * // { message: 'Verification email sent successfully. Please check your inbox.' }
   */
  public async register(dto: CreateUserDTO) {
    const { name, email, password } = dto;

    const user = await this.userRepo.findByEmail(email);
    if (user)
      throw new BadRequestException(
        'Email is already registered. Please log in.',
      );

    const password_hash = await this.hash(password);

    const token = this.generateToken();

    await this.transaction.run(async (tx) => {
      const NewUser = await this.userRepo.createUser(
        {
          name,
          password_hash,
          email,
        },
        tx,
      );

      await this.tokenRepo.create(
        {
          token,
          user: { connect: { id: NewUser.id } },
          type: EVENT_TYPE.VERIFY_EMAIL,
          expires_at: new Date(Date.now() + mintesToMilliseconds(15)),
        },
        tx,
      );

      await this.ouboxRepo.create(
        {
          payload: {
            email,
            token,
          },
          event_type: EVENT_TYPE.VERIFY_EMAIL,
        },
        tx,
      );
    });

    return {
      message: 'Verification email sent successfully. Please check your inbox.',
    };
  }

  private generateToken() {
    return randomBytes(32).toString('hex');
  }

  private hash(data: string) {
    return bcrypt.hash(data, 10);
  }
}
