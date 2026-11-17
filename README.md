# Decom Industries — Full-Stack E-Commerce & Admin Platform

A full-stack e-commerce storefront and role-protected admin dashboard for **Decom Industries** (Surat, India — Precision Apparel Packaging & Home Storage), built from scratch with **Docker**, **PostgreSQL 16**, **Express + TypeScript + Prisma**, **Next.js + Tailwind CSS + Framer Motion**, and **Git/CI Automation**.

## Architecture

```text
Frontend (Next.js + Framer Motion :3000)
   │  HTTP JSON + HttpOnly JWT Cookies (credentials: 'include')
   ▼
Backend API (Express + TypeScript + Prisma :4000)
   │  Helmet • CORS • Rate Limit • Zod • bcrypt • RBAC • Transactions
   ▼
Database (PostgreSQL 16 :5439 inside Docker + Adminer :8081)
```

## Quick Start

### Option A: Local Development (Hot Reload)
```bash
# 1. Start PostgreSQL + Adminer in Docker
docker compose up -d postgres adminer

# 2. Start Backend API (port 4000)
cd backend && npm install && npx prisma migrate dev && npm run prisma:seed && npm run dev

# 3. Start Frontend Storefront & Admin Dashboard (port 3000)
cd frontend && npm install && npm run dev
```

### Option B: Full Docker Stack (1 Command!)
```bash
docker compose up --build
```
- **Storefront:** http://localhost:3000
- **Admin Dashboard:** http://localhost:3000/admin
- **Backend Health:** http://localhost:4000/api/health
- **Adminer DB UI:** http://localhost:8081

## Activate Automated Git Pre-Commit Hooks
```bash
git config core.hooksPath .githooks
```
Every `git commit` will automatically block accidental `.env` leaks and run `typecheck` + `lint` on changed packages.

## Build Progress

- [x] **Step 1:** Project structure, `.gitignore`, `.env.example`, and Git setup
- [x] **Step 2:** Docker & PostgreSQL 16 database + Adminer UI
- [x] **Step 3:** Backend API foundation, Prisma schema & 5-layer security shield
- [x] **Step 4:** Authentication (bcrypt hashing, JWT `HttpOnly` cookies, Refresh Rotation, RBAC)
- [x] **Step 5:** E-Commerce & OEM backend APIs (atomic `$transaction` checkout + 18% GST)
- [x] **Step 6:** Animated Decom Storefront connected live to Backend API
- [x] **Step 7:** Protected Admin Dashboard (KPIs, Products CRUD, Orders, OEM Quotes, Users)
- [x] **Step 8:** Full Multi-Stage Dockerfiles + Pre-Commit Git Hooks + GitHub Actions CI
