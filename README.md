# Thapar University Integrated Management Portal (UIMP)

A production-grade, modular monolith built on PostgreSQL, designed to integrate and manage all critical university operations.

## 👥 The Team
- **Sushain Sharma** | Roll No: 1024030439
- **Manan Kapoor** | Roll No: 1024030467
- **Abhinav Kumar Singh** | Roll No: 1024030440
- **Lab Instructor:** Dr. Cheenu

## 🚀 Project Overview
UIMP is a centralized management system that replaces fragmented manual processes with a robust, database-first architecture. It covers Student Management, Hostel Allocation, Library Systems, and Examination Processing.

### Key Technical Highlights
- **Modular Monolith Architecture**: Explicit PostgreSQL schemas (`auth`, `academic`, `hostel`, `library`, `exam`, `audit`, `core`) for high scalability.
- **Advanced DBMS Features**: Implementation of PL/pgSQL Triggers, Stored Procedures, and Functions for business logic automation.
- **Full ACID Compliance**: Strict transaction management for critical workflows like room allocation and exam registration.
- **QR Code Integration**: System-ready for physical resource tracking (Hostel Rooms & Library Books).
- **Modern Tech Stack**: Cloudflare Workers (Runtime), Neon PostgreSQL (Database), and Upstash Redis (Caching).

## 📂 Project Structure
- `backend/`: TypeScript modular monolith following clean architecture principles.
- `backend/migrations/`: Granular SQL migration files (`V001` - `V011`) for schema versioning.
- `frontend/`: Modern React/Next.js dashboard skeleton.
- `docs/`: Full documentation including the [Formal Project Report](./docs/PROJECT_REPORT.md).

## 🛠️ Getting Started
1. **Migrations**: `cd backend && npm run migrate`
2. **Seeding**: `cd backend && npm run seed` (Populates system with sample students and module data).
3. **Dev Server**: `npm run dev`

## 📖 Full Documentation
- [Architecture & Design](./docs/architecture.md)
- [Database Schema & Normalization](./docs/database-schema.md)
- [API Specifications](./docs/api-specification.md)
- [Deployment Guide](./docs/deployment.md)
- [Project Report](./docs/PROJECT_REPORT.md)
