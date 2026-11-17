# Decom Industries — Full-Stack E-Commerce & Admin Platform

A full-stack e-commerce storefront and admin management platform for **Decom Industries** (Surat, India — Precision Apparel Packaging & Home Storage), built step-by-step with **Docker**, **PostgreSQL**, **Express + TypeScript + Prisma**, **Next.js + Tailwind CSS + Framer Motion**, and **GitHub Actions CI**.

## Architecture

```text
Frontend (Next.js :3000)
   │  HTTP JSON + Secure HttpOnly Cookies
   ▼
Backend API (Express + TypeScript + Prisma :5000)
   │  SQL via Prisma ORM
   ▼
Database (PostgreSQL :5432 inside Docker)
```

## Project Structure

- `frontend/` — Customer storefront (catalog, cart, checkout, user account, Custom OEM studio) + protected Admin Dashboard
- `backend/` — REST API, authentication, role-based access control (`USER` / `ADMIN`), security middleware, Prisma database schema
- `.github/workflows/` — Automated CI checks (lint, type-check, build)
- `docker-compose.yml` — Runs PostgreSQL, Backend, and Frontend in isolated containers *(added in Step 2)*

## Build Progress

- [x] **Step 1:** Project structure, `.gitignore`, `.env.example`, and Git setup
- [ ] **Step 2:** Docker & PostgreSQL database setup
- [ ] **Step 3:** Backend API foundation & security middleware
- [ ] **Step 4:** Authentication (Password hashing, JWT `HttpOnly` cookies, User/Admin roles)
- [ ] **Step 5:** E-Commerce & OEM backend APIs
- [ ] **Step 6:** Animated Decom Storefront connected to Backend API
- [ ] **Step 7:** Protected Admin Dashboard
- [ ] **Step 8:** Full Dockerization + Husky pre-commit hooks + GitHub Actions CI
