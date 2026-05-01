-- ═══════════════════════════════════════════════════════════════
-- V008: Indexes
-- ═══════════════════════════════════════════════════════════════
-- All FK indexes + query-aligned indexes + FTS/trigram indexes.
-- PostgreSQL does NOT auto-create indexes on FK columns.
-- ═══════════════════════════════════════════════════════════════

-- ─── auth FK indexes ─────────────────────────────────────────
CREATE INDEX idx_user_roles_user_id ON auth.user_roles (user_id);
CREATE INDEX idx_user_roles_role_id ON auth.user_roles (role_id);
CREATE INDEX idx_role_permissions_role_id ON auth.role_permissions (role_id);
CREATE INDEX idx_role_permissions_perm_id ON auth.role_permissions (permission_id);
CREATE INDEX idx_refresh_tokens_user_id ON auth.refresh_tokens (user_id);

-- ─── academic FK indexes ─────────────────────────────────────
CREATE INDEX idx_programs_dept_id ON academic.programs (department_id);
CREATE INDEX idx_students_dept_id ON academic.students (department_id);
CREATE INDEX idx_students_program_id ON academic.students (program_id);
CREATE INDEX idx_students_user_id ON academic.students (user_id);
CREATE INDEX idx_faculty_dept_id ON academic.faculty (department_id);
CREATE INDEX idx_faculty_user_id ON academic.faculty (user_id);
CREATE INDEX idx_courses_dept_id ON academic.courses (department_id);
CREATE INDEX idx_courses_prereq_id ON academic.courses (prerequisite_id) WHERE prerequisite_id IS NOT NULL;
CREATE INDEX idx_offerings_course_id ON academic.course_offerings (course_id);
CREATE INDEX idx_offerings_semester_id ON academic.course_offerings (semester_id);
CREATE INDEX idx_offerings_faculty_id ON academic.course_offerings (primary_faculty_id);
CREATE INDEX idx_enrollments_student_id ON academic.enrollments (student_id);
CREATE INDEX idx_enrollments_offering_id ON academic.enrollments (course_offering_id);

-- ─── academic query-aligned indexes ──────────────────────────
CREATE INDEX idx_students_lifecycle ON academic.students (lifecycle_state) WHERE deleted_at IS NULL;
CREATE INDEX idx_students_no ON academic.students (student_no);
CREATE INDEX idx_faculty_empno ON academic.faculty (employee_no);
CREATE INDEX idx_enrollments_status ON academic.enrollments (student_id, enrollment_status, course_offering_id);
CREATE INDEX idx_offerings_semester_dept ON academic.course_offerings (semester_id, course_id);

-- ─── hostel FK indexes ───────────────────────────────────────
CREATE INDEX idx_blocks_hostel_id ON hostel.blocks (hostel_id);
CREATE INDEX idx_rooms_block_id ON hostel.rooms (block_id);
CREATE INDEX idx_beds_room_id ON hostel.beds (room_id);
CREATE INDEX idx_allocations_student_id ON hostel.allocations (student_id);
CREATE INDEX idx_allocations_bed_id ON hostel.allocations (bed_id);
CREATE INDEX idx_waitlist_student_id ON hostel.waitlist (student_id);
CREATE INDEX idx_waitlist_hostel_id ON hostel.waitlist (hostel_id);

-- ─── hostel query-aligned indexes ────────────────────────────
CREATE INDEX idx_allocations_status ON hostel.allocations (bed_id, status, allocated_to);
CREATE INDEX idx_allocations_student_status ON hostel.allocations (student_id, status, allocated_to);
CREATE INDEX idx_waitlist_status ON hostel.waitlist (status, priority DESC);

-- ─── library FK indexes ──────────────────────────────────────
CREATE INDEX idx_books_publisher_id ON library.books (publisher_id);
CREATE INDEX idx_books_subject_id ON library.books (subject_id);
CREATE INDEX idx_book_copies_book_id ON library.book_copies (book_id);
CREATE INDEX idx_issues_copy_id ON library.issues (copy_id);
CREATE INDEX idx_issues_member_id ON library.issues (member_user_id);
CREATE INDEX idx_reservations_book_id ON library.reservations (book_id);
CREATE INDEX idx_reservations_member_id ON library.reservations (member_user_id);
CREATE INDEX idx_fines_issue_id ON library.fines (issue_id);
CREATE INDEX idx_fines_member_id ON library.fines (member_user_id);

-- ─── library query-aligned indexes ───────────────────────────
CREATE INDEX idx_book_copies_barcode ON library.book_copies (barcode);
CREATE INDEX idx_book_copies_status ON library.book_copies (book_id, status);
CREATE INDEX idx_issues_member_overdue ON library.issues (member_user_id, returned_at, due_at);
CREATE INDEX idx_issues_copy_returned ON library.issues (copy_id, returned_at);
CREATE INDEX idx_fines_unsettled ON library.fines (member_user_id) WHERE settled_at IS NULL;
CREATE INDEX idx_reservations_active ON library.reservations (book_id, status, created_at) WHERE status = 'active';

-- ─── library full-text search ────────────────────────────────
CREATE INDEX idx_books_fts ON library.books USING GIN (search_vector);
CREATE INDEX idx_books_trgm ON library.books USING GIN (title gin_trgm_ops);

-- ─── exam FK indexes ─────────────────────────────────────────
CREATE INDEX idx_exams_offering_id ON exam.exams (course_offering_id);
CREATE INDEX idx_exams_type_id ON exam.exams (exam_type_id);
CREATE INDEX idx_marks_exam_id ON exam.marks (exam_id);
CREATE INDEX idx_marks_student_id ON exam.marks (student_id);
CREATE INDEX idx_results_offering_id ON exam.final_results (course_offering_id);
CREATE INDEX idx_results_student_id ON exam.final_results (student_id);

-- ─── exam query-aligned indexes ──────────────────────────────
CREATE INDEX idx_results_student_offering ON exam.final_results (student_id, course_offering_id);
CREATE INDEX idx_grade_scale_effective ON exam.grade_scale (effective_from, effective_to);
