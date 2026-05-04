# 🏛️ Thapar University Integrated Management Portal (UIMP)

[![Next.js](https://img.shields.io/badge/Next.js-15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare-Workers-F38020?style=flat-square&logo=cloudflare)](https://workers.cloudflare.com/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?style=flat-square&logo=postgresql)](https://www.postgresql.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-3178C6?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=flat-square)](https://opensource.org/licenses/MIT)

A production-grade, database-driven **University Integrated Management Portal (UIMP)**. Built with a modular monolith architecture, this system centralizes fragmented university operations into a robust, high-performance platform.

---

## 🔗 Live Deployments

| Component | URL | Status |
| :--- | :--- | :--- |
| **Frontend Portal** | [uims.abhinavkumarsingh.tech](https://uims.abhinavkumarsingh.tech/) | 🟢 Live |
| **API Backend** | [uims-backend.abhinavkumarsingh.tech](https://uims-backend.abhinavkumarsingh.tech) | 🟢 Online |

---

## 📄 Technical Documentation

> [!IMPORTANT]
>
> ### [Download Technical Master Report (PDF)](./docs/UIMS_TECHNICAL_MASTER_REPORT.pdf)
>
> This comprehensive report contains the full database schema, architectural diagrams, PL/pgSQL logic, and system normalization details.


---

## 👥 The Development Team

- **Sushain Sharma** (Roll No: 1024030439)
- **Manan Kapoor** (Roll No: 1024030467)
- **Abhinav Kumar Singh** (Roll No: 1024030440)
- **Supervised by:** Dr. Abhishelly (Lab Instructor)

---

## 🚀 Key Features

### 🏢 Core Academic Management

- **Role-Based Dashboards**: Tailored experiences for Students, Faculty, Staff, and Administrators.
- **Course Management**: Dynamic offering, enrollment, and attendance tracking.
- **Examination Module**: Marks entry, result generation, and automated CGPA calculation.

### 🏠 Integrated Campus Services

- **Hostel Allocation**: Real-time room availability and automated student allocation.
- **Library System**: Digital catalog with book issuing and return tracking.
- **Resource Management**: Tracking of physical campus assets via a centralized database.

### 🛠️ Advanced DBMS Implementation

- **Modular Monolith**: 7+ explicit PostgreSQL schemas (`auth`, `academic`, `hostel`, `library`, `exam`, `audit`, `core`).
- **Logic Automation**: 20+ PL/pgSQL Triggers and Stored Procedures for data integrity.
- **ACID Compliance**: Atomic transactions for critical workflows (e.g., room booking, marks submission).

---

## 🛠️ Tech Stack

- **Frontend**: Next.js 15, Tailwind CSS, Zustand, React Query
- **Backend**: Cloudflare Workers, Hono, TypeScript
- **Database**: Neon PostgreSQL (Serverless), Drizzle ORM
- **Cache/Queue**: Upstash Redis
- **DevOps**: GitHub Actions, Cloudflare Pages, Vercel

---

## 📂 Project Structure

```bash
├── backend/            # TypeScript API Monolith (Hono + Drizzle)
│   ├── src/            # Business logic, controllers, and services
│   └── migrations/     # Versioned SQL migrations (V001 - V011)
├── frontend/           # Next.js Dashboard Application
│   └── src/            # Premium UI components and state management
├── docs/               # Technical reports, schemas, and diagrams
└── scratch/            # Development scripts and utilities
```

---

## ⚙️ Local Development

### 1. Database Setup

```bash
cd backend
npm install
npm run migrate    # Push schema to PostgreSQL
npm run seed       # Populate with initial seed data
```

### 2. Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

### 3. Backend Setup

```bash
cd backend
npm run dev        # Starts local Wrangler worker
```



---
<p align="center">Built for Thapar University DBMS Project &copy; 2026</p>
