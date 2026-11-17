'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  Download,
  Eye,
  ArrowRight,
  X,
  Printer,
  MapPin,
  Phone,
  Mail,
} from 'lucide-react';
import { ordersApi, ApiError } from '@/lib/api';
import type { Order, OrderStatus } from '@/lib/types';
import { exportToCsv, formatINR, ORDER_STATUS_META } from './adminUtils';

interface OrdersTabProps {
  orders: Order[];
  globalSearch: string;
  selectedOrder: Order | null;
  onSelectOrder: (order: Order | null) => void;
  onChanged: (toast: string) => void;
  onError: (msg: string) => void;
}

const ALL_STATUSES: ('ALL' | OrderStatus)[] = [
  'ALL',
  'PENDING',
  'CONFIRMED',
  'IN_PRODUCTION',
  'DISPATCHED',
  'DELIVERED',
  'CANCELLED',
];

export function OrdersTab({
  orders,
  globalSearch,
  selectedOrder,
  onSelectOrder,
  onChanged,
  onError,
}: OrdersTabProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | OrderStatus>('ALL');
  const [localSearch, setLocalSearch] = useState('');

  const filtered = useMemo(() => {
    const q = (localSearch || globalSearch).trim().toLowerCase();
    return orders.filter((o) => {
      if (statusFilter !== 'ALL' && o.status !== statusFilter) return false;
      if (
        q &&
        !o.orderNumber.toLowerCase().includes(q) &&
        !(o.user?.name || '').toLowerCase().includes(q) &&
        !o.city.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [orders, statusFilter, localSearch, globalSearch]);

  const handleStatusChange = async (order: Order, nextStatus: OrderStatus) => {
    try {
      await ordersApi.updateStatus(order.id, nextStatus);
      onChanged(`Order ${order.orderNumber} → ${ORDER_STATUS_META[nextStatus].label}`);
      if (selectedOrder?.id === order.id) {
        onSelectOrder({ ...selectedOrder, status: nextStatus });
      }
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Order status update failed.');
    }
  };

  const handleExport = () => {
    exportToCsv(
      'decom-orders.csv',
      filtered.map((o) => ({
        OrderNumber: o.orderNumber,
        Date: new Date(o.createdAt).toISOString(),
        Customer: o.user?.name || '',
        Email: o.user?.email || '',
        City: o.city,
        Phone: o.phone,
        SubtotalINR: o.subtotalINR,
        GST_INR: o.gstINR,
        GrandTotalINR: o.grandTotalINR,
        Status: o.status,
      }))
    );
  };

  return (
    <div className="space-y-5">
      {/* Filter Bar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search order #, customer, city..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" /> Export Orders CSV
          </button>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {ALL_STATUSES.map((st) => {
            const count =
              st === 'ALL'
                ? orders.length
                : orders.filter((o) => o.status === st).length;
            const active = statusFilter === st;
            return (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition-all ${
                  active
                    ? 'bg-slate-950 text-white'
                    : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/70'
                }`}
              >
                {st === 'ALL' ? 'All' : ORDER_STATUS_META[st].label}{' '}
                <span className="opacity-70">({count})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Orders Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Order #</th>
              <th className="px-4 py-3.5">Customer & Destination</th>
              <th className="px-4 py-3.5">Items</th>
              <th className="px-4 py-3.5">Total (incl. GST)</th>
              <th className="px-4 py-3.5">Status</th>
              <th className="px-5 py-3.5 text-right">Quick Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((o) => {
              const meta = ORDER_STATUS_META[o.status];
              return (
                <tr key={o.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <div className="font-mono font-bold text-slate-950">
                      {o.orderNumber}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      {new Date(o.createdAt).toLocaleString()}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-bold text-slate-900">{o.user?.name}</div>
                    <div className="text-[11px] text-slate-500">
                      {o.city} • {o.phone}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="max-w-[200px] truncate font-medium text-slate-700">
                      {o.items
                        .map((i) => `${i.quantity}× ${i.product.name}`)
                        .join(', ')}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <div className="font-heading font-extrabold text-sm text-slate-950 tabular-nums">
                      {formatINR(o.grandTotalINR)}
                    </div>
                    <div className="text-[10px] text-slate-400">
                      GST: {formatINR(o.gstINR)}
                    </div>
                  </td>
                  <td className="px-4 py-3.5">
                    <select
                      value={o.status}
                      onChange={(e) =>
                        handleStatusChange(o, e.target.value as OrderStatus)
                      }
                      className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold cursor-pointer ${meta.badge}`}
                    >
                      {(Object.keys(ORDER_STATUS_META) as OrderStatus[]).map((s) => (
                        <option key={s} value={s}>
                          {ORDER_STATUS_META[s].label}
                        </option>
                      ))}
                    </select>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-1.5">
                      {meta.next && (
                        <button
                          onClick={() => handleStatusChange(o, meta.next!)}
                          className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-950 hover:bg-amber-600 text-white text-[11px] font-bold transition-colors"
                        >
                          {meta.nextLabel}
                          <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                      <button
                        onClick={() => onSelectOrder(o)}
                        className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
                      >
                        <Eye className="w-3.5 h-3.5" /> Invoice
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No orders found for this filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* GST Tax Invoice & Order Detail Slide-Over Drawer */}
      <AnimatePresence>
        {selectedOrder && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => onSelectOrder(null)}
              className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-lg bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <div className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                    Order Tax Invoice • Decom Industries
                  </div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-950 font-mono">
                    {selectedOrder.orderNumber}
                  </h3>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => window.print()}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
                  >
                    <Printer className="w-3.5 h-3.5" /> Print
                  </button>
                  <button
                    onClick={() => onSelectOrder(null)}
                    className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-5 text-xs">
                {/* Status Bar */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3">
                  <div>
                    <div className="text-[11px] text-slate-500 font-semibold">
                      Fulfillment Stage
                    </div>
                    <span
                      className={`inline-block mt-1 px-2.5 py-0.5 rounded-full border text-[11px] font-bold ${ORDER_STATUS_META[selectedOrder.status].badge}`}
                    >
                      {ORDER_STATUS_META[selectedOrder.status].label}
                    </span>
                  </div>
                  {ORDER_STATUS_META[selectedOrder.status].next && (
                    <button
                      onClick={() =>
                        handleStatusChange(
                          selectedOrder,
                          ORDER_STATUS_META[selectedOrder.status].next!
                        )
                      }
                      className="px-3.5 py-2 rounded-xl bg-slate-950 hover:bg-amber-600 text-white font-bold text-xs inline-flex items-center gap-1.5"
                    >
                      {ORDER_STATUS_META[selectedOrder.status].nextLabel}
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Buyer Info */}
                <div className="p-4 rounded-2xl border border-slate-200 space-y-2">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Billed & Shipped To
                  </div>
                  <div className="font-bold text-sm text-slate-950">
                    {selectedOrder.user?.name || 'Customer'}
                    {selectedOrder.user?.businessName
                      ? ` (${selectedOrder.user.businessName})`
                      : ''}
                  </div>
                  <div className="flex items-start gap-2 text-slate-600">
                    <MapPin className="w-3.5 h-3.5 text-amber-600 mt-0.5 shrink-0" />
                    <span>
                      {selectedOrder.shippingAddress}, {selectedOrder.city}
                    </span>
                  </div>
                  <div className="flex flex-wrap gap-4 text-slate-600 pt-1">
                    <span className="inline-flex items-center gap-1.5">
                      <Phone className="w-3.5 h-3.5 text-slate-400" />
                      {selectedOrder.phone}
                    </span>
                    {selectedOrder.user?.email && (
                      <span className="inline-flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        {selectedOrder.user.email}
                      </span>
                    )}
                  </div>
                  {selectedOrder.notes && (
                    <div className="mt-2 p-2.5 rounded-xl bg-amber-50 border border-amber-200/70 text-amber-900">
                      <strong>Customer Note:</strong> {selectedOrder.notes}
                    </div>
                  )}
                </div>

                {/* Line Items */}
                <div className="space-y-2.5">
                  <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
                    Order Items ({selectedOrder.items.length})
                  </div>
                  {selectedOrder.items.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center justify-between gap-3 p-3 rounded-xl bg-slate-50 border border-slate-200/70"
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <img
                          src={item.product.imageUrl}
                          alt={item.product.name}
                          className="w-11 h-11 rounded-lg object-cover border border-slate-200 shrink-0"
                        />
                        <div className="min-w-0">
                          <div className="font-bold text-slate-900 truncate">
                            {item.product.name}
                          </div>
                          <div className="text-[11px] text-slate-500 font-mono">
                            {item.product.sku} • {item.quantity} ×{' '}
                            {formatINR(item.unitPriceINR)}
                          </div>
                        </div>
                      </div>
                      <div className="font-heading font-extrabold text-slate-950 shrink-0 tabular-nums">
                        {formatINR(item.lineTotalINR)}
                      </div>
                    </div>
                  ))}
                </div>

                {/* Tax Breakdown */}
                <div className="p-4 rounded-2xl bg-slate-950 text-white space-y-2">
                  <div className="flex justify-between text-slate-300">
                    <span>Taxable Subtotal</span>
                    <span className="font-mono">
                      {formatINR(selectedOrder.subtotalINR)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300">
                    <span>IGST / CGST+SGST (18%)</span>
                    <span className="font-mono">{formatINR(selectedOrder.gstINR)}</span>
                  </div>
                  <div className="flex justify-between font-heading font-extrabold text-base pt-2 border-t border-slate-800 text-amber-400">
                    <span>Grand Total</span>
                    <span className="font-mono">
                      {formatINR(selectedOrder.grandTotalINR)}
                    </span>
                  </div>
                </div>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
