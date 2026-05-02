

import { UserRepository } from '../infrastructure/user-repository';
import { hashPassword } from '../domain/password';
import { ConflictError } from '../../../core/errors/app-error';
import type { User } from '../domain/entities';
import { EmailService } from '../../../infrastructure/events/email';

export interface RegisterInput {
  email: string;
  firstName: string;
  lastName: string;
  plain: string;
  role?: string;
}

export class RegisterUseCase {
  constructor(
    private userRepo: UserRepository,
    private emailService: EmailService
  ) {}

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

    // Send welcome email
    await this.emailService.send({
      to: user.email,
      subject: 'Welcome to UIMS Portal!',
      text: `Hello ${user.firstName},\n\nYour account has been created successfully. Welcome to the University Integrated Management System.\n\nRegards,\nUIMS Team`,
      html: `<h1>Welcome to UIMS Portal!</h1><p>Hello <strong>${user.firstName}</strong>,</p><p>Your account has been created successfully. Welcome to the University Integrated Management System.</p><p>Regards,<br>UIMS Team</p>`
    }).catch(err => {
      console.error('Failed to send welcome email:', err);
      // We don't throw here to avoid failing registration if email fails
    });

    return user;
  }
}
