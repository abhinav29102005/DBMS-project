/**
 * UIMS API — Cloudflare Workers Env Interface
 *
 * All secrets are set via `wrangler secret put <KEY>`.
 * Non-secret vars are defined in wrangler.toml [vars].
 */
export interface Env {
  // ── Neon PostgreSQL ──────────────────────────────────────
  DATABASE_URL: string;

  // ── Upstash Redis ────────────────────────────────────────
  UPSTASH_REDIS_REST_URL: string;
  UPSTASH_REDIS_REST_TOKEN: string;

  // ── JWT Secrets ──────────────────────────────────────────
  JWT_ACCESS_SECRET: string;
  JWT_REFRESH_SECRET: string;

  // ── Email (Brevo — free: 300 emails/day) ──────────────────
  BREVO_API_KEY: string;

  // ── Observability (Sentry — free: 5K errors/mo) ──────────
  SENTRY_DSN: string;

  // ── Non-secret vars (from wrangler.toml) ─────────────────
  APP_ENV: string;
  CORS_ORIGIN: string;
  ACCESS_TOKEN_TTL_MINUTES: string;
  REFRESH_TOKEN_TTL_DAYS: string;
  BCRYPT_COST: string;
}
