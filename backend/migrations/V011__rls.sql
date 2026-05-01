-- ═══════════════════════════════════════════════════════════════
-- V011: Row Level Security
-- ═══════════════════════════════════════════════════════════════
-- Purpose:   Enforce data isolation at the storage layer based on
--            user role and identity.
-- ═══════════════════════════════════════════════════════════════

-- ─── Enable RLS on core business tables ───────────────────────
ALTER TABLE academic.enrollments ENABLE ROW LEVEL SECURITY;
ALTER TABLE academic.students ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam.marks ENABLE ROW LEVEL SECURITY;
ALTER TABLE exam.final_results ENABLE ROW LEVEL SECURITY;
ALTER TABLE hostel.allocations ENABLE ROW LEVEL SECURITY;
ALTER TABLE library.issues ENABLE ROW LEVEL SECURITY;
ALTER TABLE library.fines ENABLE ROW LEVEL SECURITY;

-- ─── Helper Functions for Policies ────────────────────────────
-- Get internal student ID for the current authenticated user
CREATE OR REPLACE FUNCTION academic.get_current_student_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT id FROM academic.students
  WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;

-- Get internal faculty ID for the current authenticated user
CREATE OR REPLACE FUNCTION academic.get_current_faculty_id()
RETURNS UUID LANGUAGE sql STABLE AS $$
  SELECT id FROM academic.faculty
  WHERE user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid;
$$;

-- ─── Enrollment Policies ──────────────────────────────────────
CREATE POLICY student_sees_own_enrollments ON academic.enrollments
  FOR SELECT USING (
    current_setting('app.current_role', true) = 'student'
    AND student_id = academic.get_current_student_id()
  );

CREATE POLICY faculty_sees_offered_enrollments ON academic.enrollments
  FOR SELECT USING (
    current_setting('app.current_role', true) = 'faculty'
    AND course_offering_id IN (
      SELECT id FROM academic.course_offerings
      WHERE primary_faculty_id = academic.get_current_faculty_id()
    )
  );

CREATE POLICY admin_sees_all_enrollments ON academic.enrollments
  FOR ALL USING (current_setting('app.current_role', true) = 'admin');

-- ─── Student Profile Policies ─────────────────────────────────
CREATE POLICY student_sees_own_profile ON academic.students
  FOR SELECT USING (
    current_setting('app.current_role', true) = 'student'
    AND user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

CREATE POLICY faculty_sees_all_students ON academic.students
  FOR SELECT USING (current_setting('app.current_role', true) = 'faculty');

CREATE POLICY admin_sees_all_students ON academic.students
  FOR ALL USING (current_setting('app.current_role', true) = 'admin');

-- ─── Exam Result Policies ─────────────────────────────────────
CREATE POLICY student_sees_own_results ON exam.final_results
  FOR SELECT USING (
    current_setting('app.current_role', true) = 'student'
    AND student_id = academic.get_current_student_id()
  );

CREATE POLICY faculty_sees_offered_results ON exam.final_results
  FOR SELECT USING (
    current_setting('app.current_role', true) = 'faculty'
    AND course_offering_id IN (
      SELECT id FROM academic.course_offerings
      WHERE primary_faculty_id = academic.get_current_faculty_id()
    )
  );

CREATE POLICY admin_sees_all_results ON exam.final_results
  FOR ALL USING (current_setting('app.current_role', true) = 'admin');

-- ─── Hostel Allocation Policies ────────────────────────────────
CREATE POLICY student_sees_own_allocation ON hostel.allocations
  FOR SELECT USING (
    current_setting('app.current_role', true) = 'student'
    AND student_id = academic.get_current_student_id()
  );

CREATE POLICY warden_sees_all_allocations ON hostel.allocations
  FOR ALL USING (current_setting('app.current_role', true) = 'warden');

CREATE POLICY admin_sees_all_allocations ON hostel.allocations
  FOR ALL USING (current_setting('app.current_role', true) = 'admin');

-- ─── Library Issue Policies ───────────────────────────────────
CREATE POLICY user_sees_own_issues ON library.issues
  FOR SELECT USING (
    member_user_id = NULLIF(current_setting('app.current_user_id', true), '')::uuid
  );

CREATE POLICY librarian_sees_all_issues ON library.issues
  FOR ALL USING (current_setting('app.current_role', true) = 'librarian');

CREATE POLICY admin_sees_all_issues ON library.issues
  FOR ALL USING (current_setting('app.current_role', true) = 'admin');
