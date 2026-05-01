-- ═══════════════════════════════════════════════════════════════
-- V002: Auth Tables
-- ═══════════════════════════════════════════════════════════════
-- Migration: V002__auth_tables.sql
-- Purpose:   Identity, RBAC, sessions, and token management.
-- Real-world: Canonical identity for every actor in the platform.
-- Free-tier:  Minimal storage — user count drives this.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- auth.users — canonical identity for every actor
-- ───────────────────────────────────────────────────────────────
CREATE TABLE auth.users (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  email             TEXT        NOT NULL,
  phone             TEXT,
  first_name        TEXT        NOT NULL,
  last_name         TEXT        NOT NULL,
  password_hash     TEXT        NOT NULL,
  password_algo     TEXT        NOT NULL DEFAULT 'bcrypt',
  status            TEXT        NOT NULL DEFAULT 'pending'
                    CHECK (status IN ('pending', 'active', 'locked', 'disabled')),
  last_login_at     TIMESTAMPTZ,
  failed_login_count INTEGER   NOT NULL DEFAULT 0,
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  version           INTEGER     NOT NULL DEFAULT 1
);

-- Unique active email (soft-delete aware)
CREATE UNIQUE INDEX uq_users_email_active
  ON auth.users (email)
  WHERE deleted_at IS NULL;

-- Unique active phone when present
CREATE UNIQUE INDEX uq_users_phone_active
  ON auth.users (phone)
  WHERE deleted_at IS NULL AND phone IS NOT NULL;

-- Auto-update updated_at
CREATE TRIGGER touch_users_updated_at
  BEFORE UPDATE ON auth.users
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

COMMENT ON TABLE auth.users IS 'Canonical identity for every actor in UIMS';

-- ───────────────────────────────────────────────────────────────
-- auth.roles — role catalog independent of individual users
-- ───────────────────────────────────────────────────────────────
CREATE TABLE auth.roles (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  scope_type  TEXT CHECK (scope_type IN ('global', 'department', 'hostel', 'library')),
  is_system   BOOLEAN NOT NULL DEFAULT FALSE,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_roles_code UNIQUE (code)
);

CREATE TRIGGER touch_roles_updated_at
  BEFORE UPDATE ON auth.roles
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

COMMENT ON TABLE auth.roles IS 'Role catalog — decoupled from user assignments';

-- ───────────────────────────────────────────────────────────────
-- auth.permissions — normalized permission catalog
-- ───────────────────────────────────────────────────────────────
CREATE TABLE auth.permissions (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL,
  description TEXT,
  module      TEXT NOT NULL,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_permissions_code UNIQUE (code)
);

COMMENT ON TABLE auth.permissions IS 'Fine-grained permission catalog (e.g. student.read.self, exam.result.publish)';

-- ───────────────────────────────────────────────────────────────
-- auth.user_roles — many-to-many role assignment with scope
-- ───────────────────────────────────────────────────────────────
CREATE TABLE auth.user_roles (
  id         UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id    UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role_id    UUID        NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
  scope_id   UUID,       -- optional: department_id, hostel_id, etc. depending on role.scope_type
  granted_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  granted_by UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  revoked_at TIMESTAMPTZ,
  CONSTRAINT uq_user_role_scope UNIQUE (user_id, role_id, scope_id)
);

COMMENT ON TABLE auth.user_roles
  IS 'Allows one user to hold multiple roles (student + hostel resident + library member)';

-- ───────────────────────────────────────────────────────────────
-- auth.role_permissions — decouple permission grants from users
-- ───────────────────────────────────────────────────────────────
CREATE TABLE auth.role_permissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  role_id       UUID NOT NULL REFERENCES auth.roles(id) ON DELETE CASCADE,
  permission_id UUID NOT NULL REFERENCES auth.permissions(id) ON DELETE CASCADE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_role_permission UNIQUE (role_id, permission_id)
);

COMMENT ON TABLE auth.role_permissions IS 'Maps roles to their permitted actions';

-- ───────────────────────────────────────────────────────────────
-- auth.refresh_tokens — revocable refresh token store
-- ───────────────────────────────────────────────────────────────
CREATE TABLE auth.refresh_tokens (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  token_hash  TEXT        NOT NULL,
  device_info TEXT,
  ip_address  TEXT,
  expires_at  TIMESTAMPTZ NOT NULL,
  revoked_at  TIMESTAMPTZ,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for lookup by user and active status
CREATE INDEX idx_refresh_tokens_user_active
  ON auth.refresh_tokens (user_id)
  WHERE revoked_at IS NULL;

COMMENT ON TABLE auth.refresh_tokens
  IS 'Stores hashed refresh tokens for rotation and revocation';
