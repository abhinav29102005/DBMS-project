

import { UserRepository } from '../infrastructure/user-repository';
import { hashPassword } from '../domain/password';
import { ConflictError } from '../../../core/errors/app-error';
import type { User } from '../domain/entities';

export interface RegisterInput {
  email: string;
  firstName: string;
  lastName: string;
  plain: string;
  role?: string;
}

export class RegisterUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(input: RegisterInput): Promise<User> {

    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    const hashed = await hashPassword(input.plain);

    const user = await this.userRepo.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash: hashed,
      passwordAlgo: 'bcrypt',
      status: 'active'
    });

    await this.userRepo.assignRole(user.id, input.role || 'student');

    return user;
  }
}
