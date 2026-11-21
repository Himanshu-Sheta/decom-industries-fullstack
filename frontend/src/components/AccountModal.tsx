'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  LogOut,
  Package,
  User as UserIcon,
  ShieldCheck,
  FileText,
  CheckCircle2,
  Truck,
  MapPin,
  Clock,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ordersApi, oemApi } from '@/lib/api';
import type { Order, OemQuote } from '@/lib/types';

export function AccountModal() {
  const {
    user,
    isAccountModalOpen,
    accountModalTab,
    closeAccountModal,
    logout,
    updateProfile,
  } = useAuth();
  const [tab, setTab] = useState<'profile' | 'orders' | 'quotes'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<OemQuote[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (user && isAccountModalOpen) {
      setTab(accountModalTab);
      setName(user.name);
      setPhone(user.phone);
      setCity(user.city || '');
      setBusinessName(user.businessName || '');

      setLoadingData(true);
      Promise.all([ordersApi.mine(), oemApi.mine()])
        .then(([orderRes, quoteRes]) => {
          setOrders(orderRes.orders);
          setQuotes(quoteRes.quotes);
        })
        .catch(() => {})
        .finally(() => setLoadingData(false));
    }
  }, [user, isAccountModalOpen, accountModalTab]);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await updateProfile({
      name,
      phone,
      city: city || null,
      businessName: businessName || null,
    });
    if (res.ok) {
      setSavedMsg(true);
      setTimeout(() => setSavedMsg(false), 2500);
    }
  };

  return (
    <AnimatePresence>
      {isAccountModalOpen && user && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={closeAccountModal}
          className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.94, y: 16 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 10 }}
            onClick={(e) => e.stopPropagation()}
            className="relative w-full max-w-xl bg-white rounded-3xl p-6 sm:p-8 shadow-2xl border border-slate-200 max-h-[88vh] flex flex-col"
          >
            <button
              onClick={closeAccountModal}
              className="absolute top-5 right-5 p-2 rounded-full hover:bg-slate-100 text-slate-400"
            >
              <X className="w-5 h-5" />
            </button>

            {/* User Header */}
            <div className="flex items-center gap-4 mb-5">
              <div className="w-14 h-14 rounded-2xl bg-slate-950 text-amber-400 font-heading font-extrabold text-xl flex items-center justify-center">
                {user.name.slice(0, 1).toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="font-heading text-xl font-extrabold text-slate-950">
                    {user.name}
                  </h2>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      user.role === 'ADMIN'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {user.role}
                  </span>
                </div>
                <p className="text-xs text-slate-500">{user.email}</p>
              </div>
            </div>

            {user.role === 'ADMIN' && (
              <Link
                href="/admin"
                onClick={closeAccountModal}
                className="mb-4 px-4 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 border border-amber-200 flex items-center justify-between text-xs font-bold text-amber-900 transition-colors"
              >
                <span className="flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-amber-600" />
                  Open Decom Admin Dashboard
                </span>
                <span>→</span>
              </Link>
            )}

            {/* Tabs */}
            <div className="grid grid-cols-3 gap-1 p-1 rounded-2xl bg-slate-100 mb-5 text-xs font-bold">
              <button
                onClick={() => setTab('profile')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 ${
                  tab === 'profile' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                <UserIcon className="w-3.5 h-3.5" /> Profile
              </button>
              <button
                onClick={() => setTab('orders')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 ${
                  tab === 'orders' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                <Package className="w-3.5 h-3.5" /> Orders ({orders.length})
              </button>
              <button
                onClick={() => setTab('quotes')}
                className={`py-2 rounded-xl flex items-center justify-center gap-1.5 ${
                  tab === 'quotes' ? 'bg-white text-slate-950 shadow-xs' : 'text-slate-500'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> OEM ({quotes.length})
              </button>
            </div>

            {/* Tab Content */}
            <div className="flex-1 overflow-y-auto pr-1">
              {tab === 'profile' && (
                <form onSubmit={handleSaveProfile} className="space-y-3.5">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Full Name
                      </label>
                      <input
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Phone
                      </label>
                      <input
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        City
                      </label>
                      <input
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-bold text-slate-500 mb-1">
                        Business Name (Optional)
                      </label>
                      <input
                        value={businessName}
                        onChange={(e) => setBusinessName(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs"
                      />
                    </div>
                  </div>

                  {savedMsg && (
                    <div className="text-xs font-semibold text-emerald-700 flex items-center gap-1.5">
                      <CheckCircle2 className="w-4 h-4" /> Profile updated successfully!
                    </div>
                  )}

                  <div className="flex gap-3 pt-2">
                    <button
                      type="submit"
                      className="flex-1 py-2.5 rounded-xl bg-slate-950 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={logout}
                      className="px-4 py-2.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold inline-flex items-center gap-1.5"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Sign Out
                    </button>
                  </div>
                </form>
              )}

              {tab === 'orders' && (
                <div className="space-y-3.5">
                  {loadingData ? (
                    <p className="text-xs text-slate-500 py-8 text-center">
                      Loading your orders...
                    </p>
                  ) : orders.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center">
                      You have not placed any orders yet.
                    </p>
                  ) : (
                    orders.map((order) => {
                      const isExpanded = expandedOrderId === order.id;
                      const stepIndex =
                        order.status === 'PENDING'
                          ? 1
                          : order.status === 'CONFIRMED' || order.status === 'IN_PRODUCTION'
                          ? 2
                          : order.status === 'READY_FOR_PICKUP'
                          ? 3
                          : order.status === 'PICKED_UP'
                          ? 4
                          : order.status === 'DISPATCHED'
                          ? 5
                          : order.status === 'DELIVERED'
                          ? 6
                          : 0;

                      const statusBadge =
                        order.status === 'READY_FOR_PICKUP'
                          ? 'bg-purple-100 text-purple-800 border-purple-200'
                          : order.status === 'PICKED_UP'
                          ? 'bg-blue-100 text-blue-800 border-blue-200'
                          : order.status === 'DISPATCHED'
                          ? 'bg-teal-100 text-teal-800 border-teal-200'
                          : order.status === 'DELIVERED'
                          ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
                          : order.status === 'CONFIRMED'
                          ? 'bg-sky-100 text-sky-800 border-sky-200'
                          : order.status === 'CANCELLED'
                          ? 'bg-rose-100 text-rose-800 border-rose-200'
                          : 'bg-amber-100 text-amber-800 border-amber-200';

                      const statusText =
                        order.status === 'READY_FOR_PICKUP'
                          ? 'Ready for Courier Pickup (Surat)'
                          : order.status === 'PICKED_UP'
                          ? 'Picked Up by Courier'
                          : order.status === 'DISPATCHED'
                          ? 'In Transit'
                          : order.status === 'DELIVERED'
                          ? 'Delivered'
                          : order.status === 'CONFIRMED'
                          ? 'Confirmed & Packed'
                          : order.status === 'CANCELLED'
                          ? 'Cancelled'
                          : 'Order Placed';

                      return (
                        <div
                          key={order.id}
                          className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5 transition-all"
                        >
                          {/* Order Header */}
                          <div className="flex items-center justify-between">
                            <span className="font-mono text-xs font-bold text-slate-900">
                              {order.orderNumber}
                            </span>
                            <span
                              className={`px-2.5 py-0.5 rounded-full border text-[10px] font-bold ${statusBadge}`}
                            >
                              {statusText}
                            </span>
                          </div>

                          {/* Items Summary */}
                          <div className="text-[11px] text-slate-600">
                            {order.items
                              .map((i) => `${i.quantity}× ${i.product.name}`)
                              .join(', ')}
                          </div>

                          {/* Price & Date */}
                          <div className="flex justify-between items-center text-xs font-bold text-slate-900 pt-1 border-t border-slate-200/70">
                            <span className="text-[11px] font-normal text-slate-500">
                              {new Date(order.createdAt).toLocaleDateString()}
                            </span>
                            <div className="flex items-center gap-3">
                              <span>₹{order.grandTotalINR.toLocaleString('en-IN')}</span>
                              <button
                                onClick={() =>
                                  setExpandedOrderId(isExpanded ? null : order.id)
                                }
                                className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:bg-slate-100 text-[11px] font-bold text-slate-800 transition-colors shadow-2xs"
                              >
                                <Truck className="w-3.5 h-3.5 text-amber-600" />
                                <span>Track</span>
                                {isExpanded ? (
                                  <ChevronUp className="w-3.5 h-3.5 text-slate-400" />
                                ) : (
                                  <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
                                )}
                              </button>
                            </div>
                          </div>

                          {/* Interactive Delivery Tracking Drawer */}
                          <AnimatePresence>
                            {isExpanded && (
                              <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: 'auto' }}
                                exit={{ opacity: 0, height: 0 }}
                                className="overflow-hidden pt-2.5 border-t border-slate-200/80 space-y-3"
                              >
                                {/* Milestone Stepper */}
                                <div className="space-y-1.5">
                                  <div className="flex items-center justify-between text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                                    <span>Surat Warehouse</span>
                                    <span>Third-Party Courier</span>
                                    <span>Delivery</span>
                                  </div>

                                  <div className="relative flex items-center justify-between">
                                    {/* Track Bar */}
                                    <div className="absolute top-1/2 left-0 right-0 -translate-y-1/2 h-1 bg-slate-200 rounded-full z-0" />
                                    <div
                                      className="absolute top-1/2 left-0 -translate-y-1/2 h-1 bg-amber-500 rounded-full z-0 transition-all duration-500"
                                      style={{
                                        width: `${Math.min(
                                          100,
                                          Math.max(0, ((stepIndex - 1) / 4) * 100)
                                        )}%`,
                                      }}
                                    />

                                    {/* Step 1: Placed */}
                                    <div
                                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        stepIndex >= 1
                                          ? 'bg-amber-500 text-white shadow-xs'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}
                                    >
                                      ✓
                                    </div>

                                    {/* Step 2: Packed */}
                                    <div
                                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        stepIndex >= 2
                                          ? 'bg-amber-500 text-white shadow-xs'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}
                                    >
                                      {stepIndex >= 2 ? '✓' : '2'}
                                    </div>

                                    {/* Step 3: Ready for Pickup */}
                                    <div
                                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        stepIndex >= 3
                                          ? 'bg-purple-600 text-white shadow-xs'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}
                                    >
                                      {stepIndex >= 3 ? '✓' : '3'}
                                    </div>

                                    {/* Step 4: Picked Up / In Transit */}
                                    <div
                                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        stepIndex >= 4
                                          ? 'bg-blue-600 text-white shadow-xs'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}
                                    >
                                      {stepIndex >= 4 ? '✓' : '4'}
                                    </div>

                                    {/* Step 5: Delivered */}
                                    <div
                                      className={`relative z-10 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                        stepIndex >= 6
                                          ? 'bg-emerald-600 text-white shadow-xs'
                                          : 'bg-slate-200 text-slate-500'
                                      }`}
                                    >
                                      {stepIndex >= 6 ? '✓' : '5'}
                                    </div>
                                  </div>

                                  <div className="flex justify-between text-[9px] text-slate-400 font-semibold px-0.5">
                                    <span>Placed</span>
                                    <span>Packed</span>
                                    <span>Pickup Ready</span>
                                    <span>Picked Up</span>
                                    <span>Delivered</span>
                                  </div>
                                </div>

                                {/* Active Status Narrative */}
                                <div className="p-3 rounded-xl bg-white border border-slate-200/90 text-xs space-y-1.5">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-3.5 h-3.5 text-amber-600 shrink-0" />
                                    <span className="font-bold text-slate-900">
                                      {order.status === 'PENDING' &&
                                        'Order Received • Surat Dispatch Team Preparing'}
                                      {order.status === 'CONFIRMED' &&
                                        'Verified & Packed at Surat Warehouse'}
                                      {order.status === 'READY_FOR_PICKUP' &&
                                        'Ready for Courier Pickup at Surat Facility'}
                                      {order.status === 'PICKED_UP' &&
                                        'Courier Has Picked Up Parcel from Surat Location'}
                                      {order.status === 'DISPATCHED' &&
                                        'Out for Delivery / In Transit'}
                                      {order.status === 'DELIVERED' &&
                                        'Package Delivered Successfully'}
                                      {order.status === 'CANCELLED' && 'Order Cancelled'}
                                    </span>
                                  </div>

                                  {/* Courier & Tracking Details */}
                                  <div className="grid grid-cols-2 gap-2 pt-1 border-t border-slate-100 text-[11px]">
                                    <div>
                                      <span className="text-slate-400">Courier Partner:</span>{' '}
                                      <span className="font-semibold text-slate-800">
                                        {order.courierPartner || 'Assigned on Pickup'}
                                      </span>
                                    </div>
                                    <div>
                                      <span className="text-slate-400">AWB / Docket #:</span>{' '}
                                      <span className="font-mono font-semibold text-slate-800">
                                        {order.trackingNumber || 'Pending Pickup'}
                                      </span>
                                    </div>
                                    <div className="col-span-2 flex items-start gap-1 text-slate-500 text-[10px]">
                                      <MapPin className="w-3 h-3 text-slate-400 mt-0.5 shrink-0" />
                                      <span>
                                        Delivering to: {order.shippingAddress}, {order.city}
                                      </span>
                                    </div>
                                  </div>
                                </div>
                              </motion.div>
                            )}
                          </AnimatePresence>
                        </div>
                      );
                    })
                  )}
                </div>
              )}

              {tab === 'quotes' && (
                <div className="space-y-3">
                  {quotes.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center">
                      No custom OEM quotes submitted yet.
                    </p>
                  ) : (
                    quotes.map((q) => (
                      <div
                        key={q.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-1.5"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {q.quoteNumber}
                          </span>
                          <span className="px-2 py-0.5 rounded-full bg-slate-200 text-slate-800 text-[10px] font-bold">
                            {q.status}
                          </span>
                        </div>
                        <div className="text-xs font-semibold text-slate-800">
                          {q.productType} • {q.quantity} units
                        </div>
                        <div className="text-[11px] text-slate-500">
                          {q.materialMicron} • {q.customSize}
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
