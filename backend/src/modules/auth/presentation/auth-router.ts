

import { AutoRouter, type IRequest } from 'itty-router';
import { createDbClient } from '../../../infrastructure/database/connection';
import { createRedisClient } from '../../../infrastructure/cache/redis';
import { UserRepository } from '../infrastructure/user-repository';
import { LoginUseCase } from '../application/login';
import { RegisterUseCase } from '../application/register';
import { ValidationError } from '../../../core/errors/app-error';
import { z } from 'zod';
import type { Env } from '../../../core/types/env';

const authRouter = AutoRouter<IRequest, [Env]>({ base: '/api/v1/auth' });

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8)
});

authRouter.post('/login', async (request, env) => {
  const body = await request.json();
  const result = loginSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError('Invalid request body', { errors: result.error.format() });
  }

  const sql = createDbClient(env);
  const redis = createRedisClient(env);
  const userRepo = new UserRepository(sql);
  const useCase = new LoginUseCase(userRepo, redis, env);

  const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
  const session = await useCase.execute(result.data.email, result.data.password, ip);

  return Response.json(session);
});

const registerSchema = z.object({
  email: z.string().email(),
  firstName: z.string().min(1),
  lastName: z.string().min(1),
  password: z.string().min(8),
  role: z.enum(['student', 'faculty']).optional()
});

authRouter.post('/register', async (request, env) => {
  const body = await request.json();
  const result = registerSchema.safeParse(body);

  if (!result.success) {
    throw new ValidationError('Invalid request body', { errors: result.error.format() });
  }

  const sql = createDbClient(env);
  const userRepo = new UserRepository(sql);
  const useCase = new RegisterUseCase(userRepo);

  const user = await useCase.execute({
    email: result.data.email,
    firstName: result.data.firstName,
    lastName: result.data.lastName,
    plain: result.data.password,
    role: result.data.role
  });

  return Response.json({
    id: user.id,
    email: user.email,
    firstName: user.firstName,
    lastName: user.lastName,
    status: user.status
  }, { status: 201 });
});

export { authRouter };
