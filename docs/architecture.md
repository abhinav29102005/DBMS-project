# UIMS Architecture

## 1. System Objective
UIMS is a centralized university ERP platform designed to consolidate identity, academics, hostel operations, library circulation, and examination processing into one operational backend. The system is optimized for institutional correctness first: data integrity, traceability, and consistent transaction boundaries take precedence over premature service fragmentation.

## 2. Architectural Style
The recommended implementation is a modular monolith with clean architecture boundaries.

Why this is the right starting point:
- cross-domain workflows such as student suspension, graduation, hostel ineligibility, and result publication remain transactionally coherent
- a single PostgreSQL system of record reduces distributed consistency failure modes
- development velocity remains high without sacrificing module isolation
- future extraction to independently deployable services remains possible because each module already owns its schema and business logic

## 3. Logical Modules

### Auth Service
Responsibilities:
- user identity and credential lifecycle
- session and token issuance
- role-based access control and permission catalog
- security events and audit hooks

Owns:
- `auth.users`
- `auth.roles`
- `auth.permissions`
- `auth.user_roles`
- `auth.role_permissions`
- session and token revocation records

### Academic Service
Responsibilities:
- student and faculty master records
- departments, programs, courses, offerings, and enrollments
- lifecycle state transitions such as active, suspended, graduated, and withdrawn

Owns:
- `academic.students`
- `academic.faculty`
- `academic.departments`
- `academic.programs`
- `academic.courses`
- `academic.course_offerings`
- `academic.enrollments`

### Hostel Service
Responsibilities:
- hostel inventory, room and bed modeling
- eligibility, allocation, vacancy derivation, and waitlist management
- occupancy analytics and allocation history

Owns:
- `hostel.hostels`
- `hostel.blocks`
- `hostel.rooms`
- `hostel.beds`
- `hostel.allocations`
- `hostel.waitlist`

### Library Service
Responsibilities:
- title catalog and physical copy inventory
- issue and return workflows
- title-level reservations
- overdue and fine accounting

Owns:
- `library.books`
- `library.book_copies`
- `library.issues`
- `library.reservations`
- `library.fines`

### Examination Service
Responsibilities:
- exam definitions and scheduling
- marks capture and moderation
- final grade publication and GPA computation
- result withholding and release controls

Owns:
- `exam.exam_types`
- `exam.exams`
- `exam.marks`
- `exam.final_results`
- `exam.grade_scale`

## 4. Runtime Layers
The backend should be organized around four layers:

### Core
- shared security primitives
- request context propagation
- middleware
- logging and error normalization
- cross-cutting contracts

### Module Application Layer
- use cases
- orchestration rules
- transactional workflow boundaries

### Module Domain Layer
- entities
- value objects
- invariants
- domain services

### Infrastructure Layer
- PostgreSQL repositories
- Redis caching
- outbox/event dispatch
- observability and metrics adapters

## 5. Data Ownership Model
Each module owns its schema and is the only module allowed to mutate its tables directly. Cross-module access follows one of two patterns:
- read-only lookup via stable repository/query interfaces
- asynchronous event propagation for secondary effects

Examples:
- the examination module reads course offering identity from academic data but owns the result publication state
- the hostel module consumes academic eligibility state but owns allocation rows
- the library module references users or students as members but owns issue and fine ledgers

This minimizes coupling and avoids hidden write paths.

## 6. Integration Model

### Synchronous
Used for user-facing operations that require immediate consistency:
- login and authorization checks
- course enrollment validation
- room allocation
- book issue and return
- marks entry and result publication

### Asynchronous
Used for side effects and non-critical propagation:
- email notifications
- overdue reminders
- event fan-out to analytics
- cache invalidation
- search index updates

An outbox table should be used so events are published only after the primary transaction commits successfully.

## 7. Concurrency Strategy
The architecture must explicitly protect scarce or contested resources.

High-contention workflows:
- hostel bed allocation
- library copy issuance
- result publication windows
- semester enrollment during peak registration

Recommended controls:
- row-level locking with `FOR UPDATE` on contested inventory rows
- partial unique indexes to enforce one active allocation or open issue
- short-lived transactions
- idempotency keys for retried administrative operations
- retry logic for serialization failures

## 8. Security Architecture
- Argon2id for password hashing
- short-lived access tokens and revocable refresh tokens
- RBAC with optional scoped role assignments
- least-privilege database credentials per runtime
- parameterized database access only
- structured audit trail for all privileged actions
- restricted views for student and faculty self-service access

## 9. Scaling Model
Initial deployment should remain a single deployable backend with one primary PostgreSQL database. Scaling then proceeds in stages:

Stage 1:
- connection pooling
- targeted indexes
- Redis cache
- background workers

Stage 2:
- read replicas for reporting and result-day load
- materialized views for GPA and analytics
- partitioning for results and audit logs

Stage 3:
- selective service extraction for exam or library workloads if operationally justified
- dedicated reporting or warehouse pipeline

## 10. Failure Isolation
The modular monolith should be resilient to localized failure domains:
- slow analytics refresh must not block transactional workloads
- notification failures must not roll back primary academic or financial operations
- cache misses must fall back to PostgreSQL
- result publication must remain recoverable and idempotent

## 11. Repository Alignment
The repository layout mirrors the architectural intent:
- `backend/src/core`: shared runtime concerns
- `backend/src/modules/*`: isolated domain modules with domain, application, infrastructure, and presentation layers
- `backend/src/infrastructure`: external integration and persistence adapters
- `frontend/src/pages/*`: role-specific portal surfaces
- `frontend/src/services/*`: module-oriented API clients

The structure is intentionally ready for disciplined implementation without committing to a framework-specific code style in the documentation layer.
