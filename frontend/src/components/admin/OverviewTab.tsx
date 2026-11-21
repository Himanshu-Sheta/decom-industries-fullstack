'use client';

import React from 'react';
import { motion } from 'framer-motion';
import {
  IndianRupee,
  ShoppingCart,
  Package,
  Users,
  AlertTriangle,
  ArrowUpRight,
  FileText,
  TrendingUp,
  Plus,
} from 'lucide-react';
import type { AdminStats, Order, OemQuote, OrderStatus } from '@/lib/types';
import { formatINR, ORDER_STATUS_META } from './adminUtils';

interface OverviewTabProps {
  stats: AdminStats;
  recentOrders: Order[];
  quotes: OemQuote[];
  onQuickRestock: (productId: string, currentStock: number, delta: number, sku: string) => void;
  onInspectOrder: (order: Order) => void;
  onNavigateTab: (tab: 'products' | 'orders' | 'oem' | 'users') => void;
}

const PIPELINE_ORDER: OrderStatus[] = [
  'PENDING',
  'CONFIRMED',
  'IN_PRODUCTION',
  'READY_FOR_PICKUP',
  'PICKED_UP',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
];

export function OverviewTab({
  stats,
  recentOrders,
  quotes,
  onQuickRestock,
  onInspectOrder,
  onNavigateTab,
}: OverviewTabProps) {
  const kpis = [
    {
      label: 'Gross Revenue (incl. GST)',
      value: formatINR(stats.totalRevenueINR),
      sub: `GST collected: ${formatINR(stats.totalGstINR)}`,
      icon: IndianRupee,
      accent: 'bg-emerald-50 text-emerald-700 border-emerald-200/70',
      onClick: () => onNavigateTab('orders'),
    },
    {
      label: 'Total Orders',
      value: String(stats.totalOrders),
      sub:
        stats.pendingOrders > 0
          ? `${stats.pendingOrders} pending dispatch`
          : 'All orders processed',
      icon: ShoppingCart,
      accent: 'bg-amber-50 text-amber-700 border-amber-200/70',
      onClick: () => onNavigateTab('orders'),
    },
    {
      label: 'Active Catalog SKUs',
      value: String(stats.totalProducts),
      sub:
        stats.lowStockProducts > 0
          ? `${stats.lowStockProducts} SKU(s) ≤ 50 units`
          : 'Healthy stock levels',
      icon: Package,
      accent: 'bg-sky-50 text-sky-700 border-sky-200/70',
      onClick: () => onNavigateTab('products'),
    },
    {
      label: 'Registered Users',
      value: String(stats.totalUsers),
      sub: `${stats.newOemQuotes} new OEM lead(s)`,
      icon: Users,
      accent: 'bg-indigo-50 text-indigo-700 border-indigo-200/70',
      onClick: () => onNavigateTab('users'),
    },
  ];

  const maxCatRevenue = Math.max(
    1,
    ...stats.revenueByCategory.map((c) => c.revenueINR)
  );

  return (
    <div className="space-y-6">
      {/* Top 4 KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
        {kpis.map((kpi, idx) => {
          const Icon = kpi.icon;
          return (
            <motion.button
              key={kpi.label}
              type="button"
              onClick={kpi.onClick}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              whileHover={{ y: -3 }}
              className="text-left rounded-2xl bg-white border border-slate-200/80 p-5 shadow-card hover:shadow-soft transition-all group"
            >
              <div className="flex items-center justify-between">
                <div
                  className={`w-10 h-10 rounded-xl border flex items-center justify-center ${kpi.accent}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <ArrowUpRight className="w-4 h-4 text-slate-300 group-hover:text-slate-600 transition-colors" />
              </div>
              <div className="mt-4">
                <div className="text-xs font-semibold text-slate-500">{kpi.label}</div>
                <div className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums mt-1">
                  {kpi.value}
                </div>
                <div className="text-[11px] font-medium text-slate-500 mt-1">
                  {kpi.sub}
                </div>
              </div>
            </motion.button>
          );
        })}
      </div>

      {/* Analytics Row: Fulfillment Pipeline + Category Revenue */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Order Fulfillment Pipeline */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-950">
                Order Fulfillment Pipeline
              </h3>
              <p className="text-xs text-slate-500">
                Live order breakdown across Surat production & dispatch stages
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              Manage Orders →
            </button>
          </div>

          {/* Stacked Bar */}
          {stats.totalOrders > 0 ? (
            <div className="h-3.5 rounded-full bg-slate-100 overflow-hidden flex">
              {PIPELINE_ORDER.map((status) => {
                const count = stats.ordersByStatus[status] || 0;
                if (count === 0) return null;
                const pct = (count / stats.totalOrders) * 100;
                return (
                  <motion.div
                    key={status}
                    initial={{ width: 0 }}
                    animate={{ width: `${pct}%` }}
                    transition={{ duration: 0.6, ease: 'easeOut' }}
                    title={`${ORDER_STATUS_META[status].label}: ${count}`}
                    className={`h-full ${ORDER_STATUS_META[status].bar}`}
                  />
                );
              })}
            </div>
          ) : (
            <div className="h-3.5 rounded-full bg-slate-100" />
          )}

          {/* Status Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {PIPELINE_ORDER.map((status) => {
              const meta = ORDER_STATUS_META[status];
              const count = stats.ordersByStatus[status] || 0;
              return (
                <div
                  key={status}
                  className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 flex items-center justify-between"
                >
                  <div className="flex items-center gap-2">
                    <span className={`w-2.5 h-2.5 rounded-full ${meta.bar}`} />
                    <span className="text-xs font-semibold text-slate-700">
                      {meta.label}
                    </span>
                  </div>
                  <span className="font-heading font-extrabold text-sm text-slate-950 tabular-nums">
                    {count}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Revenue by Category */}
        <div className="lg:col-span-5 rounded-2xl bg-white border border-slate-200/80 p-6 shadow-card space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-heading font-extrabold text-base text-slate-950 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-amber-600" />
                Revenue by Category
              </h3>
              <p className="text-xs text-slate-500">
                Aggregated from confirmed & active PostgreSQL orders
              </p>
            </div>
          </div>

          {stats.revenueByCategory.length === 0 ? (
            <div className="py-10 text-center text-xs text-slate-400">
              Place an order on the storefront to see live category analytics here!
            </div>
          ) : (
            <div className="space-y-3.5">
              {stats.revenueByCategory.slice(0, 5).map((cat) => {
                const widthPct = Math.max(8, (cat.revenueINR / maxCatRevenue) * 100);
                return (
                  <div key={cat.category} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-800">{cat.category}</span>
                      <span className="font-mono font-bold text-slate-950">
                        {formatINR(cat.revenueINR)}{' '}
                        <span className="text-[10px] font-sans text-slate-400">
                          ({cat.units} units)
                        </span>
                      </span>
                    </div>
                    <div className="h-2.5 rounded-full bg-slate-100 overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${widthPct}%` }}
                        transition={{ duration: 0.6 }}
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 to-amber-600"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Bottom Action Row: Recent Orders + Low Stock Quick Restock + OEM Leads */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Recent Orders */}
        <div className="lg:col-span-7 rounded-2xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
          <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
            <h3 className="font-heading font-extrabold text-sm text-slate-950">
              Latest Customer Orders
            </h3>
            <button
              onClick={() => onNavigateTab('orders')}
              className="text-xs font-bold text-amber-700 hover:underline"
            >
              View All
            </button>
          </div>
          {recentOrders.length === 0 ? (
            <div className="p-10 text-center text-xs text-slate-400">
              No orders placed yet.
            </div>
          ) : (
            <div className="divide-y divide-slate-100">
              {recentOrders.map((o) => (
                <button
                  key={o.id}
                  type="button"
                  onClick={() => onInspectOrder(o)}
                  className="w-full px-6 py-3.5 flex items-center justify-between gap-4 hover:bg-slate-50/80 transition-colors text-left"
                >
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-slate-950">
                        {o.orderNumber}
                      </span>
                      <span
                        className={`px-2 py-0.5 rounded-full border text-[10px] font-bold ${ORDER_STATUS_META[o.status].badge}`}
                      >
                        {ORDER_STATUS_META[o.status].label}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {o.user?.name || 'Customer'} • {o.city} • {o.items.length} line item(s)
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="font-heading font-extrabold text-sm text-slate-950 tabular-nums">
                      {formatINR(o.grandTotalINR)}
                    </div>
                    <div className="text-[10px] text-slate-400">Click for invoice</div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Right Stack: Low Stock + Latest OEM Quotes */}
        <div className="lg:col-span-5 space-y-6">
          {/* Low Stock Quick Restock */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm text-slate-950 flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600" />
                Low Stock Monitor (≤ 50)
              </h3>
              <button
                onClick={() => onNavigateTab('products')}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                Inventory
              </button>
            </div>

            {stats.lowStockList.length === 0 ? (
              <div className="p-6 text-center text-xs text-emerald-700 font-semibold bg-emerald-50/40">
                All active products have healthy stock (&gt; 50 units)!
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {stats.lowStockList.map((item) => (
                  <div
                    key={item.id}
                    className="px-5 py-3 flex items-center justify-between gap-3"
                  >
                    <div className="flex items-center gap-3 min-w-0">
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-9 h-9 rounded-lg object-cover shrink-0 border border-slate-200"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 truncate">
                          {item.name}
                        </div>
                        <div className="text-[11px] font-mono text-rose-600 font-bold">
                          Only {item.stock} left • {item.sku}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={() =>
                        onQuickRestock(item.id, item.stock, 50, item.sku)
                      }
                      className="shrink-0 inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold"
                    >
                      <Plus className="w-3 h-3" /> 50
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Latest OEM Quotes */}
          <div className="rounded-2xl bg-white border border-slate-200/80 shadow-card overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3 className="font-heading font-extrabold text-sm text-slate-950 flex items-center gap-2">
                <FileText className="w-4 h-4 text-amber-600" />
                Recent Custom OEM Leads
              </h3>
              <button
                onClick={() => onNavigateTab('oem')}
                className="text-xs font-bold text-amber-700 hover:underline"
              >
                All Leads
              </button>
            </div>
            {quotes.length === 0 ? (
              <div className="p-6 text-center text-xs text-slate-400">
                No OEM quotes submitted yet.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {quotes.slice(0, 3).map((q) => (
                  <div key={q.id} className="px-5 py-3 text-xs">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-900">{q.name}</span>
                      <span className="font-mono text-[11px] text-amber-700 font-bold">
                        {q.quantity} units
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 mt-0.5 truncate">
                      {q.productType} • {q.materialMicron}
                    </p>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
