-- ═══════════════════════════════════════════════════════════════
-- V014: Seed Data (reference data only)
-- ═══════════════════════════════════════════════════════════════
-- Only stable reference data. No generated bulk data.
-- ═══════════════════════════════════════════════════════════════

-- ─── Roles ───────────────────────────────────────────────────
INSERT INTO auth.roles (id, code, name, scope_type, is_system) VALUES
  (gen_random_uuid(), 'admin',           'System Administrator',       'global',     TRUE),
  (gen_random_uuid(), 'student',         'Student',                    'global',     TRUE),
  (gen_random_uuid(), 'faculty',         'Faculty Member',             'department', TRUE),
  (gen_random_uuid(), 'librarian',       'Librarian',                  'library',    TRUE),
  (gen_random_uuid(), 'warden',          'Hostel Warden',              'hostel',     TRUE),
  (gen_random_uuid(), 'exam_controller', 'Controller of Examinations', 'global',     TRUE),
  (gen_random_uuid(), 'hod',             'Head of Department',         'department', TRUE),
  (gen_random_uuid(), 'staff',           'General Staff',              'global',     TRUE)
ON CONFLICT (code) DO NOTHING;

-- ─── Permissions ─────────────────────────────────────────────
INSERT INTO auth.permissions (id, code, description, module) VALUES
  -- Auth
  (gen_random_uuid(), 'user.create',          'Create user accounts',           'auth'),
  (gen_random_uuid(), 'user.read.any',        'Read any user profile',          'auth'),
  (gen_random_uuid(), 'user.read.self',       'Read own user profile',          'auth'),
  (gen_random_uuid(), 'user.update.any',      'Update any user account',        'auth'),
  (gen_random_uuid(), 'user.role.assign',     'Assign roles to users',          'auth'),
  (gen_random_uuid(), 'user.role.revoke',     'Revoke roles from users',        'auth'),
  -- Academic
  (gen_random_uuid(), 'student.read.self',    'Read own student record',        'academic'),
  (gen_random_uuid(), 'student.read.any',     'Read any student record',        'academic'),
  (gen_random_uuid(), 'student.create',       'Create student records',         'academic'),
  (gen_random_uuid(), 'student.update',       'Update student records',         'academic'),
  (gen_random_uuid(), 'faculty.read.self',    'Read own faculty record',        'academic'),
  (gen_random_uuid(), 'faculty.read.any',     'Read any faculty record',        'academic'),
  (gen_random_uuid(), 'course.create',        'Create courses',                 'academic'),
  (gen_random_uuid(), 'course.update',        'Update courses',                 'academic'),
  (gen_random_uuid(), 'offering.create',      'Create course offerings',        'academic'),
  (gen_random_uuid(), 'enrollment.create',    'Enroll students',                'academic'),
  (gen_random_uuid(), 'enrollment.read.self', 'Read own enrollments',           'academic'),
  (gen_random_uuid(), 'enrollment.read.any',  'Read any enrollments',           'academic'),
  -- Hostel
  (gen_random_uuid(), 'hostel.manage',        'Manage hostel inventory',        'hostel'),
  (gen_random_uuid(), 'hostel.allocate',      'Allocate beds to students',      'hostel'),
  (gen_random_uuid(), 'hostel.view.self',     'View own allocation',            'hostel'),
  (gen_random_uuid(), 'hostel.view.any',      'View any allocation',            'hostel'),
  -- Library
  (gen_random_uuid(), 'library.catalog.manage', 'Manage book catalog',          'library'),
  (gen_random_uuid(), 'library.issue.create',   'Issue books',                  'library'),
  (gen_random_uuid(), 'library.issue.return',   'Process book returns',         'library'),
  (gen_random_uuid(), 'library.fine.settle',    'Settle library fines',         'library'),
  (gen_random_uuid(), 'library.issue.read.self','View own issue history',       'library'),
  (gen_random_uuid(), 'library.search',         'Search library catalog',       'library'),
  -- Exam
  (gen_random_uuid(), 'exam.create',            'Create exams',                 'exam'),
  (gen_random_uuid(), 'exam.marks.enter',       'Enter marks',                  'exam'),
  (gen_random_uuid(), 'exam.marks.moderate',    'Moderate marks',               'exam'),
  (gen_random_uuid(), 'exam.result.publish',    'Publish results',              'exam'),
  (gen_random_uuid(), 'exam.result.read.self',  'View own results',             'exam'),
  (gen_random_uuid(), 'exam.result.read.any',   'View any results',             'exam')
