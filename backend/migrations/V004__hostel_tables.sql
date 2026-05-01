-- ═══════════════════════════════════════════════════════════════
-- V004: Hostel Tables
-- ═══════════════════════════════════════════════════════════════
-- Migration: V004__hostel_tables.sql
-- Purpose:   Physical housing inventory and allocation history.
-- Design:    Bed-level allocation (not room-level) for exact
--            locking and mixed occupancy support.
-- Free-tier: Minimal storage — hostel inventory is small.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- hostel.hostels — top-level housing entities
-- ───────────────────────────────────────────────────────────────
CREATE TABLE hostel.hostels (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  name            TEXT        NOT NULL,
  code            TEXT        NOT NULL,
  gender_type     TEXT        NOT NULL CHECK (gender_type IN ('male', 'female', 'mixed')),
  address         TEXT,
  warden_user_id  UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  total_capacity  INTEGER     NOT NULL DEFAULT 0 CHECK (total_capacity >= 0),
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_hostel_code UNIQUE (code)
);

CREATE TRIGGER touch_hostels_updated_at
  BEFORE UPDATE ON hostel.hostels
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- hostel.blocks — intermediate physical grouping
-- ───────────────────────────────────────────────────────────────
CREATE TABLE hostel.blocks (
  id          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  hostel_id   UUID        NOT NULL REFERENCES hostel.hostels(id) ON DELETE CASCADE,
  name        TEXT        NOT NULL,
  floor_count SMALLINT    NOT NULL CHECK (floor_count > 0),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_block_hostel UNIQUE (hostel_id, name)
);

CREATE TRIGGER touch_blocks_updated_at
  BEFORE UPDATE ON hostel.blocks
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- hostel.rooms — physical rooms (not occupancy state)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE hostel.rooms (
  id        UUID     PRIMARY KEY DEFAULT gen_random_uuid(),
  block_id  UUID     NOT NULL REFERENCES hostel.blocks(id) ON DELETE CASCADE,
  room_no   TEXT     NOT NULL,
  floor_no  SMALLINT NOT NULL CHECK (floor_no >= 0),
  capacity  SMALLINT NOT NULL CHECK (capacity > 0),
  room_type TEXT     NOT NULL DEFAULT 'regular'
            CHECK (room_type IN ('regular', 'ac', 'suite', 'accessible')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_room_block UNIQUE (block_id, room_no)
);

CREATE TRIGGER touch_rooms_updated_at
  BEFORE UPDATE ON hostel.rooms
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- hostel.beds — allocatable units (more precise than room-level)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE hostel.beds (
  id        UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  room_id   UUID NOT NULL REFERENCES hostel.rooms(id) ON DELETE CASCADE,
  bed_label TEXT NOT NULL,  -- e.g. 'A', 'B', 'Lower', 'Upper'
  status    TEXT NOT NULL DEFAULT 'available'
            CHECK (status IN ('available', 'occupied', 'maintenance', 'reserved')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_bed_room UNIQUE (room_id, bed_label)
);

CREATE TRIGGER touch_beds_updated_at
  BEFORE UPDATE ON hostel.beds
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- hostel.allocations — full allocation history
-- ───────────────────────────────────────────────────────────────
-- Design: occupancy is derived from active allocation rows.
-- No "is_available" column — eliminates stale-state risk.
CREATE TABLE hostel.allocations (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id       UUID        NOT NULL REFERENCES academic.students(id) ON DELETE RESTRICT,
  bed_id           UUID        NOT NULL REFERENCES hostel.beds(id) ON DELETE RESTRICT,
  allocated_from   TIMESTAMPTZ NOT NULL DEFAULT now(),
  allocated_to     TIMESTAMPTZ,
  status           TEXT        NOT NULL DEFAULT 'active'
                   CHECK (status IN ('active', 'vacated', 'transferred', 'expired')),
  idempotency_key  TEXT,
  allocated_by     UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  vacated_by       UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_alloc_dates CHECK (allocated_to IS NULL OR allocated_to > allocated_from)
);

-- Idempotency key for retry safety
CREATE UNIQUE INDEX uq_alloc_idempotency
  ON hostel.allocations (idempotency_key)
  WHERE idempotency_key IS NOT NULL;

-- One active allocation per student
CREATE UNIQUE INDEX uq_alloc_student_active
  ON hostel.allocations (student_id)
  WHERE status = 'active';

-- One active allocation per bed
CREATE UNIQUE INDEX uq_alloc_bed_active
  ON hostel.allocations (bed_id)
  WHERE status = 'active';

CREATE TRIGGER touch_allocations_updated_at
  BEFORE UPDATE ON hostel.allocations
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- hostel.waitlist — unmet demand and priority-based assignment
-- ───────────────────────────────────────────────────────────────
CREATE TABLE hostel.waitlist (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id   UUID        NOT NULL REFERENCES academic.students(id) ON DELETE CASCADE,
  hostel_id    UUID        NOT NULL REFERENCES hostel.hostels(id) ON DELETE CASCADE,
  priority     INTEGER     NOT NULL DEFAULT 0,  -- higher = more urgent
  preferences  JSONB,       -- e.g. {"room_type": "ac", "floor": "ground"}
  status       TEXT        NOT NULL DEFAULT 'waiting'
               CHECK (status IN ('waiting', 'offered', 'accepted', 'declined', 'expired', 'cancelled')),
  requested_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  resolved_at  TIMESTAMPTZ,
  created_at   TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at   TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- One active waitlist entry per student per hostel
CREATE UNIQUE INDEX uq_waitlist_student_hostel_active
  ON hostel.waitlist (student_id, hostel_id)
  WHERE status = 'waiting';

CREATE TRIGGER touch_waitlist_updated_at
  BEFORE UPDATE ON hostel.waitlist
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();
