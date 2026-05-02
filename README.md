# University Integrated Management System (UIMS)

A modern, comprehensive web application built to manage university operations. It features a robust modular monolithic backend and a sleek, animated frontend supporting dark and light modes.

## Tech Stack
- **Frontend**: Next.js (React), Tailwind CSS, Framer Motion, jsPDF (for exports), qrcode.react
- **Backend**: Cloudflare Workers, Neon PostgreSQL, Itty-Router
- **Tools**: Vitest, Wrangler, Faker (for DB seeding)

## Features
- **Student Dashboard**: Real-time stats on courses, exams, library, and hostel.
- **Library Module**: Manage book issues. Features QR Code generation for book tracking and PDF export of current issues.
- **Hostel Module**: Dynamic bed allocation system with QR Code-based entry passes and receipt generation.
- **Dark/Light Mode**: Full theme support out-of-the-box.
- **Smooth Animations**: Seamless page transitions and micro-interactions.

## Setup & Running Locally

1. **Clone & Install**:
   ```bash
   git clone <repo>
   cd DBMS-project
   npm install # in both frontend/ and backend/
   ```

2. **Database Reset & Seeding**:
   The database can be completely wiped and re-seeded with dynamic fake data.
   ```bash
   cd backend
   node scripts/reset-db.mjs # Drops schemas
   node scripts/migrate.mjs  # Runs migrations
   node scripts/seed.mjs     # Seeds dynamic data (3 students, faculty, admin, library, hostel data)
   ```

3. **Running**:
   - Backend: `cd backend && npm run dev`
   - Frontend: `cd frontend && npm run dev`

## Recent Enhancements
- Replaced hard-coded database seeds with `@faker-js/faker` for scalable, dynamic test data.
- Added QR Code support for Hostel allocations and Library book issues.
- Integrated `BrevoEmailService` for transactional emails without hardcoding values.
- Integrated `jsPDF` for dynamic PDF receipt/report generation.
- Modernized UI with `next-themes` and `framer-motion`.
