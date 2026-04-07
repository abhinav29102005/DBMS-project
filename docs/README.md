# University Integrated Management System

## Purpose
This documentation suite defines the production-grade target architecture for the University Integrated Management System (UIMS). The repository is structured to support a database-heavy modular monolith that can scale to large university workloads while preserving transactional integrity, auditability, and clear module ownership.

## Documentation Map
- `architecture.md`: system topology, service boundaries, module responsibilities, and runtime interaction model
- `database-schema.md`: database-first design, normalized schema ownership, integrity constraints, indexing, partitioning, and concurrency controls
- `api-specification.md`: high-level REST contract grouped by module, including authorization expectations, pagination, filtering, and admin workflows
- `deployment.md`: deployment reference for Cloudflare Workers, Neon PostgreSQL, Upstash Redis, configuration management, monitoring, and upgrade path

## Repository Layout
- `backend/`: backend application following a modular monolith and clean architecture approach
- `frontend/`: portal and dashboard skeleton for student, faculty, and administrative interfaces
- `docs/`: architecture, schema, API, and deployment documentation

## Architecture Principles
- Database-first design with PostgreSQL as the system of record
- Modular monolith with explicit schema and code ownership per domain
- Strict normalization up to BCNF where applicable
- Soft deletes, audit fields, and immutable history for critical workflows
- Operational correctness under concurrency for resource allocation and circulation flows
- Clear path to scale from an initial free-tier Cloudflare Workers deployment to a production-grade environment

## Intended Scale
- 100K+ students
- Multi-role users across student, faculty, librarian, warden, controller of examinations, and administrators
- High peak traffic during admissions, hostel allocation windows, library circulation spikes, and result publication

## Naming Conventions
- Directories and Markdown files: `kebab-case`
- Backend modules and database objects: `snake_case`
- REST resources: plural nouns and versioned route prefixes when introduced

## Implementation Notes
The repository currently reflects the target physical layout for:
- core backend shared layers
- five domain modules
- infrastructure adapters
- frontend page and service segmentation

This structure is intentionally service-oriented at the module boundary level while remaining operationally simple as a single deployable unit.
