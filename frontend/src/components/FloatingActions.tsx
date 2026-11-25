'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowUp, ShoppingBag, MessageCircle } from 'lucide-react';
import { useCart } from '@/context/CartContext';

export function FloatingActions() {
  const { totalUnits, openCart, grandTotalINR } = useCart();
  const [showScrollTop, setShowScrollTop] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 350) {
        setShowScrollTop(true);
      } else {
        setShowScrollTop(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const openWhatsApp = () => {
    const phone = '919825112345';
    const text = encodeURIComponent(
      'Hello Decom Industries, I am inquiring about apparel packaging manufacturing and bulk supply.'
    );
    window.open(`https://wa.me/${phone}?text=${text}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed bottom-5 right-5 z-40 flex flex-col items-end gap-3 pointer-events-none">
      {/* Mobile Floating Cart Pill (Shows when user has items in cart and is scrolling) */}
      <AnimatePresence>
        {totalUnits > 0 && (
          <motion.button
            initial={{ opacity: 0, y: 20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={openCart}
            className="pointer-events-auto sm:hidden flex items-center gap-2.5 px-4 py-2.5 rounded-full bg-slate-950 text-white shadow-2xl border border-slate-700 text-xs font-bold"
          >
            <div className="relative">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              <span className="absolute -top-1.5 -right-2 px-1 py-0.2 rounded-full bg-amber-500 text-white text-[9px] font-extrabold min-w-[14px] text-center">
                {totalUnits}
              </span>
            </div>
            <span>View Cart • ₹{grandTotalINR.toLocaleString('en-IN')}</span>
          </motion.button>
        )}
      </AnimatePresence>

      <div className="flex items-center gap-2.5 pointer-events-auto">
        {/* WhatsApp Factory Desk Button */}
        <motion.button
          whileHover={{ scale: 1.08, y: -2 }}
          whileTap={{ scale: 0.94 }}
          onClick={openWhatsApp}
          className="group relative flex items-center gap-2.5 px-4 py-3 rounded-full bg-[#25D366] hover:bg-[#20bd5a] text-white shadow-xl shadow-emerald-500/30 font-bold text-xs transition-all"
          aria-label="Chat with Surat Factory on WhatsApp"
        >
          <span className="relative flex h-2.5 w-2.5">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-white"></span>
          </span>
          <MessageCircle className="w-5 h-5 fill-current" />
          <span className="hidden sm:inline font-bold">Surat Desk WhatsApp</span>
        </motion.button>

        {/* Scroll to Top Button */}
        <AnimatePresence>
          {showScrollTop && (
            <motion.button
              initial={{ opacity: 0, scale: 0.7 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.7 }}
              whileHover={{ scale: 1.1, y: -2 }}
              whileTap={{ scale: 0.9 }}
              onClick={scrollToTop}
              className="p-3 rounded-full bg-white/95 backdrop-blur-md text-slate-800 hover:text-amber-600 shadow-xl border border-slate-200/90 transition-colors"
              aria-label="Scroll back to top"
            >
              <ArrowUp className="w-4 h-4" />
            </motion.button>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
