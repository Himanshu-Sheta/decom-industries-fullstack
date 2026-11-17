'use client';

import React from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  LogIn,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const { user, openAuthModal, openAccountModal } = useAuth();
  const { totalUnits, openCart } = useCart();

  return (
    <div className="sticky top-0 z-40">
      {/* Top Trust Bar */}
      <div className="bg-slate-950 text-slate-200 text-xs py-2 px-4 border-b border-slate-800">
        <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>
              Surat Cleanroom Facility •{' '}
              <strong className="text-white font-semibold">GSTIN: 24AAYFD0203E1ZU</strong>
            </span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-300">
            <span>100% Virgin Polymer • Pan-India Dispatch</span>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1 text-amber-400 hover:text-amber-300 font-semibold"
              >
                <ShieldCheck className="w-3.5 h-3.5" />
                Admin Console
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* Main Sticky Header */}
      <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          {/* Brand Monogram */}
          <Link href="/" className="flex items-center gap-3 group">
            <motion.div
              whileHover={{ scale: 1.06, rotate: -3 }}
              whileTap={{ scale: 0.96 }}
              className="w-10 h-10 rounded-xl bg-gradient-to-br from-amber-500 to-amber-600 flex items-center justify-center shadow-sm shadow-amber-500/25"
            >
              <Package className="w-5 h-5 text-white" />
            </motion.div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-extrabold text-base tracking-tight text-slate-950">
                DECOM <span className="text-amber-600">INDUSTRIES</span>
              </span>
              <span className="text-[11px] font-medium text-slate-500">
                Surat • Apparel Packaging
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link href="/#products" className="hover:text-slate-950 transition-colors">
              Products
            </Link>
            <Link href="/#oem" className="hover:text-slate-950 transition-colors">
              Custom OEM
            </Link>
            <Link href="/#facility" className="hover:text-slate-950 transition-colors">
              Facility
            </Link>
            {user?.role === 'ADMIN' && (
              <Link
                href="/admin"
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 hover:bg-amber-100 font-semibold text-xs transition-colors"
              >
                <ShieldCheck className="w-3.5 h-3.5 text-amber-600" />
                Admin Dashboard
              </Link>
            )}
          </nav>

          {/* Actions: Account + Cart */}
          <div className="flex items-center gap-2.5">
            {user ? (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openAccountModal('profile')}
                className="flex items-center gap-2.5 px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 text-[11px] font-bold flex items-center justify-center">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user.name}
                </span>
                {user.role === 'ADMIN' && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[10px] font-bold">
                    ADMIN
                  </span>
                )}
              </motion.button>
            ) : (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  Sign In
                </button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openAuthModal('register')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Create Account
                </motion.button>
              </div>
            )}

            {/* Shopping Cart Trigger */}
            <motion.button
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={openCart}
              aria-label="Open Cart"
              className="relative inline-flex items-center gap-2 px-3.5 py-2 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold shadow-sm shadow-amber-500/20 transition-colors"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalUnits > 0 && (
                <motion.span
                  key={totalUnits}
                  initial={{ scale: 0.6 }}
                  animate={{ scale: 1 }}
                  className="min-w-[20px] h-5 px-1.5 rounded-full bg-slate-950 text-white text-[11px] font-bold flex items-center justify-center"
                >
                  {totalUnits}
                </motion.span>
              )}
            </motion.button>
          </div>
        </div>
      </header>
    </div>
  );
}
