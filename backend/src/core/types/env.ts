
export interface Env {

  DATABASE_URL: string;

  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;

  BREVO_API_KEY: string;

  SENTRY_DSN: string;

  APP_ENV: string;
  CORS_ORIGIN: string;
  ACCESS_TOKEN_TTL_MINUTES: string;
  REFRESH_TOKEN_TTL_DAYS: string;
  BCRYPT_COST: string;
}
