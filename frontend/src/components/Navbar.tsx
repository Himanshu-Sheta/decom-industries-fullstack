'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Package,
  ShoppingBag,
  ShieldCheck,
  User as UserIcon,
  LogIn,
  Menu,
  X,
  Phone,
  ArrowRight,
  Sparkles,
  Layers,
  Factory,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useCart } from '@/context/CartContext';

export function Navbar() {
  const { user, openAuthModal, openAccountModal } = useAuth();
  const { totalUnits, openCart } = useCart();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <div className="sticky top-0 z-40 w-full">
      {/* Main Sticky Header */}
      <header className="bg-white/95 backdrop-blur-md border-b border-slate-200/80 transition-shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          {/* Brand Monogram */}
          <Link href="/" className="flex items-center gap-2.5 sm:gap-3 group shrink-0">
            <motion.div
              whileHover={{ scale: 1.08, rotate: -4 }}
              whileTap={{ scale: 0.94 }}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-gradient-to-br from-amber-500 via-amber-600 to-amber-700 flex items-center justify-center shadow-md shadow-amber-500/20"
            >
              <Package className="w-4 h-4 sm:w-5 sm:h-5 text-white" />
            </motion.div>
            <div className="flex flex-col leading-tight">
              <span className="font-heading font-extrabold text-sm sm:text-base tracking-tight text-slate-950">
                DECOM <span className="text-amber-600">INDUSTRIES</span>
              </span>
              <span className="text-[10px] sm:text-[11px] font-medium text-slate-500">
                Surat • Packaging Floor
              </span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-7 text-sm font-medium text-slate-600">
            <Link
              href="/#products"
              className="hover:text-amber-600 transition-colors relative py-1"
            >
              Packaging Catalog
            </Link>
            <Link
              href="/#oem"
              className="hover:text-amber-600 transition-colors relative py-1"
            >
              Custom OEM Studio
            </Link>
            <Link
              href="/#facility"
              className="hover:text-amber-600 transition-colors relative py-1"
            >
              Surat Facility
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

          {/* Actions: Account + Cart + Mobile Hamburger */}
          <div className="flex items-center gap-2 sm:gap-2.5">
            {user ? (
              <motion.button
                whileHover={{ y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => openAccountModal('profile')}
                className="flex items-center gap-2 px-2.5 sm:px-3 py-1.5 rounded-xl bg-slate-50 hover:bg-slate-100 border border-slate-200 text-slate-800 text-xs font-semibold transition-colors"
              >
                <span className="w-6 h-6 rounded-full bg-slate-900 text-amber-400 text-[11px] font-bold flex items-center justify-center">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="hidden sm:inline max-w-[100px] md:max-w-[120px] truncate">
                  {user.name}
                </span>
                {user.role === 'ADMIN' && (
                  <span className="px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 text-[9px] font-bold hidden sm:inline">
                    ADMIN
                  </span>
                )}
              </motion.button>
            ) : (
              <div className="flex items-center gap-1.5 sm:gap-2">
                <button
                  onClick={() => openAuthModal('login')}
                  className="inline-flex items-center gap-1.5 px-2.5 sm:px-3 py-2 rounded-xl text-xs font-semibold text-slate-700 hover:text-slate-950 hover:bg-slate-100 transition-colors"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline">Sign In</span>
                </button>
                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  onClick={() => openAuthModal('register')}
                  className="hidden sm:inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition-colors shadow-2xs"
                >
                  <UserIcon className="w-3.5 h-3.5" />
                  Account
                </motion.button>
              </div>
            )}

            {/* Shopping Cart Trigger with Animated Badge */}
            <motion.button
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.94 }}
              onClick={openCart}
              aria-label="Open Cart"
              className="relative inline-flex items-center gap-1.5 sm:gap-2 px-3 sm:px-3.5 py-2 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-600 hover:to-amber-700 text-white text-xs font-bold shadow-md shadow-amber-500/25 transition-all"
            >
              <ShoppingBag className="w-4 h-4" />
              <span className="hidden sm:inline">Cart</span>
              {totalUnits > 0 && (
                <motion.span
                  key={totalUnits}
                  initial={{ scale: 0.4, rotate: -15 }}
                  animate={{ scale: 1, rotate: 0 }}
                  transition={{ type: 'spring', stiffness: 500, damping: 25 }}
                  className="min-w-[18px] sm:min-w-[20px] h-4.5 sm:h-5 px-1 sm:px-1.5 rounded-full bg-slate-950 text-white text-[10px] sm:text-[11px] font-bold flex items-center justify-center shadow-xs"
                >
                  {totalUnits}
                </motion.span>
              )}
            </motion.button>

            {/* Mobile Menu Hamburger Toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-xl text-slate-700 hover:bg-slate-100 transition-colors"
              aria-label="Toggle navigation menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Navigation Drawer */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden border-t border-slate-200 bg-white/98 backdrop-blur-xl px-5 py-4 space-y-3.5 shadow-xl"
            >
              <div className="space-y-1">
                <Link
                  href="/#products"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Package className="w-4 h-4 text-amber-600" />
                    Packaging Catalog
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/#oem"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Sparkles className="w-4 h-4 text-amber-600" />
                    Custom OEM Studio
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
                <Link
                  href="/#facility"
                  onClick={() => setMobileMenuOpen(false)}
                  className="flex items-center justify-between p-2.5 rounded-xl text-sm font-semibold text-slate-800 hover:bg-amber-50 hover:text-amber-700 transition-colors"
                >
                  <span className="flex items-center gap-2.5">
                    <Factory className="w-4 h-4 text-amber-600" />
                    Surat Facility & Sealing
                  </span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400" />
                </Link>
              </div>

              {/* Mobile Quick Action Buttons */}
              <div className="pt-2 border-t border-slate-100 flex flex-col gap-2">
                {user ? (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAccountModal('orders');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <Package className="w-4 h-4 text-amber-400" />
                    My Orders &amp; Delivery Tracking
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setMobileMenuOpen(false);
                      openAuthModal('register');
                    }}
                    className="w-full py-2.5 rounded-xl bg-slate-900 text-white text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <UserIcon className="w-4 h-4 text-amber-400" />
                    Create Free Account
                  </button>
                )}

                {user?.role === 'ADMIN' && (
                  <Link
                    href="/admin"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 rounded-xl bg-amber-50 text-amber-900 border border-amber-200 text-xs font-bold flex items-center justify-center gap-2"
                  >
                    <ShieldCheck className="w-4 h-4 text-amber-600" />
                    Admin Operations Portal
                  </Link>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </div>
  );
}
