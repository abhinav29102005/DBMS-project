# UIMS API Specification

## 1. API Design Principles
The API should expose a RESTful contract grouped by domain module while preserving a unified authentication and authorization model.

Standards:
- JSON over HTTPS
- versioned route prefix such as `/api/v1`
- cursor pagination for large collections
- stable filtering and sorting semantics
- idempotency support for retry-prone administrative writes
- request correlation ID on every call

## 2. Authentication And Authorization Endpoints
Base path: `/api/v1/auth`

Core capabilities:
- user login
- token refresh and revocation
- password reset initiation and completion
- user role assignment for administrators
- permission inspection for current actor

Representative endpoint groups:
- `POST /auth/login`
- `POST /auth/refresh`
- `POST /auth/logout`
- `POST /auth/password/reset-request`
- `POST /auth/password/reset-confirm`
- `GET /auth/me`
- `GET /auth/me/permissions`
- `POST /auth/users/{user_id}/roles`
- `DELETE /auth/users/{user_id}/roles/{role_id}`

Authorization model:
- all non-auth endpoints require authenticated access
- sensitive admin actions require explicit permissions such as `user.role.assign` or `exam.result.publish`

## 3. Academic Endpoints
Base path: `/api/v1/academic`

Core resources:
- students
- faculty
- departments
- programs
- courses
- course offerings
- enrollments

Representative endpoint groups:
- `GET /academic/students`
- `POST /academic/students`
- `GET /academic/students/{student_id}`
- `PATCH /academic/students/{student_id}`
- `GET /academic/faculty`
- `POST /academic/faculty`
- `GET /academic/courses`
- `POST /academic/courses`
- `GET /academic/course-offerings`
- `POST /academic/course-offerings`
- `POST /academic/course-offerings/{offering_id}/enrollments`
- `DELETE /academic/course-offerings/{offering_id}/enrollments/{student_id}`

Query features:
- filter by department, program, semester, lifecycle state, and advisor
- sort by admission year, course code, or student number
- paginate with cursor plus limit

## 4. Hostel Endpoints
Base path: `/api/v1/hostel`

Core resources:
- hostels
- blocks
- rooms
- beds
- allocations
- waitlist

Representative endpoint groups:
- `GET /hostel/hostels`
- `POST /hostel/hostels`
- `GET /hostel/rooms`
- `POST /hostel/rooms`
- `GET /hostel/beds/availability`
- `POST /hostel/allocations`
- `PATCH /hostel/allocations/{allocation_id}/vacate`
- `GET /hostel/students/{student_id}/allocation-history`
- `GET /hostel/waitlist`
- `POST /hostel/waitlist`

Operational behavior:
- allocation requests must be transactional and idempotent
- availability endpoints must be derived from active allocations rather than cached writable state

## 5. Library Endpoints
Base path: `/api/v1/library`

Core resources:
- books
- book copies
- issues
- reservations
- fines

Representative endpoint groups:
- `GET /library/books`
- `POST /library/books`
- `GET /library/book-copies`
- `POST /library/book-copies`
- `POST /library/issues`
- `PATCH /library/issues/{issue_id}/return`
- `GET /library/members/{user_id}/issues`
- `POST /library/reservations`
- `GET /library/fines`
- `PATCH /library/fines/{fine_id}/settle`

Query features:
- search by ISBN, title, author, barcode, and subject
- filter issue state by overdue, open, returned, lost, and damaged

## 6. Examination Endpoints
Base path: `/api/v1/exam`

Core resources:
- exam types
- exams
- marks
- final results
- grade scales

Representative endpoint groups:
- `GET /exam/exams`
- `POST /exam/exams`
- `POST /exam/exams/{exam_id}/marks/bulk`
- `PATCH /exam/exams/{exam_id}/marks/{student_id}`
- `POST /exam/course-offerings/{offering_id}/results/publish`
- `POST /exam/course-offerings/{offering_id}/results/unpublish`
- `GET /exam/students/{student_id}/results`
- `GET /exam/course-offerings/{offering_id}/results`

Operational rules:
- marks entry may be saved as draft before publication
- final result publication should create a durable publication event and audit record
- withheld or incomplete statuses must be represented explicitly

## 7. Common API Behaviors

### Pagination
Use cursor-based pagination for large collections:
- response includes `items`, `next_cursor`, and `count_hint` where appropriate

### Filtering
Use explicit query parameters:
- `department_id`
- `semester_id`
- `status`
- `search`
- `sort_by`
- `sort_order`

### Error Model
Responses should map to a normalized error shape:
- machine-readable error code
- human-readable message
- correlation ID
- validation detail when relevant

### Validation
Input validation happens at multiple layers:
- request schema validation at API boundary
- domain rule validation in application layer
- final invariant enforcement in the database

## 8. Access Patterns By Persona
- students: self-service access to profile, enrollments, room allocation, library status, and results
- faculty: assigned offerings, advisees, marks entry, and department-scoped academic reads
- librarian: title and copy management, issue and return operations, fine administration
- warden: allocation and occupancy operations for assigned hostel scope
- examination controller: exam scheduling, bulk marks workflows, publication controls
- admins: system-wide operational controls

## 9. Non-Functional API Expectations
- rate limiting on auth and search-heavy endpoints
- response caching for stable reference data such as departments and course catalogs
- tracing across all write workflows
- audit hooks for privileged mutations
- SLA-aware timeouts for reporting endpoints

This specification is intentionally high level and framework agnostic. It defines the operational contract that backend implementation should satisfy regardless of whether FastAPI or Node.js is chosen.
