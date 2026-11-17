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
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { ordersApi, oemApi } from '@/lib/api';
import type { Order, OemQuote } from '@/lib/types';

export function AccountModal() {
  const { user, isAccountModalOpen, closeAccountModal, logout, updateProfile } =
    useAuth();
  const [tab, setTab] = useState<'profile' | 'orders' | 'quotes'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [quotes, setQuotes] = useState<OemQuote[]>([]);
  const [loadingData, setLoadingData] = useState(false);

  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [city, setCity] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [savedMsg, setSavedMsg] = useState(false);

  useEffect(() => {
    if (user && isAccountModalOpen) {
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
  }, [user, isAccountModalOpen]);

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
                      <CheckCircle2 className="w-4 h-4" /> Profile updated in PostgreSQL!
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
                <div className="space-y-3">
                  {loadingData ? (
                    <p className="text-xs text-slate-500 py-8 text-center">
                      Loading your orders...
                    </p>
                  ) : orders.length === 0 ? (
                    <p className="text-xs text-slate-500 py-8 text-center">
                      You have not placed any orders yet.
                    </p>
                  ) : (
                    orders.map((order) => (
                      <div
                        key={order.id}
                        className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-mono text-xs font-bold text-slate-900">
                            {order.orderNumber}
                          </span>
                          <span className="px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            {order.status}
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-600">
                          {order.items
                            .map((i) => `${i.quantity}× ${i.product.name}`)
                            .join(', ')}
                        </div>
                        <div className="flex justify-between text-xs font-bold text-slate-900 pt-1 border-t border-slate-200/70">
                          <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                          <span>₹{order.grandTotalINR.toLocaleString('en-IN')}</span>
                        </div>
                      </div>
                    ))
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
