# UIMS Database Schema

## 1. Database Philosophy
The database is the integrity core of UIMS. PostgreSQL is treated as more than persistence; it is the primary enforcement layer for referential integrity, uniqueness, constrained state transitions, and high-confidence transactional behavior.

Design goals:
- normalize to BCNF where practical
- prevent stale derived state
- preserve immutable history for operationally sensitive actions
- support high read/write concurrency without sacrificing correctness

Global standards:
- UUID primary keys on all major entities
- `created_at`, `updated_at`, `deleted_at` on business tables
- optional `created_by` and `updated_by` on privileged workflows
- soft deletes using nullable `deleted_at`
- UTC timestamps
- `version` columns on high-contention rows where optimistic concurrency is useful

## 2. Schema Ownership
- `auth`: identity, RBAC, sessions, security
- `academic`: student, faculty, department, program, course, offering, enrollment
- `hostel`: physical housing inventory and allocation history
- `library`: bibliographic catalog, physical copies, circulation, fines
- `exam`: exam definitions, marks, final results, grading policy
- `audit`: change logs and compliance evidence
- `reporting`: materialized views and reporting projections

## 3. Authentication Schema

### `auth.users`
Purpose:
- canonical identity for every actor in the platform

Key fields:
- `id`
- `email`
- `phone`
- `password_hash`
- `password_algo`
- `status`
- `last_login_at`
- `failed_login_count`
- audit columns

Constraints:
- unique active `email`
- unique active `phone` when present
- `status` limited to `pending`, `active`, `locked`, `disabled`

### `auth.roles`
Purpose:
- role catalog independent of individual users

Key fields:
- `id`
- `code`
- `name`
- `scope_type`

Constraints:
- unique `code`

### `auth.permissions`
Purpose:
- normalized permission catalog

Examples:
- `student.read.self`
- `library.issue.create`
- `hostel.allocate`
- `exam.result.publish`

### `auth.user_roles`
Purpose:
- many-to-many role assignment with optional scope binding

Key fields:
- `user_id`
- `role_id`
- `scope_id`

Constraints:
- unique combination of `user_id`, `role_id`, `scope_id`

### `auth.role_permissions`
Purpose:
- decouple permission grants from concrete users

This model allows one user to be a faculty member, advisor, and hostel warden simultaneously without identity duplication.

## 4. Academic Schema

### `academic.departments`
Stores academic ownership units.

Core fields:
- `id`
- `code`
- `name`

### `academic.programs`
Represents degree programs and curricula.

Core fields:
- `id`
- `department_id`
- `code`
- `name`
- `degree_type`

### `academic.students`
Represents the institutional student record.

Core fields:
- `id`
- `user_id`
- `student_no`
- `department_id`
- `program_id`
- `admission_year`
- `current_semester_id`
- `lifecycle_state`

Constraints:
- unique `user_id`
- unique `student_no`
- `lifecycle_state` constrained to `active`, `graduated`, `suspended`, `withdrawn`, `alumni`

### `academic.faculty`
Represents faculty and academic staff records.

Core fields:
- `id`
- `user_id`
- `employee_no`
- `department_id`
- `designation`
- `employment_state`

### `academic.courses`
Represents the course catalog.

Core fields:
- `id`
- `course_code`
- `title`
- `credits`
- `department_id`
- `course_type`

### `academic.course_offerings`
Separates reusable course definitions from semester-specific delivery.

Core fields:
- `id`
- `course_id`
- `semester_id`
- `section_code`
- `primary_faculty_id`
- `capacity`

Constraints:
- unique `course_id`, `semester_id`, `section_code`

### `academic.enrollments`
Links students to specific course offerings.

Core fields:
- `student_id`
- `course_offering_id`
- `enrollment_status`
- `registered_at`

Constraints:
- composite unique `student_id`, `course_offering_id`

Normalization decision:
- do not store faculty, section, or timetable data directly in `courses`
- do not store aggregate GPA in transactional enrollment rows

## 5. Hostel Schema

### `hostel.hostels`
Top-level housing entities with campus and policy metadata.

### `hostel.blocks`
Intermediate physical grouping within a hostel.

### `hostel.rooms`
Represents physical rooms, not occupancy state.

Core fields:
- `id`
- `block_id`
- `room_no`
- `floor_no`
- `capacity`
- `room_type`

Constraints:
- unique `block_id`, `room_no`
- `capacity > 0`

### `hostel.beds`
Represents allocatable units. This design is more scalable than room-level allocation because it supports mixed occupancy and exact locking.

Core fields:
- `id`
- `room_id`
- `bed_label`

Constraints:
- unique `room_id`, `bed_label`

### `hostel.allocations`
Maintains full allocation history.

Core fields:
- `id`
- `student_id`
- `bed_id`
- `allocated_from`
- `allocated_to`
- `status`

Constraints:
- one active allocation per student
- one active allocation per bed
- valid interval checks on `allocated_from` and `allocated_to`

Important design choice:
- there is no `available_beds` or `is_available` field
- occupancy is derived from active allocation rows
- this removes stale state risk under concurrent updates

### `hostel.waitlist`
Captures unmet demand and priority-based assignment.

## 6. Library Schema

### `library.books`
Represents bibliographic titles only.

Core fields:
- `id`
- `isbn`
- `title`
- `edition`
- `publisher_id`
- `publication_year`
- `language_code`
- `subject_id`

### `library.authors`
Normalized author catalog.

