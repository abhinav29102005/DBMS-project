-- ═══════════════════════════════════════════════════════════════
-- V006: Exam Tables
-- ═══════════════════════════════════════════════════════════════
-- Migration: V006__exam_tables.sql
-- Purpose:   Exam definitions, marks capture, grade scale, and
--            publishable final results.
-- Design:    marks (assessment components) separate from
--            final_results (institutional output). Supports
--            moderation and publication workflows cleanly.
-- Free-tier: Scales with student×exam count.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- exam.exam_types — assessment category lookup
-- ───────────────────────────────────────────────────────────────
CREATE TABLE exam.exam_types (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  code        TEXT NOT NULL,
  name        TEXT NOT NULL,
  description TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_exam_type_code UNIQUE (code)
);

COMMENT ON TABLE exam.exam_types IS 'Lookup: quiz, midterm, endterm, practical, assignment';

-- ───────────────────────────────────────────────────────────────
-- exam.exams — scheduled assessments per course offering
-- ───────────────────────────────────────────────────────────────
CREATE TABLE exam.exams (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_offering_id  UUID        NOT NULL REFERENCES academic.course_offerings(id) ON DELETE RESTRICT,
  exam_type_id        UUID        NOT NULL REFERENCES exam.exam_types(id) ON DELETE RESTRICT,
  name                TEXT        NOT NULL,
  max_marks           NUMERIC(6,2) NOT NULL CHECK (max_marks > 0),
  weightage_percent   NUMERIC(5,2) NOT NULL CHECK (weightage_percent BETWEEN 0 AND 100),
  scheduled_at        TIMESTAMPTZ,
  duration_minutes    INTEGER,
  status              TEXT        NOT NULL DEFAULT 'scheduled'
                      CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled', 'graded')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TRIGGER touch_exams_updated_at
  BEFORE UPDATE ON exam.exams
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- exam.marks — raw marks at exam granularity
-- ───────────────────────────────────────────────────────────────
CREATE TABLE exam.marks (
  exam_id        UUID        NOT NULL REFERENCES exam.exams(id) ON DELETE RESTRICT,
  student_id     UUID        NOT NULL REFERENCES academic.students(id) ON DELETE RESTRICT,
  marks_obtained NUMERIC(6,2) NOT NULL CHECK (marks_obtained >= 0),
  graded_by      UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  graded_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  moderated_by   UUID        REFERENCES auth.users(id) ON DELETE SET NULL,
  moderated_at   TIMESTAMPTZ,
  remarks        TEXT,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  PRIMARY KEY (exam_id, student_id)
);

CREATE TRIGGER touch_marks_updated_at
  BEFORE UPDATE ON exam.marks
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- exam.grade_scale — effective-dated grading policy
-- ───────────────────────────────────────────────────────────────
-- Design: grading policy changes over time must not corrupt
-- historical result interpretation.
CREATE TABLE exam.grade_scale (
  id             UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  grade_code     TEXT        NOT NULL,   -- e.g. 'A+', 'A', 'B+', 'F'
  grade_name     TEXT,                   -- e.g. 'Outstanding', 'Excellent'
  min_marks      NUMERIC(5,2) NOT NULL,
  max_marks      NUMERIC(5,2) NOT NULL,
  grade_points   NUMERIC(4,2) NOT NULL,  -- e.g. 10.0 for A+
  effective_from DATE        NOT NULL,
  effective_to   DATE,
  created_at     TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT chk_grade_marks CHECK (max_marks >= min_marks),
  CONSTRAINT uq_grade_code_effective UNIQUE (grade_code, effective_from)
);

COMMENT ON TABLE exam.grade_scale
  IS 'Temporal grading policy — never mutate, only add new effective periods';

-- ───────────────────────────────────────────────────────────────
-- exam.final_results — published course-level outcome
-- ───────────────────────────────────────────────────────────────
CREATE TABLE exam.final_results (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_offering_id  UUID        NOT NULL REFERENCES academic.course_offerings(id) ON DELETE RESTRICT,
  student_id          UUID        NOT NULL REFERENCES academic.students(id) ON DELETE RESTRICT,
  total_marks         NUMERIC(6,2),
  grade_code          TEXT,
  grade_points        NUMERIC(4,2),
  result_status       TEXT        NOT NULL DEFAULT 'pending'
                      CHECK (result_status IN ('pending', 'pass', 'fail', 'withheld', 'absent')),
  published_at        TIMESTAMPTZ,
  withheld_reason     TEXT,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_result UNIQUE (course_offering_id, student_id)
);

CREATE TRIGGER touch_results_updated_at
  BEFORE UPDATE ON exam.final_results
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

COMMENT ON TABLE exam.final_results
  IS 'Published institutional output — separate from marks (assessment components)';
