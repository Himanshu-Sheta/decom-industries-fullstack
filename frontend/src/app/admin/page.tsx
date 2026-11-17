'use client';

import React, { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldCheck,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  FileText,
  Lock,
  RefreshCw,
  ArrowLeft,
  Plus,
  Search,
  LogOut,
  Menu,
  X,
  CheckCircle2,
  AlertCircle,
  Activity,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { adminApi, productsApi, ordersApi, oemApi, ApiError } from '@/lib/api';
import type {
  AdminStats,
  AdminUserRow,
  HealthResponse,
  OemQuote,
  Order,
  Product,
} from '@/lib/types';
import { AuthModal } from '@/components/AuthModal';
import { OverviewTab } from '@/components/admin/OverviewTab';
import { ProductsTab } from '@/components/admin/ProductsTab';
import { OrdersTab } from '@/components/admin/OrdersTab';
import { OemTab } from '@/components/admin/OemTab';
import { UsersTab } from '@/components/admin/UsersTab';
import { SecurityTab } from '@/components/admin/SecurityTab';

type AdminTab = 'overview' | 'products' | 'orders' | 'oem' | 'users' | 'security';

export default function AdminDashboardPage() {
  const { user, isLoading, openAuthModal, logout } = useAuth();

  const [tab, setTab] = useState<AdminTab>('overview');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [globalSearch, setGlobalSearch] = useState('');
  const [triggerAddCount, setTriggerAddCount] = useState(0);

  const [stats, setStats] = useState<AdminStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<Order[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<OemQuote[]>([]);
  const [users, setUsers] = useState<AdminUserRow[]>([]);
  const [health, setHealth] = useState<HealthResponse | null>(null);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  const [busy, setBusy] = useState(false);
  const [toast, setToast] = useState<{ type: 'ok' | 'err'; text: string } | null>(null);

  const pushToast = useCallback((type: 'ok' | 'err', text: string) => {
    setToast({ type, text });
    setTimeout(() => setToast(null), 3500);
  }, []);

  const loadAllAdminData = useCallback(async () => {
    setBusy(true);
    try {
      const [statsRes, prodRes, ordRes, oemRes, usrRes, healthRes] =
        await Promise.all([
          adminApi.stats(),
          productsApi.adminListAll(),
          ordersApi.adminListAll(),
          oemApi.adminListAll(),
          adminApi.users(),
          adminApi.health(),
        ]);
      setStats(statsRes.stats);
      setRecentOrders(statsRes.recentOrders);
      setProducts(prodRes.products);
      setOrders(ordRes.orders);
      setQuotes(oemRes.quotes);
      setUsers(usrRes.users);
      setHealth(healthRes);
    } catch (err) {
      pushToast(
        'err',
        err instanceof ApiError ? err.message : 'Failed to load admin console data.'
      );
    } finally {
      setBusy(false);
    }
  }, [pushToast]);

  useEffect(() => {
    if (user?.role === 'ADMIN') {
      loadAllAdminData();
    }
  }, [user, loadAllAdminData]);

  const handleDataChanged = useCallback(
    (msg: string) => {
      pushToast('ok', msg);
      loadAllAdminData();
    },
    [pushToast, loadAllAdminData]
  );

  const handleQuickRestock = async (
    productId: string,
    currentStock: number,
    delta: number,
    sku: string
  ) => {
    try {
      await productsApi.update(productId, { stock: currentStock + delta });
      handleDataChanged(`Restocked ${sku} (+${delta} units)`);
    } catch (err) {
      pushToast('err', err instanceof ApiError ? err.message : 'Restock failed.');
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#F8F7F4] text-sm text-slate-500">
        Verifying Admin session cookie...
      </div>
    );
  }

  // RBAC Guard Screen
  if (!user || user.role !== 'ADMIN') {
    return (
      <div className="min-h-screen bg-[#F8F7F4] flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-white rounded-3xl border border-slate-200 p-8 text-center shadow-soft space-y-4">
          <div className="w-14 h-14 rounded-2xl bg-amber-50 border border-amber-200 flex items-center justify-center mx-auto">
            <Lock className="w-6 h-6 text-amber-600" />
          </div>
          <h1 className="font-heading text-2xl font-extrabold text-slate-950">
            Admin Console Locked
          </h1>
          <p className="text-xs text-slate-600 leading-relaxed">
            {user
              ? `Signed in as ${user.email} (${user.role}). Only ADMIN accounts can access Decom Operations Console (enforced by Express requireRole('ADMIN')).`
              : 'Sign in with your ADMIN account (himanshusheta2022@gmail.com) to manage products, orders, OEM quotes, and users.'}
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
              Back to Storefront
            </Link>
          </div>
        </div>
        <AuthModal />
      </div>
    );
  }

  const navItems: {
    id: AdminTab;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    badge?: number;
    badgeTone?: string;
  }[] = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    {
      id: 'products',
      label: 'Products & Stock',
      icon: Package,
      badge: products.length,
    },
    {
      id: 'orders',
      label: 'Orders & Invoices',
      icon: ShoppingCart,
      badge: stats?.pendingOrders || undefined,
      badgeTone: 'bg-amber-500 text-slate-950',
    },
    {
      id: 'oem',
      label: 'Custom OEM Leads',
      icon: FileText,
      badge: stats?.newOemQuotes || undefined,
      badgeTone: 'bg-emerald-500 text-slate-950',
    },
    { id: 'users', label: 'Users & Roles', icon: Users, badge: users.length },
    { id: 'security', label: 'System & Security', icon: Activity },
  ];

  const pageMeta: Record<AdminTab, { title: string; subtitle: string }> = {
    overview: {
      title: 'Executive Overview',
      subtitle: 'Live revenue, fulfillment pipeline, stock alerts & OEM activity',
    },
    products: {
      title: 'Products & Inventory',
      subtitle: 'Create, edit, restock, feature, archive, or export your catalog',
    },
    orders: {
      title: 'Orders & GST Invoices',
      subtitle: 'Advance fulfillment stages, inspect customer addresses, and print invoices',
    },
    oem: {
      title: 'Custom OEM Studio Leads',
      subtitle: 'Track bespoke packaging requests and reply via Email or WhatsApp',
    },
    users: {
      title: 'Users & Role-Based Access',
      subtitle: 'Create team admins or buyers, edit profiles, and manage permissions',
    },
    security: {
      title: 'System Health & Security Shield',
      subtitle: 'Live Express API telemetry, PostgreSQL status, and active security controls',
    },
  };

  const SidebarContent = (
    <div className="h-full flex flex-col bg-slate-950 text-slate-200">
      {/* Brand */}
      <div className="px-5 h-16 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm">
            <ShieldCheck className="w-5 h-5 text-white" />
          </div>
          <div className="leading-tight">
            <div className="font-heading font-extrabold text-sm text-white tracking-tight">
              DECOM <span className="text-amber-400">ADMIN</span>
            </div>
            <div className="text-[10px] text-slate-400">Operations Console</div>
          </div>
        </div>
        <button
          onClick={() => setMobileMenuOpen(false)}
          className="lg:hidden p-1.5 text-slate-400 hover:text-white"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Nav Links */}
      <nav className="flex-1 p-3.5 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const active = tab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => {
                setTab(item.id);
                setMobileMenuOpen(false);
              }}
              className={`w-full px-3.5 py-2.5 rounded-xl flex items-center justify-between text-xs font-bold transition-all ${
                active
                  ? 'bg-amber-500 text-slate-950 shadow-sm'
                  : 'text-slate-300 hover:bg-slate-900 hover:text-white'
              }`}
            >
              <span className="flex items-center gap-2.5">
                <Icon className="w-4 h-4" />
                {item.label}
              </span>
              {item.badge !== undefined && (
                <span
                  className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                    active
                      ? 'bg-slate-950 text-amber-400'
                      : item.badgeTone || 'bg-slate-800 text-slate-300'
                  }`}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </nav>

      {/* Bottom Admin Card */}
      <div className="p-4 border-t border-slate-800/80 space-y-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-slate-800 text-amber-400 font-heading font-extrabold text-xs flex items-center justify-center shrink-0">
            {user.name.slice(0, 1).toUpperCase()}
          </div>
          <div className="min-w-0">
            <div className="text-xs font-bold text-white truncate">{user.name}</div>
            <div className="text-[10px] text-slate-400 truncate">{user.email}</div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <Link
            href="/"
            className="px-2.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-slate-200 text-[11px] font-bold inline-flex items-center justify-center gap-1"
          >
            <ArrowLeft className="w-3.5 h-3.5" /> Store
          </Link>
          <button
            onClick={logout}
            className="px-2.5 py-2 rounded-xl bg-rose-950/60 hover:bg-rose-900/70 text-rose-200 text-[11px] font-bold inline-flex items-center justify-center gap-1"
          >
            <LogOut className="w-3.5 h-3.5" /> Logout
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#F8F7F4] flex">
      {/* Desktop Fixed Sidebar */}
      <aside className="hidden lg:block w-64 shrink-0 sticky top-0 h-screen">
        {SidebarContent}
      </aside>

      {/* Mobile Slide Sidebar */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setMobileMenuOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/60 lg:hidden"
            />
            <motion.aside
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 left-0 bottom-0 z-50 w-64 lg:hidden"
            >
              {SidebarContent}
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Command Bar */}
        <header className="sticky top-0 z-30 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 px-4 sm:px-6 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 flex-1 max-w-md">
            <button
              onClick={() => setMobileMenuOpen(true)}
              className="lg:hidden p-2 rounded-xl hover:bg-slate-100 text-slate-700"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                value={globalSearch}
                onChange={(e) => setGlobalSearch(e.target.value)}
                placeholder="Quick search products, orders, users..."
                className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200/80 text-emerald-800 text-[11px] font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              DB {health?.database || 'Connected'}
            </span>

            <button
              onClick={loadAllAdminData}
              disabled={busy}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${busy ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>

            <button
              onClick={() => {
                setTab('products');
                setTriggerAddCount((c) => c + 1);
              }}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
            >
              <Plus className="w-4 h-4" />
              <span className="hidden sm:inline">New Product</span>
            </button>
          </div>
        </header>

        {/* Page Body */}
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto space-y-6">
          {/* Section Title */}
          <div>
            <h1 className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950">
              {pageMeta[tab].title}
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
              {pageMeta[tab].subtitle}
            </p>
          </div>

          {/* Animated Tab Views */}
          <AnimatePresence mode="wait">
            <motion.div
              key={tab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.2 }}
            >
              {tab === 'overview' && stats && (
                <OverviewTab
                  stats={stats}
                  recentOrders={recentOrders}
                  quotes={quotes}
                  onQuickRestock={handleQuickRestock}
                  onInspectOrder={(order) => {
                    setSelectedOrder(order);
                    setTab('orders');
                  }}
                  onNavigateTab={(t) => setTab(t)}
                />
              )}

              {tab === 'products' && (
                <ProductsTab
                  products={products}
                  globalSearch={globalSearch}
                  onChanged={handleDataChanged}
                  onError={(m) => pushToast('err', m)}
                  triggerAddCount={triggerAddCount}
                />
              )}

              {tab === 'orders' && (
                <OrdersTab
                  orders={orders}
                  globalSearch={globalSearch}
                  selectedOrder={selectedOrder}
                  onSelectOrder={setSelectedOrder}
                  onChanged={handleDataChanged}
                  onError={(m) => pushToast('err', m)}
                />
              )}

              {tab === 'oem' && (
                <OemTab
                  quotes={quotes}
                  globalSearch={globalSearch}
                  onChanged={handleDataChanged}
                  onError={(m) => pushToast('err', m)}
                />
              )}

              {tab === 'users' && (
                <UsersTab
                  users={users}
                  currentAdminId={user.id}
                  globalSearch={globalSearch}
                  onChanged={handleDataChanged}
                  onError={(m) => pushToast('err', m)}
                />
              )}

              {tab === 'security' && (
                <SecurityTab health={health} adminUser={user} />
              )}
            </motion.div>
          </AnimatePresence>
        </main>
      </div>

      {/* Floating Toast Notification */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.95 }}
            className={`fixed bottom-5 right-5 z-50 px-4 py-3 rounded-2xl shadow-xl border flex items-center gap-2.5 text-xs font-bold ${
              toast.type === 'ok'
                ? 'bg-slate-950 text-white border-slate-800'
                : 'bg-rose-600 text-white border-rose-500'
            }`}
          >
            {toast.type === 'ok' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
            ) : (
              <AlertCircle className="w-4 h-4 text-white shrink-0" />
            )}
            {toast.text}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
