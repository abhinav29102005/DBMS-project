

import { Redis } from '@upstash/redis';
import { UserRepository } from '../infrastructure/user-repository';
import { verifyPassword } from '../domain/password';
import { signAccessToken, signRefreshToken } from '../domain/jwt';
import { checkRateLimit } from '../../../infrastructure/cache/redis';
import { UnauthorizedError, RateLimitError, ForbiddenError } from '../../../core/errors/app-error';
import type { Env } from '../../../core/types/env';
import type { AuthSession } from '../domain/entities';

export class LoginUseCase {
  constructor(
    private userRepo: UserRepository,
    private redis: Redis,
    private env: Env
  ) {}

  async execute(email: string, plain: string, ip: string): Promise<AuthSession> {

    const rateLimitKey = `auth:login:rate:${ip}`;
    const limit = await checkRateLimit(this.redis, rateLimitKey, 5, 60);
    if (!limit.allowed) {
      throw new RateLimitError(limit.resetAt - Math.floor(Date.now() / 1000));
    }

    const user = await this.userRepo.findByEmail(email);
    if (!user) {

      throw new UnauthorizedError('Invalid email or password');
    }

    if (user.status === 'locked' || user.status === 'disabled') {
      throw new ForbiddenError(`Account is ${user.status}`);
    }

    const isMatch = await verifyPassword(plain, user.passwordHash);
    if (!isMatch) {
      const failedCount = await this.userRepo.recordFailedLogin(user.id);
      if (failedCount >= 5) {
        await this.userRepo.lockAccount(user.id);
        throw new ForbiddenError('Account locked due to too many failed attempts');
      }
      throw new UnauthorizedError('Invalid email or password');
    }

    await this.userRepo.updateLoginStats(user.id);

    const authDetails = await this.userRepo.getUserAuthDetails(user.id);

    const accessToken = await signAccessToken(
      { sub: user.id, role: authDetails.role, scopeId: authDetails.scopeId },
      this.env.JWT_ACCESS_SECRET,
      parseInt(this.env.ACCESS_TOKEN_TTL_MINUTES)
    );

    const refreshToken = await signRefreshToken(
      user.id,
      this.env.JWT_REFRESH_SECRET,
      parseInt(this.env.REFRESH_TOKEN_TTL_DAYS)
    );

    const permKey = `auth:perms:${user.id}`;
    await this.redis.set(permKey, JSON.stringify(authDetails.permissions), { ex: 300 });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: authDetails.role,
        permissions: authDetails.permissions
      }
    };
  }
}
