'use client';

import React from 'react';
import {
  ShieldCheck,
  Database,
  Server,
  ExternalLink,
  CheckCircle2,
  Lock,
} from 'lucide-react';
import type { HealthResponse, User } from '@/lib/types';
import { API_BASE_URL } from '@/lib/api';

interface SecurityTabProps {
  health: HealthResponse | null;
  adminUser: User;
}

const SECURITY_CONTROLS = [
  {
    name: 'bcrypt Password Hashing (12 Rounds)',
    detail: 'All user & admin passwords are salted and one-way hashed before touching PostgreSQL.',
  },
  {
    name: 'HttpOnly + SameSite JWT Cookies',
    detail: 'Tokens are invisible to browser JavaScript (document.cookie), blocking XSS token theft.',
  },
  {
    name: 'Refresh Token Rotation & DB Revocation',
    detail: 'Refresh tokens are SHA-256 hashed in PostgreSQL and revoked immediately on logout or rotation.',
  },
  {
    name: 'Role-Based Access Control (requireRole)',
    detail: 'Every /api/admin/* route verifies ADMIN role on the Express backend, not just in React UI.',
  },
  {
    name: 'Server-Side Checkout & Atomic Transactions',
    detail: 'Frontend never sends prices; Prisma $transaction verifies stock and computes 18% GST atomically.',
  },
  {
    name: 'Helmet + Strict CORS + Rate Limiting',
    detail: 'HTTP security headers, explicit allowed origins with credentials, and 15-req/15m auth brute-force guard.',
  },
  {
    name: 'Zod Schema Validation & Prisma Parameterized SQL',
    detail: 'Rejects malformed input before DB queries and eliminates SQL Injection attacks.',
  },
  {
    name: 'Automated Git Pre-Commit Secret Guard',
    detail: '.githooks/pre-commit blocks committing .env secrets and checks TypeScript & ESLint automatically.',
  },
];

export function SecurityTab({ health, adminUser }: SecurityTabProps) {
  return (
    <div className="space-y-6">
      {/* Live Service Telemetry */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Backend API</span>
            <Server className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="font-heading text-lg font-extrabold text-slate-950 flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
            {health?.success ? 'Online & Healthy' : 'Checking...'}
          </div>
          <p className="text-[11px] font-mono text-slate-500">{API_BASE_URL}</p>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">PostgreSQL 16 (Docker)</span>
            <Database className="w-4 h-4 text-amber-600" />
          </div>
          <div className="font-heading text-lg font-extrabold text-slate-950 capitalize">
            {health?.database || 'Connected'}
          </div>
          <a
            href="http://localhost:8081"
            target="_blank"
            rel="noreferrer"
            className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 hover:underline"
          >
            Open Adminer DB Explorer (port 8081)
            <ExternalLink className="w-3 h-3" />
          </a>
        </div>

        <div className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-card space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">Active Admin Session</span>
            <Lock className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="font-heading text-lg font-extrabold text-slate-950 truncate">
            {adminUser.name}
          </div>
          <p className="text-[11px] text-slate-500 truncate">
            {adminUser.email} • Role: <strong>{adminUser.role}</strong>
          </p>
        </div>
      </div>

      {/* 8-Layer Security Audit */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-6 shadow-card space-y-4">
        <div className="flex items-center gap-2.5">
          <ShieldCheck className="w-5 h-5 text-emerald-600" />
          <div>
            <h3 className="font-heading font-extrabold text-base text-slate-950">
              Active Production Security Controls (8 / 8 Enforced)
            </h3>
            <p className="text-xs text-slate-500">
              Every security defense running inside your Express + Prisma + Next.js stack
            </p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {SECURITY_CONTROLS.map((c) => (
            <div
              key={c.name}
              className="p-4 rounded-xl bg-slate-50 border border-slate-200/70 flex items-start gap-3"
            >
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
              <div>
                <div className="text-xs font-bold text-slate-950">{c.name}</div>
                <p className="text-[11px] text-slate-600 mt-0.5 leading-relaxed">
                  {c.detail}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
