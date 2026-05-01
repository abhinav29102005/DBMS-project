-- ═══════════════════════════════════════════════════════════════
-- V003: Academic Tables
-- ═══════════════════════════════════════════════════════════════
-- Migration: V003__academic_tables.sql
-- Purpose:   Departments, programs, semesters, students, faculty,
--            courses, course offerings, and enrollments.
-- Free-tier: Core domain — moderate storage, scales with students.
-- ═══════════════════════════════════════════════════════════════

-- ───────────────────────────────────────────────────────────────
-- academic.departments
-- ───────────────────────────────────────────────────────────────
CREATE TABLE academic.departments (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code             TEXT        NOT NULL,
  name             TEXT        NOT NULL,
  established_year SMALLINT,
  head_faculty_id  UUID,       -- FK added after faculty table exists
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ,
  CONSTRAINT uq_dept_code UNIQUE (code)
);

CREATE TRIGGER touch_departments_updated_at
  BEFORE UPDATE ON academic.departments
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- academic.programs — degree programs and curricula
-- ───────────────────────────────────────────────────────────────
CREATE TABLE academic.programs (
  id                 UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  department_id      UUID        NOT NULL REFERENCES academic.departments(id) ON DELETE RESTRICT,
  code               TEXT        NOT NULL,
  name               TEXT        NOT NULL,
  degree_type        TEXT        NOT NULL CHECK (degree_type IN ('BTech', 'MTech', 'PhD', 'BSc', 'MSc', 'MBA', 'BBA')),
  duration_semesters SMALLINT    NOT NULL CHECK (duration_semesters BETWEEN 1 AND 16),
  created_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at         TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at         TIMESTAMPTZ,
  CONSTRAINT uq_program_code UNIQUE (code)
);

CREATE TRIGGER touch_programs_updated_at
  BEFORE UPDATE ON academic.programs
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- academic.semesters — academic time periods
-- ───────────────────────────────────────────────────────────────
-- Needed for FK integrity from course_offerings and student records.
CREATE TABLE academic.semesters (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  code          TEXT        NOT NULL,           -- e.g. '2024-ODD', '2024-EVEN'
  name          TEXT        NOT NULL,           -- e.g. 'Fall 2024', 'Spring 2025'
  academic_year SMALLINT    NOT NULL,
  start_date    DATE        NOT NULL,
  end_date      DATE        NOT NULL,
  is_current    BOOLEAN     NOT NULL DEFAULT FALSE,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_semester_code UNIQUE (code),
  CONSTRAINT chk_semester_dates CHECK (end_date > start_date)
);

-- Only one semester can be current at a time
CREATE UNIQUE INDEX uq_semester_current
  ON academic.semesters (is_current)
  WHERE is_current = TRUE;

CREATE TRIGGER touch_semesters_updated_at
  BEFORE UPDATE ON academic.semesters
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- academic.students — institutional student record
-- ───────────────────────────────────────────────────────────────
CREATE TABLE academic.students (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id           UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  student_no        TEXT        NOT NULL,
  department_id     UUID        NOT NULL REFERENCES academic.departments(id) ON DELETE RESTRICT,
  program_id        UUID        NOT NULL REFERENCES academic.programs(id) ON DELETE RESTRICT,
  admission_year    SMALLINT    NOT NULL CHECK (admission_year BETWEEN 2000 AND 2100),
  current_semester  SMALLINT    NOT NULL CHECK (current_semester BETWEEN 1 AND 12),
  lifecycle_state   TEXT        NOT NULL DEFAULT 'active'
                    CHECK (lifecycle_state IN ('active', 'graduated', 'suspended', 'withdrawn', 'alumni')),
  advisor_id        UUID,       -- FK to faculty, added after faculty table
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at        TIMESTAMPTZ,
  version           INTEGER     NOT NULL DEFAULT 1,
  CONSTRAINT uq_student_no UNIQUE (student_no)
);

