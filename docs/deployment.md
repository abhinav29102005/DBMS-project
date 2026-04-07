# UIMS Deployment Guide

## 1. Deployment Objective
This deployment plan targets a free-tier-friendly architecture built around Cloudflare Workers for the API layer, Neon for PostgreSQL, and Upstash for Redis. The goal is to keep the stack simple, globally reachable, and inexpensive during development while preserving a clean upgrade path to a more powerful production environment later.

## 2. Recommended Stack
- API hosting: Cloudflare Workers
- Primary database: Neon PostgreSQL
- Cache and rate limiting: Upstash Redis
- Source control and CI/CD: GitHub
- Error monitoring: Sentry or equivalent

## 3. Hosting Topology

### Backend
Deploy one backend API surface that contains all modules:
- auth
- academic
- hostel
- library
- exam

This keeps transactional operations centralized and avoids distributed consistency issues during the initial phase.

Cloudflare Workers fit:
- works well for a unified API gateway with module-oriented routing
- gives a real free-tier option for development and demos
- is globally distributed by default for low-latency reads
- is compatible with serverless HTTP-first integrations

Workers runtime caution:
- best for short, I/O-bound request handling
- not ideal for long-running CPU-heavy report generation inside request paths
- bulk processing and analytics refresh jobs should be moved to asynchronous workflows

### Database
Use Neon PostgreSQL as the system of record with:
- daily backups if available
- SSL connections
- connection pooling or transaction pooling support
- ability to scale to paid plans later without schema redesign

Neon fit:
- clean separation between compute and storage
- strong developer experience for PostgreSQL-first systems
- practical for branching and isolated development databases when needed
- compatible with edge and serverless runtimes through the Neon serverless driver

### Cache
Use Upstash Redis for:
- reference data caching
- rate limiting counters
- idempotency key storage
- short-lived workflow state

Upstash fit:
- REST-native access model works naturally from Cloudflare Workers
- good match for edge/serverless environments where traditional TCP Redis clients are awkward

## 4. Environment Variables
At minimum, configure:
- `DATABASE_URL`
- `DATABASE_POOL_URL` if provided separately
- `REDIS_URL`
- `UPSTASH_REDIS_REST_URL`
- `UPSTASH_REDIS_REST_TOKEN`
- `APP_ENV`
- `JWT_ACCESS_SECRET`
- `JWT_REFRESH_SECRET`
- `PASSWORD_HASH_ALGO`
- `LOG_LEVEL`
- `SENTRY_DSN` or equivalent

Rules:
- never commit secrets into the repository
- store secrets only in the hosting provider secret manager
- rotate secrets on role changes or suspected leakage

## 5. Deployment Workflow

### Step 1: Database Provisioning
- create a Neon PostgreSQL project
- enable SSL and note the pooled and direct connection URLs
- create logical schemas: `auth`, `academic`, `hostel`, `library`, `exam`, `audit`, `reporting`

### Step 2: Cache Provisioning
- create an Upstash Redis database
- record the REST URL and REST token

### Step 3: Workers Provisioning
- create the Cloudflare Workers project for the API layer
- configure routes so the worker serves the unified backend API
- attach Neon and Upstash credentials through Workers secrets or account-level secret storage

### Step 4: Migration Strategy
- run schema migrations during deployment or release phase
- fail deployment if migrations fail
- never run ad hoc schema changes manually in production

### Step 5: Observability
- enable platform logs
- wire application logs and errors to a monitoring service
- capture slow query metrics and lock wait signals

## 6. CI/CD Model
Recommended GitHub workflow:
- pull request validation for linting, tests, and migration safety checks
- auto-deploy the Worker on merge to the main branch
- separate environments for development and production if provider quotas permit

Checks worth automating:
- migration syntax validation
- schema drift detection
- API contract tests
- smoke test after deployment

## 7. Free-Tier Constraints

### Cloudflare Workers
Cloudflare Workers is the key enabler for the free-tier architecture, but the free plan has real execution ceilings. Current official limits include 100,000 requests per day, 10 ms CPU time per HTTP request, 128 MB memory per isolate, and 50 external subrequests per invocation on the free plan. These limits make Workers excellent for lightweight API orchestration and short-lived database-backed requests, but not for heavy in-request computation or large fan-out operations.

### Neon
Neon is excellent for development and low-traffic production-style deployments, but free plan capacity must be monitored. Current official pricing lists 100 CU-hours per month per project and 0.5 GB of storage per project on the free plan. This is enough for a serious prototype, but not for sustained university-wide production load.

### Upstash
Upstash is suitable for cache, rate limiting, and idempotency on free tier, but its limits are also real. Current official limits list 256 MB data size and 500K commands per month on the free plan. That is sufficient for development and moderate demo traffic, but not for analytics-heavy or highly chatty production workloads.

## 8. Free-Tier Reality Check
This exact stack can remain genuinely free only if the system is operated as a prototype, student project, or low-traffic demo.

Free-tier appropriate workloads:
- authentication and RBAC for a limited active user base
- student and faculty profile reads
- course catalog browsing
- library search and copy availability reads
- hostel vacancy lookups
- result viewing after publication

Workloads likely to exceed free-tier limits:
- bulk marks uploads at scale
- heavy administrative dashboards
- continuous background jobs
- large analytics refreshes
- peak-day registration or result-day traffic for a full university population

Conclusion:
- this stack is appropriate for a serious MVP and demonstration deployment
- it is not the final infrastructure for the target scale of 100K+ students without paid upgrades

## 9. Recommended Upgrade Path
When usage grows beyond demo scale:
- move the API layer from Workers Free to Workers Paid or to a container-based backend runtime
- upgrade Neon compute and storage
- introduce a dedicated connection pooler if needed
- add read replicas for reporting-heavy traffic
- isolate background jobs from the request-serving runtime
- adopt managed observability with retention and alerting

## 10. Operational Hardening
- enable HTTPS everywhere
- restrict database access to known runtime clients where possible
- enable periodic backup verification
- monitor connection counts, CPU saturation, slow queries, and disk growth
- keep request handlers short and avoid heavy compute inside Workers
- set query timeouts and cache high-read reference datasets aggressively

## 11. Suggested Deployment Sequence For This Repository
1. Finalize documentation and repository structure.
2. Implement database migrations and seed data strategy.
3. Stand up the Neon PostgreSQL instance.
4. Provision Upstash Redis for cache and rate limiting.
5. Deploy the unified API layer to Cloudflare Workers.
6. Attach monitoring and error tracking.
7. Add CI/CD gates and rollback procedures.
8. Introduce replicas, analytics refresh jobs, and paid scaling only when traffic justifies them.

## 12. Provider Notes
- Cloudflare Workers pricing and limits: official docs currently list 100,000 requests per day on the free plan and 10 ms CPU time per HTTP request, with 128 MB memory per isolate and 50 external subrequests per invocation on free tier.
- Neon pricing: official pricing currently lists 100 CU-hours per month per project and 0.5 GB storage per project on the free plan.
- Upstash pricing: official pricing currently lists one free Redis database with 256 MB data size and 500K commands per month.

This plan keeps the project aligned to a coherent free-tier stack: Cloudflare Workers for the API layer, Neon for PostgreSQL, and Upstash for Redis. It is realistic for development, demo, and MVP use, while still making clear that the final 100K+ student target requires paid scaling.
