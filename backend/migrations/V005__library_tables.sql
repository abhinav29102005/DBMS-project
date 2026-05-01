-- ═══════════════════════════════════════════════════════════════
-- V005: Library Tables
-- ═══════════════════════════════════════════════════════════════
-- Migration: V005__library_tables.sql
-- Purpose:   Bibliographic catalog, physical copies, circulation,
--            reservations, and fine accounting.
-- Design:    Books (bibliographic) separate from book_copies
--            (physical). Circulation history is immutable.
-- Free-tier: FTS indexes + copy rows are the main storage cost.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- library.publishers
-- ───────────────────────────────────────────────────────────────
CREATE TABLE library.publishers (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- library.subjects — classification taxonomy
-- ───────────────────────────────────────────────────────────────
CREATE TABLE library.subjects (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  code       TEXT NOT NULL,
  parent_id  UUID REFERENCES library.subjects(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_subject_code UNIQUE (code)
);

-- ───────────────────────────────────────────────────────────────
-- library.books — bibliographic titles (not physical copies)
-- ───────────────────────────────────────────────────────────────
CREATE TABLE library.books (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  isbn             TEXT        NOT NULL,
  title            TEXT        NOT NULL,
  subtitle         TEXT,
  edition          SMALLINT    DEFAULT 1,
  publisher_id     UUID        REFERENCES library.publishers(id) ON DELETE SET NULL,
  publication_year SMALLINT,
  language_code    TEXT        NOT NULL DEFAULT 'en',
  subject_id       UUID        REFERENCES library.subjects(id) ON DELETE SET NULL,
  page_count       INTEGER,
  search_vector    TSVECTOR,   -- populated by trigger for full-text search
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ,
  CONSTRAINT uq_isbn UNIQUE (isbn)
);

CREATE TRIGGER touch_books_updated_at
  BEFORE UPDATE ON library.books
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- library.authors — normalized author catalog
-- ───────────────────────────────────────────────────────────────
CREATE TABLE library.authors (
  id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name       TEXT NOT NULL,
  bio        TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ───────────────────────────────────────────────────────────────
-- library.book_authors — many-to-many join
-- ───────────────────────────────────────────────────────────────
CREATE TABLE library.book_authors (
  book_id    UUID NOT NULL REFERENCES library.books(id) ON DELETE CASCADE,
  author_id  UUID NOT NULL REFERENCES library.authors(id) ON DELETE CASCADE,
  ordinal    SMALLINT NOT NULL DEFAULT 1,  -- author display order
  PRIMARY KEY (book_id, author_id)
);

-- ───────────────────────────────────────────────────────────────
-- library.book_copies — physical inventory per title
-- ───────────────────────────────────────────────────────────────
CREATE TABLE library.book_copies (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id          UUID        NOT NULL REFERENCES library.books(id) ON DELETE RESTRICT,
  barcode          TEXT        NOT NULL,
  acquisition_date DATE,
  price            NUMERIC(10,2),
  status           TEXT        NOT NULL DEFAULT 'available'
                   CHECK (status IN ('available', 'issued', 'reserved', 'lost', 'damaged', 'withdrawn')),
  shelf_location   TEXT,
  condition_notes  TEXT,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_barcode UNIQUE (barcode)
);

CREATE TRIGGER touch_copies_updated_at
  BEFORE UPDATE ON library.book_copies
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- library.issues — circulation records (immutable history)
-- ───────────────────────────────────────────────────────────────
-- Design: never overwrite issue rows — each issue/return is a
-- distinct record for full audit trail.
CREATE TABLE library.issues (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  copy_id            UUID        NOT NULL REFERENCES library.book_copies(id) ON DELETE RESTRICT,
  member_user_id     UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  issued_by          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  issued_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  due_at             TIMESTAMPTZ NOT NULL,
  returned_at        TIMESTAMPTZ,
  return_received_by UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  renewal_count      SMALLINT    NOT NULL DEFAULT 0,
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_due_after_issue CHECK (due_at > issued_at)
);

-- One open issue per physical copy
CREATE UNIQUE INDEX uq_issue_copy_open
  ON library.issues (copy_id)
  WHERE returned_at IS NULL;

CREATE TRIGGER touch_issues_updated_at
  BEFORE UPDATE ON library.issues
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- library.reservations — title-level (not copy-level)
-- ───────────────────────────────────────────────────────────────
-- Design: libraries promise "next available copy of title",
-- not a specific barcode.
CREATE TABLE library.reservations (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  book_id         UUID        NOT NULL REFERENCES library.books(id) ON DELETE CASCADE,
  member_user_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  status          TEXT        NOT NULL DEFAULT 'active'
                  CHECK (status IN ('active', 'fulfilled', 'expired', 'cancelled')),
  fulfilled_at    TIMESTAMPTZ,
  expired_at      TIMESTAMPTZ,
  notes           TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER touch_reservations_updated_at
  BEFORE UPDATE ON library.reservations
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- library.fines — fine assessments and settlement state
-- ───────────────────────────────────────────────────────────────
CREATE TABLE library.fines (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  issue_id        UUID        NOT NULL REFERENCES library.issues(id) ON DELETE RESTRICT,
  member_user_id  UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  amount          NUMERIC(10,2) NOT NULL CHECK (amount > 0),
  reason          TEXT        NOT NULL DEFAULT 'overdue'
                  CHECK (reason IN ('overdue', 'lost', 'damaged', 'other')),
  assessed_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  settled_at      TIMESTAMPTZ,
  settled_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Idempotent fine accrual: one fine per issue (upsert on conflict)
CREATE UNIQUE INDEX uq_fine_issue
  ON library.fines (issue_id)
  WHERE reason = 'overdue';

CREATE TRIGGER touch_fines_updated_at
  BEFORE UPDATE ON library.fines
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();