### `library.book_authors`
Many-to-many join between books and authors.

### `library.book_copies`
Represents each physical copy independently.

Core fields:
- `id`
- `book_id`
- `barcode`
- `acquisition_date`
- `price`
- `status`
- `shelf_location`

Constraints:
- unique `barcode`
- `status` constrained to `available`, `issued`, `reserved`, `lost`, `damaged`, `withdrawn`

### `library.issues`
Represents issue and return history at copy level.

Core fields:
- `id`
- `copy_id`
- `member_user_id`
- `issued_by`
- `issued_at`
- `due_at`
- `returned_at`
- `return_received_by`

Constraints:
- one open issue per copy
- `due_at > issued_at`

### `library.reservations`
Recommended as title-level reservation, not copy-level reservation.

Reason:
- libraries usually promise the next available copy of a title, not a specific barcode

### `library.fines`
Stores fine assessments and settlement state.

Normalization decision:
- keep `books` separate from `book_copies`
- keep circulation history immutable
- never overwrite issue rows to represent new circulation events

## 7. Examination Schema

### `exam.exam_types`
Lookup table for assessment categories such as quiz, midterm, endterm, practical, and assignment.

### `exam.exams`
Represents scheduled assessments for a course offering.

Core fields:
- `id`
- `course_offering_id`
- `exam_type_id`
- `name`
- `max_marks`
- `weightage_percent`
- `scheduled_at`

### `exam.marks`
Stores raw marks at exam granularity.

Core fields:
- `exam_id`
- `student_id`
- `marks_obtained`
- `graded_by`
- `graded_at`

Constraints:
- composite primary key on `exam_id`, `student_id`

### `exam.grade_scale`
Stores effective-dated grading policies.

Reason:
- grading policy changes over time must not corrupt historical result interpretation

### `exam.final_results`
Represents published course-level outcome.

Core fields:
- `course_offering_id`
- `student_id`
- `total_marks`
- `grade_code`
- `grade_points`
- `result_status`
- `published_at`

Constraints:
- composite primary key on `course_offering_id`, `student_id`

Separation rationale:
- `marks` stores assessment components
- `final_results` stores publishable institutional output
- this preserves moderation and publication workflows cleanly

## 8. Audit Schema

### `audit.audit_logs`
Purpose:
- immutable evidence of insert, update, and delete operations on sensitive tables

Core fields:
- `id`
- `table_name`
- `record_pk`
- `operation`
- `old_values` as JSONB
- `new_values` as JSONB
- `changed_by`
- `changed_at`
- `request_id`
- `source_service`

Operational notes:
- password hashes and secrets must be excluded or redacted
- high-volume tables should be partitioned by month

## 9. Integrity Constraints
Use foreign keys aggressively, but choose delete behavior carefully.

Preferred patterns:
- `ON DELETE RESTRICT` for master data referenced by long-lived records
- `ON DELETE CASCADE` only for true dependents such as join rows or ephemeral drafts
- `CHECK` constraints for status values, marks bounds, positive capacities, and valid intervals
- partial unique indexes for active-state business rules under soft deletes

Examples:
- one active hostel allocation per student
- one active hostel allocation per bed
- one open issue per book copy
- one active user email per institution

## 10. Indexing Strategy
Every foreign key should be indexed explicitly.

High-value indexes:
- `academic.students(student_no)`
- `academic.faculty(employee_no)`
- `academic.course_offerings(semester_id, department_id, course_id)`
- `academic.enrollments(student_id, enrollment_status, course_offering_id)`
- `hostel.allocations(bed_id, status, allocated_to)`
- `hostel.allocations(student_id, status, allocated_to)`
- `library.book_copies(barcode)`
- `library.issues(member_user_id, returned_at, due_at)`
- `library.issues(copy_id, returned_at)`
- `exam.final_results(student_id, course_offering_id)`
- `audit.audit_logs(table_name, changed_at)`

Reasoning:
- indexes are aligned to dominant filter and sort patterns
- partial indexes on open or active rows keep hot indexes compact
- JSONB GIN indexes should be used only when audit search requirements justify them

## 11. Transactions And Isolation

Default:
- `READ COMMITTED` for standard CRUD flows

Use stronger isolation or locks for contested workflows:
- hostel allocation
- book issue
- bulk result publication
- tightly bounded registration windows

Controls:
- row-level locking using `FOR UPDATE`
- optimistic version checks where contention is moderate
- retry on serialization failure
- idempotency keys for repeated administrative actions

## 12. Partitioning Strategy
Recommended partition candidates:
- `exam.marks` by academic year or semester
- `exam.final_results` by academic year or semester
- `audit.audit_logs` by month
- `library.issues` by year once circulation volume justifies it

Benefits:
- smaller indexes
- improved vacuum characteristics
- cheaper archival and retention operations

## 13. Reporting And Materialized Views
Materialized views belong in `reporting`.

Recommended views:
- `mv_student_gpa_summary`
- `mv_hostel_occupancy_stats`
- `mv_library_usage_analytics`

Guidelines:
- use them for reporting and dashboards, not transactional truth
- refresh on schedule or incrementally depending on latency goals

## 14. Database Security
- parameterized access only
- separate DB roles for runtime, migrations, and analytics
- restricted views for student and faculty self-service
- optional PostgreSQL row-level security for portal-facing reads
- encryption in transit and managed backup policies

The schema is intentionally designed to support institutional-grade correctness and operational scale rather than a lab-only entity list.