-- Partial unique: one active student per user
CREATE UNIQUE INDEX uq_student_user_active
  ON academic.students (user_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER touch_students_updated_at
  BEFORE UPDATE ON academic.students
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- academic.faculty — faculty and academic staff records
-- ───────────────────────────────────────────────────────────────
CREATE TABLE academic.faculty (
  id               UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id          UUID        NOT NULL REFERENCES auth.users(id) ON DELETE RESTRICT,
  employee_no      TEXT        NOT NULL,
  department_id    UUID        NOT NULL REFERENCES academic.departments(id) ON DELETE RESTRICT,
  designation      TEXT        NOT NULL CHECK (designation IN (
                     'Professor', 'Associate Professor', 'Assistant Professor',
                     'Lecturer', 'Visiting Faculty', 'Adjunct Faculty'
                   )),
  specialization   TEXT,
  employment_state TEXT        NOT NULL DEFAULT 'active'
                   CHECK (employment_state IN ('active', 'on_leave', 'retired', 'terminated')),
  joined_at        DATE,
  created_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at       TIMESTAMPTZ,
  version          INTEGER     NOT NULL DEFAULT 1,
  CONSTRAINT uq_employee_no UNIQUE (employee_no)
);

-- One active faculty record per user
CREATE UNIQUE INDEX uq_faculty_user_active
  ON academic.faculty (user_id)
  WHERE deleted_at IS NULL;

CREATE TRIGGER touch_faculty_updated_at
  BEFORE UPDATE ON academic.faculty
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- Now add deferred FKs
ALTER TABLE academic.departments
  ADD CONSTRAINT fk_dept_head_faculty
  FOREIGN KEY (head_faculty_id) REFERENCES academic.faculty(id)
  ON DELETE SET NULL;

ALTER TABLE academic.students
  ADD CONSTRAINT fk_student_advisor
  FOREIGN KEY (advisor_id) REFERENCES academic.faculty(id)
  ON DELETE SET NULL;

-- ───────────────────────────────────────────────────────────────
-- academic.courses — course catalog
-- ───────────────────────────────────────────────────────────────
CREATE TABLE academic.courses (
  id              UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_code     TEXT        NOT NULL,
  title           TEXT        NOT NULL,
  description     TEXT,
  credits         SMALLINT    NOT NULL CHECK (credits BETWEEN 1 AND 12),
  department_id   UUID        NOT NULL REFERENCES academic.departments(id) ON DELETE RESTRICT,
  course_type     TEXT        NOT NULL DEFAULT 'core'
                  CHECK (course_type IN ('core', 'elective', 'lab', 'project', 'seminar')),
  prerequisite_id UUID        REFERENCES academic.courses(id) ON DELETE SET NULL,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  deleted_at      TIMESTAMPTZ,
  CONSTRAINT uq_course_code UNIQUE (course_code)
);

CREATE TRIGGER touch_courses_updated_at
  BEFORE UPDATE ON academic.courses
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- academic.course_offerings — semester-specific delivery
-- ───────────────────────────────────────────────────────────────
CREATE TABLE academic.course_offerings (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  course_id           UUID        NOT NULL REFERENCES academic.courses(id) ON DELETE RESTRICT,
  semester_id         UUID        NOT NULL REFERENCES academic.semesters(id) ON DELETE RESTRICT,
  section_code        TEXT        NOT NULL DEFAULT 'A',
  primary_faculty_id  UUID        REFERENCES academic.faculty(id) ON DELETE SET NULL,
  capacity            INTEGER     NOT NULL CHECK (capacity > 0),
  enrollment_count    INTEGER     NOT NULL DEFAULT 0 CHECK (enrollment_count >= 0),
  status              TEXT        NOT NULL DEFAULT 'scheduled'
                      CHECK (status IN ('scheduled', 'ongoing', 'completed', 'cancelled')),
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_offering UNIQUE (course_id, semester_id, section_code)
);

CREATE TRIGGER touch_offerings_updated_at
  BEFORE UPDATE ON academic.course_offerings
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();

-- ───────────────────────────────────────────────────────────────
-- academic.enrollments — student → course offering link
-- ───────────────────────────────────────────────────────────────
CREATE TABLE academic.enrollments (
  id                  UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id          UUID        NOT NULL REFERENCES academic.students(id) ON DELETE RESTRICT,
  course_offering_id  UUID        NOT NULL REFERENCES academic.course_offerings(id) ON DELETE RESTRICT,
  enrollment_status   TEXT        NOT NULL DEFAULT 'enrolled'
                      CHECK (enrollment_status IN ('enrolled', 'withdrawn', 'completed', 'failed')),
  registered_at       TIMESTAMPTZ NOT NULL DEFAULT now(),
  withdrawn_at        TIMESTAMPTZ,
  created_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at          TIMESTAMPTZ NOT NULL DEFAULT now(),
  CONSTRAINT uq_enrollment UNIQUE (student_id, course_offering_id)
);

CREATE TRIGGER touch_enrollments_updated_at
  BEFORE UPDATE ON academic.enrollments
  FOR EACH ROW EXECUTE FUNCTION core.touch_updated_at();
