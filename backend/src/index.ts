

import { AutoRouter, type IRequest } from 'itty-router';
import type { Env } from './core/types/env';
import { getCorrelationId, withCorrelationId } from './core/middleware/correlation-id';
import { handleOptions, withCors } from './core/middleware/cors';
import { errorHandler } from './core/middleware/error-handler';
import { createDbClient } from './infrastructure/database/connection';
import { captureError } from './infrastructure/observability/sentry';
import { authRouter } from './modules/auth/presentation/auth-router';
import { academicRouter } from './modules/academic/presentation/academic-router';
import { hostelRouter } from './modules/hostel/presentation/hostel-router';
import { libraryRouter } from './modules/library/presentation/library-router';
import { examRouter } from './modules/exam/presentation/exam-router';
import { reportingRouter } from './modules/reporting/reporting-router';
import { profileRouter } from './modules/auth/presentation/profile-router';
import { coreRouter } from './modules/core/presentation/core-router';
import type { AuthenticatedRequest } from './core/types/context';

const router = AutoRouter<AuthenticatedRequest, [Env]>();

router.get('/api/v1/health', async (_request, env) => {
  const sql = createDbClient(env);

  try {
    const result = await sql`SELECT 1 AS ok, now() AS server_time`;
    return Response.json({
      status: 'healthy',
      database: 'connected',
      serverTime: result[0]?.server_time,
      environment: env.APP_ENV,
    });
  } catch (error) {
    return Response.json(
      {
        status: 'degraded',
        database: 'disconnected',
        error: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 503 }
    );
  }
});

router.all('/api/v1/auth/*', authRouter.fetch);
router.all('/api/v1/academic/*', academicRouter.fetch);
router.all('/api/v1/hostel/*', hostelRouter.fetch);
router.all('/api/v1/library/*', libraryRouter.fetch);
router.all('/api/v1/exam/*', examRouter.fetch);
router.all('/api/v1/reporting/*', reportingRouter.fetch);
router.all('/api/v1/profile/*', profileRouter.fetch);
router.all('/api/v1/core/*', coreRouter.fetch);

router.all('*', () =>
  Response.json(
    {
      error: {
        code: 'NOT_FOUND',
        message: 'The requested endpoint does not exist',
      },
    },
    { status: 404 }
  )
);

// Patch global fetch to fix "RequestInitializerDict.cache" error in Cloudflare Workers
const originalFetch = globalThis.fetch;
globalThis.fetch = async (url: any, init?: any) => {
  if (init && typeof init === 'object' && 'cache' in init) {
    const { cache, ...rest } = init;
    return originalFetch(url, rest);
  }
  return originalFetch(url, init);
};

export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    const correlationId = getCorrelationId(request);

    if (request.method === 'OPTIONS') {
      return handleOptions(env);
    }

    try {
      const response = await router.fetch(request, env);
      return withCors(withCorrelationId(response, correlationId), env);
    } catch (error) {
      captureError(error, { correlationId });
      const errResponse = errorHandler(error, correlationId);
      return withCors(errResponse, env);
    }
  },
};
