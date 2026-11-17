'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Plus,
  Trash2,
  ArrowLeft,
  RefreshCw,
  Lock,
  IndianRupee,
  AlertTriangle,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, productsApi, ordersApi, oemApi, ApiError } from '@/lib/api';
import type {
  AdminStats,
  AdminUserRow,
  OemQuote,
  Order,
  OrderStatus,
  Product,
  QuoteStatus,
  Role,
} from '@/lib/types';
import { AuthModal } from '@/components/AuthModal';

type AdminTab = 'overview' | 'products' | 'orders' | 'oem' | 'users';

const ORDER_STATUSES: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_PRODUCTION',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
];

const QUOTE_STATUSES: QuoteStatus[] = [
  'NEW',
  'REVIEWED',
  'QUOTED',
  'CONVERTED',
  'CLOSED',
];

export default function AdminDashboardPage() {
  const { user, isLoading, openAuthModal } = useAuth();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<OemQuote[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [busy, setBusy] = useState(false);
  const [banner, setBanner] = useState<string | null>(null);

  // Add New Product Form State
  const [showNewProduct, setShowNewProduct] = useState(false);
  const [newProd, setNewProd] = useState({
    name: '',
    slug: '',
    sku: '',
    category: 'PVC Saree Covers',
    tagline: '',
    description: '',
    materialSpec: '150 Micron Virgin Crystal PVC',
    dimensions: '42 × 35 × 5 cm',
    moq: 5,
    priceINR: 250,
    samplePriceINR: 300,
    stock: 100,
    imageUrl: '/images/product-saree-organizer.jpg',
    isFeatured: false,
    isActive: true,
  });

  const loadAllAdminData = useCallback(async () => {
    setBusy(true);
    try {
      const [statsRes, prodRes, ordRes, oemRes, usrRes] = await Promise.all([
        adminApi.stats(),
        productsApi.adminListAll(),
        ordersApi.adminListAll(),
        oemApi.adminListAll(),
        adminApi.users(),
      ]);
      setStats(statsRes.stats);
      setProducts(prodRes.products);
      setOrders(ordRes.orders);
      setQuotes(oemRes.quotes);
      setUsers(usrRes.users);
    } catch (err) {
      setBanner(err instanceof ApiError ? err.message : 'Failed to load admin data.');
    } finally {
      setBusy(false);
    }
  }, []);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAllAdminData();
    }
  }, [user, loadAllAdminData]);

  const showToast = (msg: string) => {
    setBanner(msg);
    setTimeout(() => setBanner(null), 3000);
  };

  const handleCreateProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await productsApi.create(newProd);
      setShowNewProduct(false);
      setNewProd((prev) => ({
        ...prev,
        name: '',
        slug: '',
        sku: '',
        tagline: '',
        description: '',
      }));
      showToast('Product created in PostgreSQL!');
      loadAllAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Failed to create product.');
    }
  };

  const handleQuickStockAdd = async (p: Product, delta: number) => {
    try {
      await productsApi.update(p.id, { stock: Math.max(0, p.stock + delta) });
      showToast(`Updated stock for ${p.sku}`);
      loadAllAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Stock update failed.');
    }
  };

  const handleDeleteProduct = async (p: Product) => {
    if (!confirm(`Delete or archive "${p.name}"?`)) return;
    try {
      const res = await productsApi.remove(p.id);
      showToast(res.message);
      loadAllAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Delete failed.');
    }
  };

  const handleOrderStatus = async (orderId: string, status: OrderStatus) => {
    try {
      await ordersApi.updateStatus(orderId, status);
      showToast(`Order status changed to ${status}`);
      loadAllAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Status update failed.');
    }
  };

  const handleQuoteStatus = async (quoteId: string, status: QuoteStatus) => {
    try {
      await oemApi.updateStatus(quoteId, status);
      showToast(`OEM quote updated to ${status}`);
      loadAllAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Quote update failed.');
    }
  };

  const handleRoleToggle = async (target: AdminUserRow) => {
    const nextRole: Role = target.role === 'ADMIN' ? 'USER' : 'ADMIN';
    try {
      await adminApi.updateUserRole(target.id, nextRole);
      showToast(`Updated ${target.email} → ${nextRole}`);
      loadAllAdminData();
    } catch (err) {
      showToast(err instanceof ApiError ? err.message : 'Role update failed.');
    }
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAF9F6] text-sm text-slate-500">
        Verifying session cookie...
      </div>
    );
  }

  // RBAC Guard UI (Backed by real backend 401/403 enforcement!)
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#FAF9F6] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-soft space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-950">
            Admin Access Required
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {user
              ? `You are signed in as ${user.email} (${user.role}). Only ADMIN accounts can access the management console (enforced by Express requireRole('ADMIN')).`
              : 'Sign in with an ADMIN account (e.g. himanshusheta2022@gmail.com) to manage products, orders, OEM quotes, and users.'}
          </p>
          <div className="flex flex-col sm:flex-row gap-2.5 pt-2">
            <button
              onClick={() => openAuthModal('login')}
              className="flex-1 py-3 rounded-xl bg-slate-950 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
            >
              Sign In as Admin
            </button>
            <Link
              href="/"
              className="flex-1 py-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
            >
              Back to Store
            </Link>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAF9F6] flex flex-col">
      {/* Top Admin Header */}
      <header className="sticky top-0 z-30 bg-slate-950 text-white border-b border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <ShieldCheck className="w-6 h-6 text-amber-400" />
            <div>
              <h1 className="font-heading font-extrabold text-sm sm:text-base tracking-tight">
                Decom Industries — Admin Console
              </h1>
              <p className="text-[11px] text-slate-400">
                Signed in as {user.name} ({user.email})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={loadAllAdminData}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
              Refresh
            </button>
            <Link
              href="/"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-slate-950 text-xs font-bold"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              View Storefront
            </Link>
          </div>
        </div>
      </header>

      <div className="max-w-7xl w-full mx-auto px-4 sm:px-6 py-8 space-y-6">
        {banner && (
          <div className="px-4 py-3 rounded-2xl bg-slate-900 text-amber-300 text-xs font-semibold">
            {banner}
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex flex-wrap gap-2">
          {(
            [
              { id: 'overview', label: 'Overview', icon: LayoutDashboard },
              { id: 'products', label: `Products (${products.length})`, icon: Package },
              { id: 'orders', label: `Orders (${orders.length})`, icon: ShoppingCart },
              { id: 'oem', label: `OEM Quotes (${quotes.length})`, icon: FileText },
              { id: 'users', label: `Users (${users.length})`, icon: Users },
            ] as const
          ).map((t) => {
            const Icon = t.icon;
            const active = tab === t.id;
            return (
              <button
                key={t.id}
                onClick={() => setTab(t.id)}
                className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                  active
                    ? 'bg-slate-950 text-white shadow-sm'
                    : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-950'
                }`}
              >
                <Icon className="w-4 h-4" />
                {t.label}
              </button>
            );
          })}
        </div>

        {/* TAB 1: OVERVIEW */}
        {tab === 'overview' && stats && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {[
                {
                  label: 'Total Revenue',
                  value: `₹${stats.totalRevenueINR.toLocaleString('en-IN')}`,
                  sub: `${stats.totalOrders} total orders`,
                  icon: IndianRupee,
                },
                {
                  label: 'Pending Orders',
                  value: String(stats.pendingOrders),
                  sub: 'Awaiting Surat dispatch',
                  icon: ShoppingCart,
                },
                {
                  label: 'Active Products',
                  value: String(stats.totalProducts),
                  sub: `${stats.lowStockProducts} low-stock SKUs`,
                  icon: Package,
                },
                {
                  label: 'Users & OEM Leads',
                  value: String(stats.totalUsers),
                  sub: `${stats.newOemQuotes} new OEM quotes`,
                  icon: Users,
                },
              ].map((kpi, idx) => {
                const Icon = kpi.icon;
                return (
                  <motion.div
                    key={kpi.label}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    className="rounded-3xl bg-white border border-slate-200 p-5 shadow-card"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-semibold text-slate-500">
                        {kpi.label}
                      </span>
                      <Icon className="w-4 h-4 text-amber-600" />
                    </div>
                    <div className="font-heading text-3xl font-extrabold text-slate-950 mt-2">
                      {kpi.value}
                    </div>
                    <div className="text-[11px] text-slate-500 mt-1">{kpi.sub}</div>
                  </motion.div>
                );
              })}
            </div>

            {stats.lowStockProducts > 0 && (
              <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-center gap-3 text-xs text-amber-900 font-semibold">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0" />
                {stats.lowStockProducts} product(s) have 25 or fewer units left in stock.
                Switch to the Products tab to restock.
              </div>
            )}
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {tab === 'products' && (
          <div className="space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-heading text-xl font-extrabold text-slate-950">
                Product Inventory (PostgreSQL)
              </h2>
              <button
                onClick={() => setShowNewProduct((v) => !v)}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold"
              >
                <Plus className="w-4 h-4" />
                {showNewProduct ? 'Close Form' : 'Add Product'}
              </button>
            </div>

            {showNewProduct && (
              <form
                onSubmit={handleCreateProduct}
                className="rounded-3xl bg-white border border-slate-200 p-6 shadow-card grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs"
              >
                <input
                  required
                  placeholder="Product Name *"
                  value={newProd.name}
                  onChange={(e) => {
                    const name = e.target.value;
                    const slug = name
                      .toLowerCase()
                      .replace(/[^a-z0-9]+/g, '-')
                      .replace(/(^-|-$)/g, '');
                    setNewProd((p) => ({ ...p, name, slug }));
                  }}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  required
                  placeholder="Slug (auto-filled) *"
                  value={newProd.slug}
                  onChange={(e) => setNewProd((p) => ({ ...p, slug: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
                <input
                  required
                  placeholder="SKU (e.g. DCM-NEW-01) *"
                  value={newProd.sku}
                  onChange={(e) => setNewProd((p) => ({ ...p, sku: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                />
                <input
                  required
                  placeholder="Category *"
                  value={newProd.category}
                  onChange={(e) => setNewProd((p) => ({ ...p, category: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  required
                  placeholder="Tagline *"
                  value={newProd.tagline}
                  onChange={(e) => setNewProd((p) => ({ ...p, tagline: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-2"
                />
                <input
                  required
                  placeholder="Material Spec *"
                  value={newProd.materialSpec}
                  onChange={(e) =>
                    setNewProd((p) => ({ ...p, materialSpec: e.target.value }))
                  }
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  required
                  placeholder="Dimensions *"
                  value={newProd.dimensions}
                  onChange={(e) =>
                    setNewProd((p) => ({ ...p, dimensions: e.target.value }))
                  }
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  required
                  placeholder="Image URL *"
                  value={newProd.imageUrl}
                  onChange={(e) => setNewProd((p) => ({ ...p, imageUrl: e.target.value }))}
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  required
                  type="number"
                  min={1}
                  placeholder="Price INR *"
                  value={newProd.priceINR}
                  onChange={(e) =>
                    setNewProd((p) => ({ ...p, priceINR: Number(e.target.value) }))
                  }
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  required
                  type="number"
                  min={0}
                  placeholder="Stock *"
                  value={newProd.stock}
                  onChange={(e) =>
                    setNewProd((p) => ({ ...p, stock: Number(e.target.value) }))
                  }
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
                <input
                  required
                  type="number"
                  min={1}
                  placeholder="Sample Price INR *"
                  value={newProd.samplePriceINR}
                  onChange={(e) =>
                    setNewProd((p) => ({
                      ...p,
                      samplePriceINR: Number(e.target.value),
                    }))
                  }
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                />
                <textarea
                  required
                  rows={2}
                  placeholder="Detailed Product Description *"
                  value={newProd.description}
                  onChange={(e) =>
                    setNewProd((p) => ({ ...p, description: e.target.value }))
                  }
                  className="px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 sm:col-span-3"
                />
                <button
                  type="submit"
                  className="sm:col-span-3 py-3 rounded-xl bg-slate-950 hover:bg-amber-600 text-white font-bold"
                >
                  Save Product to PostgreSQL
                </button>
              </form>
            )}

            <div className="rounded-3xl bg-white border border-slate-200 overflow-x-auto shadow-card">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                  <tr>
                    <th className="px-5 py-3.5">Product</th>
                    <th className="px-4 py-3.5">SKU</th>
                    <th className="px-4 py-3.5">Price</th>
                    <th className="px-4 py-3.5">Stock</th>
                    <th className="px-4 py-3.5">Status</th>
                    <th className="px-5 py-3.5 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-bold text-slate-900">
                        {p.name}
                        <div className="text-[11px] font-normal text-slate-500">
                          {p.category}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 font-mono text-slate-600">{p.sku}</td>
                      <td className="px-4 py-3.5 font-bold">
                        ₹{p.priceINR.toLocaleString('en-IN')}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="inline-flex items-center gap-2">
                          <span className="font-bold">{p.stock}</span>
                          <button
                            onClick={() => handleQuickStockAdd(p, 50)}
                            className="px-2 py-0.5 rounded bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-[10px] font-bold"
                          >
                            +50
                          </button>
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                            p.isActive
                              ? 'bg-emerald-50 text-emerald-700'
                              : 'bg-slate-200 text-slate-600'
                          }`}
                        >
                          {p.isActive ? 'ACTIVE' : 'ARCHIVED'}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <button
                          onClick={() => handleDeleteProduct(p)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                          title="Delete or Archive"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: ORDERS */}
        {tab === 'orders' && (
          <div className="rounded-3xl bg-white border border-slate-200 overflow-x-auto shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Order #</th>
                  <th className="px-4 py-3.5">Customer</th>
                  <th className="px-4 py-3.5">Items</th>
                  <th className="px-4 py-3.5">Grand Total</th>
                  <th className="px-5 py-3.5">Fulfillment Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {orders.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No orders yet — place an order from the storefront to see it live
                      here!
                    </td>
                  </tr>
                ) : (
                  orders.map((o) => (
                    <tr key={o.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {o.orderNumber}
                        <div className="text-[10px] font-sans font-normal text-slate-400">
                          {new Date(o.createdAt).toLocaleString()}
                        </div>
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{o.user?.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {o.city} • {o.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        {o.items.map((i) => `${i.quantity}× ${i.product.sku}`).join(', ')}
                      </td>
                      <td className="px-4 py-3.5 font-extrabold text-slate-950">
                        ₹{o.grandTotalINR.toLocaleString('en-IN')}
                      </td>
                      <td className="px-5 py-3.5">
                        <select
                          value={o.status}
                          onChange={(e) =>
                            handleOrderStatus(o.id, e.target.value as OrderStatus)
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs"
                        >
                          {ORDER_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 4: OEM QUOTES */}
        {tab === 'oem' && (
          <div className="rounded-3xl bg-white border border-slate-200 overflow-x-auto shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">Quote #</th>
                  <th className="px-4 py-3.5">Client</th>
                  <th className="px-4 py-3.5">Specification</th>
                  <th className="px-4 py-3.5">Qty</th>
                  <th className="px-5 py-3.5">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {quotes.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-5 py-10 text-center text-slate-500">
                      No OEM quote inquiries yet.
                    </td>
                  </tr>
                ) : (
                  quotes.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-50/70">
                      <td className="px-5 py-3.5 font-mono font-bold text-slate-900">
                        {q.quoteNumber}
                      </td>
                      <td className="px-4 py-3.5">
                        <div className="font-bold text-slate-900">{q.name}</div>
                        <div className="text-[11px] text-slate-500">
                          {q.email} • {q.phone}
                        </div>
                      </td>
                      <td className="px-4 py-3.5 text-slate-600">
                        <strong>{q.productType}</strong> ({q.materialMicron}) —{' '}
                        {q.customSize}
                      </td>
                      <td className="px-4 py-3.5 font-bold">{q.quantity}</td>
                      <td className="px-5 py-3.5">
                        <select
                          value={q.status}
                          onChange={(e) =>
                            handleQuoteStatus(q.id, e.target.value as QuoteStatus)
                          }
                          className="px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200 font-bold text-xs"
                        >
                          {QUOTE_STATUSES.map((s) => (
                            <option key={s} value={s}>
                              {s}
                            </option>
                          ))}
                        </select>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        )}

        {/* TAB 5: USERS */}
        {tab === 'users' && (
          <div className="rounded-3xl bg-white border border-slate-200 overflow-x-auto shadow-card">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 uppercase text-[11px]">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-4 py-3.5">Phone / City</th>
                  <th className="px-4 py-3.5">Orders</th>
                  <th className="px-4 py-3.5">Role</th>
                  <th className="px-5 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70">
                    <td className="px-5 py-3.5">
                      <div className="font-bold text-slate-900">{u.name}</div>
                      <div className="text-[11px] text-slate-500">{u.email}</div>
                    </td>
                    <td className="px-4 py-3.5 text-slate-600">
                      {u.phone} {u.city ? `• ${u.city}` : ''}
                    </td>
                    <td className="px-4 py-3.5 font-bold">{u._count.orders}</td>
                    <td className="px-4 py-3.5">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                          u.role === 'ADMIN'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-slate-100 text-slate-700'
                        }`}
                      >
                        {u.role}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u.id !== user.id ? (
                        <button
                          onClick={() => handleRoleToggle(u)}
                          className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
                        >
                          Make {u.role === 'ADMIN' ? 'USER' : 'ADMIN'}
                        </button>
                      ) : (
                        <span className="text-[11px] text-slate-400">You</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
