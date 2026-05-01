/**
 * UIMS Auth Module — Register Use Case
 */

import { UserRepository } from '../infrastructure/user-repository';
import { hashPassword } from '../domain/password';
import { ConflictError } from '../../../core/errors/app-error';
import type { User } from '../domain/entities';

export interface RegisterInput {
  email: string;
  firstName: string;
  lastName: string;
  plain: string;
  role?: string; // default to 'student'
}

export class RegisterUseCase {
  constructor(private userRepo: UserRepository) {}

  async execute(input: RegisterInput): Promise<User> {
    // 1. Check uniqueness
    const existing = await this.userRepo.findByEmail(input.email);
    if (existing) {
      throw new ConflictError('User with this email already exists');
    }

    // 2. Hash password
    const hashed = await hashPassword(input.plain);

    // 3. Create user
    const user = await this.userRepo.create({
      email: input.email,
      firstName: input.firstName,
      lastName: input.lastName,
      passwordHash: hashed,
      passwordAlgo: 'bcrypt',
      status: 'active' // In production, might start as 'pending' for email verification
    });

    // 4. Assign default role
    await this.userRepo.assignRole(user.id, input.role || 'student');

    return user;
  }
}
