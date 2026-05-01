/**
 * UIMS — Application Constants
 */

export const RATE_LIMITS = {
  LOGIN:    { max: 5,  windowSec: 60  },   // 5 attempts/min
  REGISTER: { max: 3,  windowSec: 300 },   // 3 accounts/5min
  API:      { max: 60, windowSec: 60  },   // 60 req/min general
} as const;

export const CACHE_TTL = {
  PERMISSIONS:  300,    // 5 min
  DEPARTMENTS: 3600,    // 1 hr
  COURSES:     3600,    // 1 hr
  GRADE_SCALE: 86400,   // 24 hr
} as const;

export const JWT_DEFAULTS = {
  ACCESS_TTL_MINUTES:  15,
  REFRESH_TTL_DAYS:    7,
} as const;

export const PASSWORD = {
  MIN_LENGTH: 8,
  BCRYPT_COST: 10,
  MAX_FAILED_ATTEMPTS: 5,
} as const;

export const PAGINATION = {
  DEFAULT_LIMIT: 20,
  MAX_LIMIT: 100,
} as const;

export const LIBRARY = {
  MAX_BOOKS_PER_USER: 5,
  DEFAULT_LOAN_DAYS: 14,
  FINE_PER_DAY: 2.00,
  MAX_RENEWALS: 2,
} as const;
