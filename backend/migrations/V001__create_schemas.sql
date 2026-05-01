-- ═══════════════════════════════════════════════════════════════
-- V001: Create Schemas and Extensions
-- ═══════════════════════════════════════════════════════════════
-- Migration: V001__create_schemas.sql
-- Purpose:   Establish all logical schema namespaces and required
--            PostgreSQL extensions for the UIMS database.
-- Free-tier: Negligible — DDL only, no storage cost.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- 1. Schema namespaces
-- ───────────────────────────────────────────────────────────────
-- Each module owns its schema exclusively.
-- Cross-module access is read-only via repository interfaces.

CREATE SCHEMA IF NOT EXISTS core;
COMMENT ON SCHEMA core IS 'Shared utility functions and trigger helpers';

CREATE SCHEMA IF NOT EXISTS auth;
COMMENT ON SCHEMA auth IS 'Identity, RBAC, sessions, and security';

CREATE SCHEMA IF NOT EXISTS academic;
COMMENT ON SCHEMA academic IS 'Students, faculty, departments, programs, courses, enrollments';

CREATE SCHEMA IF NOT EXISTS hostel;
COMMENT ON SCHEMA hostel IS 'Physical housing inventory and allocation history';

CREATE SCHEMA IF NOT EXISTS library;
COMMENT ON SCHEMA library IS 'Bibliographic catalog, physical copies, circulation, fines';

CREATE SCHEMA IF NOT EXISTS exam;
COMMENT ON SCHEMA exam IS 'Exam definitions, marks, final results, grading policy';

CREATE SCHEMA IF NOT EXISTS audit;
COMMENT ON SCHEMA audit IS 'Change logs and compliance evidence';

CREATE SCHEMA IF NOT EXISTS reporting;
COMMENT ON SCHEMA reporting IS 'Materialized views and reporting projections';

-- ───────────────────────────────────────────────────────────────
-- 2. Extensions
-- ───────────────────────────────────────────────────────────────
-- pg_trgm: trigram-based similarity search for library autocomplete
-- Both are pre-installed on Neon, just need enabling.

CREATE EXTENSION IF NOT EXISTS pg_trgm;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";  -- fallback; prefer gen_random_uuid() (built-in pg 13+)

-- ───────────────────────────────────────────────────────────────
-- 3. Shared utility: updated_at trigger function
-- ───────────────────────────────────────────────────────────────
-- Placed in core schema, applied to every business table via triggers.

CREATE OR REPLACE FUNCTION core.touch_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$;

COMMENT ON FUNCTION core.touch_updated_at()
  IS 'Auto-set updated_at to now() on every UPDATE. Attach as BEFORE UPDATE trigger.';