ON CONFLICT (code) DO NOTHING;

-- ─── Role-Permission Mapping ─────────────────────────────────
-- Admin gets all permissions
INSERT INTO auth.role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM auth.roles r
CROSS JOIN auth.permissions p
WHERE r.code = 'admin'
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Student permissions
INSERT INTO auth.role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM auth.roles r
CROSS JOIN auth.permissions p
WHERE r.code = 'student'
  AND p.code IN (
    'user.read.self', 'student.read.self', 'enrollment.read.self',
    'hostel.view.self', 'library.issue.read.self', 'library.search',
    'exam.result.read.self'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Faculty permissions
INSERT INTO auth.role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM auth.roles r
CROSS JOIN auth.permissions p
WHERE r.code = 'faculty'
  AND p.code IN (
    'user.read.self', 'faculty.read.self', 'student.read.any',
    'enrollment.read.any', 'exam.create', 'exam.marks.enter',
    'exam.result.read.any', 'library.search'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Librarian permissions
INSERT INTO auth.role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM auth.roles r
CROSS JOIN auth.permissions p
WHERE r.code = 'librarian'
  AND p.code IN (
    'user.read.self', 'library.catalog.manage', 'library.issue.create',
    'library.issue.return', 'library.fine.settle', 'library.search'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Warden permissions
INSERT INTO auth.role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM auth.roles r
CROSS JOIN auth.permissions p
WHERE r.code = 'warden'
  AND p.code IN (
    'user.read.self', 'hostel.manage', 'hostel.allocate',
    'hostel.view.any', 'student.read.any'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Exam controller permissions
INSERT INTO auth.role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM auth.roles r
CROSS JOIN auth.permissions p
WHERE r.code = 'exam_controller'
  AND p.code IN (
    'user.read.self', 'exam.create', 'exam.marks.enter',
    'exam.marks.moderate', 'exam.result.publish', 'exam.result.read.any',
    'student.read.any', 'enrollment.read.any'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- Staff permissions
INSERT INTO auth.role_permissions (id, role_id, permission_id)
SELECT gen_random_uuid(), r.id, p.id
FROM auth.roles r
CROSS JOIN auth.permissions p
WHERE r.code = 'staff'
  AND p.code IN (
    'user.read.self', 'library.search'
  )
ON CONFLICT (role_id, permission_id) DO NOTHING;

-- ─── Departments ─────────────────────────────────────────────
INSERT INTO academic.departments (id, code, name, established_year) VALUES
  (gen_random_uuid(), 'CSE',  'Computer Science and Engineering',    1985),
  (gen_random_uuid(), 'ECE',  'Electronics and Communication',       1985),
  (gen_random_uuid(), 'ME',   'Mechanical Engineering',              1960),
  (gen_random_uuid(), 'CE',   'Civil Engineering',                   1960),
  (gen_random_uuid(), 'EE',   'Electrical Engineering',              1965),
  (gen_random_uuid(), 'CHE',  'Chemical Engineering',                1970),
  (gen_random_uuid(), 'MAT',  'Mathematics',                         1960),
  (gen_random_uuid(), 'PHY',  'Physics',                             1960),
  (gen_random_uuid(), 'HUM',  'Humanities and Social Sciences',      1975),
  (gen_random_uuid(), 'MBA',  'School of Management',                1995)
ON CONFLICT (code) DO NOTHING;

-- ─── Programs ────────────────────────────────────────────────
INSERT INTO academic.programs (id, department_id, code, name, degree_type, duration_semesters)
SELECT gen_random_uuid(), d.id, p.code, p.name, p.degree_type, p.duration_semesters
FROM (VALUES
  ('CSE', 'CSE-BTECH', 'B.Tech Computer Science',      'BTech', 8),
  ('CSE', 'CSE-MTECH', 'M.Tech Computer Science',      'MTech', 4),
  ('ECE', 'ECE-BTECH', 'B.Tech Electronics',           'BTech', 8),
  ('ECE', 'ECE-MTECH', 'M.Tech Electronics',           'MTech', 4),
  ('ME',  'ME-BTECH',  'B.Tech Mechanical',             'BTech', 8),
  ('CE',  'CE-BTECH',  'B.Tech Civil',                  'BTech', 8),
  ('EE',  'EE-BTECH',  'B.Tech Electrical',             'BTech', 8),
  ('MBA', 'MBA-MBA',   'Master of Business Admin',      'MBA',   4),
  ('CSE', 'CSE-PHD',   'PhD Computer Science',           'PhD',  12),
  ('MAT', 'MAT-BSC',   'B.Sc Mathematics',              'BSc',   6)
) AS p(dept_code, code, name, degree_type, duration_semesters)
JOIN academic.departments d ON d.code = p.dept_code
ON CONFLICT (code) DO NOTHING;

-- ─── Exam Types ──────────────────────────────────────────────
INSERT INTO exam.exam_types (id, code, name, description) VALUES
  (gen_random_uuid(), 'quiz',       'Quiz',          'Short in-class assessment'),
  (gen_random_uuid(), 'midterm',    'Midterm Exam',  'Mid-semester examination'),
  (gen_random_uuid(), 'endterm',    'End Term Exam', 'End-of-semester examination'),
  (gen_random_uuid(), 'practical',  'Practical',     'Lab or practical examination'),
  (gen_random_uuid(), 'assignment', 'Assignment',    'Take-home or project assignment')
ON CONFLICT (code) DO NOTHING;

-- ─── Grade Scale (10-point, effective 2024) ──────────────────
INSERT INTO exam.grade_scale (id, grade_code, grade_name, min_marks, max_marks, grade_points, effective_from) VALUES
  (gen_random_uuid(), 'A+', 'Outstanding',   90, 100, 10.0, '2024-01-01'),
  (gen_random_uuid(), 'A',  'Excellent',     80,  89,  9.0, '2024-01-01'),
  (gen_random_uuid(), 'B+', 'Very Good',     70,  79,  8.0, '2024-01-01'),
  (gen_random_uuid(), 'B',  'Good',          60,  69,  7.0, '2024-01-01'),
  (gen_random_uuid(), 'C+', 'Above Average', 55,  59,  6.0, '2024-01-01'),
  (gen_random_uuid(), 'C',  'Average',       50,  54,  5.0, '2024-01-01'),
  (gen_random_uuid(), 'D',  'Below Average', 40,  49,  4.0, '2024-01-01'),
  (gen_random_uuid(), 'F',  'Fail',           0,  39,  0.0, '2024-01-01')
ON CONFLICT (grade_code, effective_from) DO NOTHING;

-- ─── Semesters ───────────────────────────────────────────────
INSERT INTO academic.semesters (id, code, name, academic_year, start_date, end_date, is_current) VALUES
  (gen_random_uuid(), '2024-ODD',  'Fall 2024',   2024, '2024-07-15', '2024-12-15', FALSE),
  (gen_random_uuid(), '2024-EVEN', 'Spring 2025', 2024, '2025-01-06', '2025-05-31', FALSE),
  (gen_random_uuid(), '2025-ODD',  'Fall 2025',   2025, '2025-07-15', '2025-12-15', FALSE),
  (gen_random_uuid(), '2025-EVEN', 'Spring 2026', 2025, '2026-01-06', '2026-05-31', TRUE)
ON CONFLICT (code) DO NOTHING;
