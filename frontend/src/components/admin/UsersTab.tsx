'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  UserPlus,
  Edit3,
  Trash2,
  Shield,
  X,
  Download,
} from 'lucide-react';
import { adminApi, ApiError } from '@/lib/api';
import type { AdminUserRow, Role } from '@/lib/types';
import { exportToCsv } from './adminUtils';

interface UsersTabProps {
  users: AdminUserRow[];
  currentAdminId: string;
  globalSearch: string;
  onChanged: (toast: string) => void;
  onError: (msg: string) => void;
}

export function UsersTab({
  users,
  currentAdminId,
  globalSearch,
  onChanged,
  onError,
}: UsersTabProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | Role>('ALL');

  const [drawerMode, setDrawerMode] = useState<'create' | 'edit' | null>(null);
  const [editingUser, setEditingUser] = useState<AdminUserRow | null>(null);
  const [saving, setSaving] = useState(false);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [city, setCity] = useState('');
  const [role, setRole] = useState<Role>('USER');

  const filtered = useMemo(() => {
    const q = (localSearch || globalSearch).trim().toLowerCase();
    return users.filter((u) => {
      if (roleFilter !== 'ALL' && u.role !== roleFilter) return false;
      if (
        q &&
        !u.name.toLowerCase().includes(q) &&
        !u.email.toLowerCase().includes(q) &&
        !u.phone.toLowerCase().includes(q) &&
        !(u.city || '').toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [users, localSearch, globalSearch, roleFilter]);

  const openCreate = () => {
    setEditingUser(null);
    setName('');
    setEmail('');
    setPhone('');
    setPassword('');
    setBusinessName('');
    setCity('');
    setRole('USER');
    setDrawerMode('create');
  };

  const openEdit = (u: AdminUserRow) => {
    setEditingUser(u);
    setName(u.name);
    setEmail(u.email);
    setPhone(u.phone);
    setPassword('');
    setBusinessName(u.businessName || '');
    setCity(u.city || '');
    setRole(u.role);
    setDrawerMode('edit');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (drawerMode === 'create') {
        await adminApi.createUser({
          name,
          email,
          phone,
          password,
          businessName: businessName || undefined,
          city: city || undefined,
          role,
        });
        onChanged(`Created ${role} account for ${email}!`);
      } else if (drawerMode === 'edit' && editingUser) {
        await adminApi.updateUser(editingUser.id, {
          name,
          phone,
          businessName: businessName || null,
          city: city || null,
          role,
        });
        onChanged(`Updated user ${name}!`);
      }
      setDrawerMode(null);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to save user.');
    } finally {
      setSaving(false);
    }
  };

  const handleQuickRoleToggle = async (u: AdminUserRow) => {
    const nextRole: Role = u.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await adminApi.updateUserRole(u.id, nextRole);
      onChanged(`${u.email} role changed → ${nextRole}`);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Role update failed.');
    }
  };

  const handleDelete = async (u: AdminUserRow) => {
    if (!confirm(`Permanently delete user "${u.name}" (${u.email})?`)) return;
    try {
      const res = await adminApi.deleteUser(u.id);
      onChanged(res.message);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Delete failed.');
    }
  };

  const handleExport = () => {
    exportToCsv(
      'decom-users.csv',
      filtered.map((u) => ({
        Name: u.name,
        Email: u.email,
        Phone: u.phone,
        Business: u.businessName || '',
        City: u.city || '',
        Role: u.role,
        Orders: u._count.orders,
        OEMQuotes: u._count.oemQuotes,
        Joined: new Date(u.createdAt).toLocaleDateString(),
      }))
    );
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-card flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search name, email, phone, city..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold">
            {(['ALL', 'ADMIN', 'USER'] as const).map((r) => (
              <button
                key={r}
                onClick={() => setRoleFilter(r)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  roleFilter === r
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {r}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
          >
            <UserPlus className="w-4 h-4" /> Create User / Admin
          </button>
        </div>
      </div>

      {/* Users Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">User</th>
              <th className="px-4 py-3.5">Contact & Location</th>
              <th className="px-4 py-3.5">Activity</th>
              <th className="px-4 py-3.5">Role (RBAC)</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((u) => {
              const isSelf = u.id === currentAdminId;
              return (
                <tr key={u.id} className="hover:bg-slate-50/70">
                  <td className="px-5 py-3.5">
                    <div className="flex items-center gap-3">
                      <span
                        className={`w-9 h-9 rounded-xl font-heading font-extrabold text-xs flex items-center justify-center shrink-0 ${
                          u.role === 'ADMIN'
                            ? 'bg-slate-950 text-amber-400'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.name.slice(0, 1).toUpperCase()}
                      </span>
                      <div>
                        <div className="font-bold text-slate-950 flex items-center gap-1.5">
                          {u.name}
                          {isSelf && (
                            <span className="px-1.5 py-0.5 rounded bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                              You
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-slate-500">{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-medium text-slate-800">{u.phone}</div>
                    <div className="text-[11px] text-slate-500">
                      {[u.businessName, u.city].filter(Boolean).join(' • ') || '—'}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-800">
                      {u._count.orders} order(s)
                    </div>
                    <div className="text-[11px] text-slate-400">
                      {u._count.oemQuotes} OEM quote(s)
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <span
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        u.role === 'ADMIN'
                          ? 'bg-amber-50 text-amber-800 border-amber-200'
                          : 'bg-slate-100 text-slate-700 border-slate-200'
                      }`}
                    >
                      <Shield className="w-3 h-3" /> {u.role}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      <button
                        onClick={() => openEdit(u)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
                      >
                        <Edit3 className="w-3.5 h-3.5" /> Edit
                      </button>
                      {!isSelf && (
                        <>
                          <button
                            onClick={() => handleQuickRoleToggle(u)}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 border border-amber-200 text-amber-900 text-[11px] font-bold"
                          >
                            {u.role === 'ADMIN' ? 'Demote' : 'Promote Admin'}
                          </button>
                          <button
                            onClick={() => handleDelete(u)}
                            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                            title="Delete user"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Create / Edit User Slide-Over Drawer */}
      <AnimatePresence>
        {drawerMode && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerMode(null)}
              className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <h3 className="font-heading font-extrabold text-lg text-slate-950">
                  {drawerMode === 'create' ? 'Create New Account' : 'Edit User Account'}
                </h3>
                <button
                  onClick={() => setDrawerMode(null)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                id="user-drawer-form"
                onSubmit={handleSubmit}
                className="flex-1 overflow-y-auto p-6 space-y-4 text-xs"
              >
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Full Name *
                  </label>
                  <input
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    disabled={drawerMode === 'edit'}
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 disabled:opacity-60"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Mobile Number *
                  </label>
                  <input
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="+91 98251 12345"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                  />
                </div>

                {drawerMode === 'create' && (
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Initial Password * (8+ chars, letters & numbers)
                    </label>
                    <input
                      required
                      minLength={8}
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="Hashed with bcrypt (12 rounds)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      City (Optional)
                    </label>
                    <input
                      value={city}
                      onChange={(e) => setCity(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Business (Optional)
                    </label>
                    <input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Account Role (RBAC)
                  </label>
                  <select
                    disabled={editingUser?.id === currentAdminId}
                    value={role}
                    onChange={(e) => setRole(e.target.value as Role)}
                    className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-bold"
                  >
                    <option value="USER">USER (Storefront Buyer)</option>
                    <option value="ADMIN">ADMIN (Full Operations Access)</option>
                  </select>
                </div>
              </form>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDrawerMode(null)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  form="user-drawer-form"
                  type="submit"
                  disabled={saving}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-amber-600 text-white text-xs font-bold"
                >
                  {saving
                    ? 'Saving...'
                    : drawerMode === 'create'
                      ? 'Create Account'
                      : 'Save Changes'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
