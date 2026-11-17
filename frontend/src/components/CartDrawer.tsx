'use client';

import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  Lock,
  CheckCircle2,
  ArrowRight,
  Package,
} from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useAuth } from '@/context/AuthContext';
import { ordersApi, ApiError } from '@/lib/api';
import type { Order } from '@/lib/types';

export function CartDrawer() {
  const {
    items,
    isCartOpen,
    totalUnits,
    subtotalINR,
    gstINR,
    grandTotalINR,
    closeCart,
    updateQuantity,
    removeItem,
    clearCart,
  } = useCart();
  const { user, openAuthModal, openAccountModal } = useAuth();

  const [shippingAddress, setShippingAddress] = useState('');
  const [city, setCity] = useState('');
  const [phone, setPhone] = useState('');
  const [notes, setNotes] = useState('');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [placedOrder, setPlacedOrder] = useState<Order | null>(null);

  useEffect(() => {
    if (user) {
      setCity((prev) => prev || user.city || '');
      setPhone((prev) => prev || user.phone || '');
    }
  }, [user]);

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) {
      openAuthModal('login');
      return;
    }

    setError(null);
    setPlacing(true);
    try {
      // SECURITY: Frontend ONLY sends productId + quantity.
      // Backend fetches real prices from PostgreSQL & computes 18% GST!
      const res = await ordersApi.create({
        items: items.map((i) => ({
          productId: i.product.id,
          quantity: i.quantity,
        })),
        shippingAddress,
        city,
        phone,
        notes: notes || undefined,
      });
      setPlacedOrder(res.order);
      clearCart();
      setShippingAddress('');
      setNotes('');
      window.dispatchEvent(new Event('decom:inventory-updated'));
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Checkout failed. Please try again.'
      );
    } finally {
      setPlacing(false);
    }
  };

  return (
    <AnimatePresence>
      {isCartOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setPlacedOrder(null);
              closeCart();
            }}
            className="fixed inset-0 z-50 bg-slate-950/55 backdrop-blur-sm"
          />

          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320, mass: 0.85 }}
            className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-md bg-white shadow-2xl border-l border-slate-200 flex flex-col will-change-transform"
          >
            {/* Header */}
            <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="w-5 h-5 text-amber-600" />
                <div>
                  <h2 className="font-heading font-extrabold text-lg text-slate-950 leading-tight">
                    Your Order Cart
                  </h2>
                  {totalUnits > 0 && !placedOrder && (
                    <p className="text-[11px] text-slate-500">
                      {items.length} item(s) • {totalUnits} total unit(s)
                    </p>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-1.5">
                {items.length > 0 && !placedOrder && (
                  <button
                    type="button"
                    onClick={clearCart}
                    className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                  >
                    Clear
                  </button>
                )}
                <button
                  onClick={() => {
                    setPlacedOrder(null);
                    closeCart();
                  }}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Body */}
            <div className="flex-1 overflow-y-auto p-6 space-y-5">
              {placedOrder ? (
                <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-6 text-center space-y-3.5">
                  <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                  <h3 className="font-heading text-xl font-extrabold text-slate-950">
                    Order Confirmed!
                  </h3>
                  <p className="text-xs text-slate-600">
                    Saved in PostgreSQL & inventory updated atomically.
                  </p>
                  <div className="inline-block px-4 py-1.5 rounded-xl bg-white border border-emerald-200 font-mono font-bold text-sm text-emerald-800">
                    {placedOrder.orderNumber}
                  </div>

                  <div className="bg-white rounded-2xl border border-emerald-200/70 p-4 text-left text-xs space-y-1.5">
                    <div className="flex justify-between text-slate-500">
                      <span>Subtotal</span>
                      <span className="font-mono">
                        ₹{placedOrder.subtotalINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-500">
                      <span>GST (18%)</span>
                      <span className="font-mono">
                        ₹{placedOrder.gstINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between font-bold text-slate-950 pt-1.5 border-t border-slate-100">
                      <span>Server-Verified Total</span>
                      <span className="font-mono">
                        ₹{placedOrder.grandTotalINR.toLocaleString('en-IN')}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pt-1">
                    <button
                      onClick={() => {
                        setPlacedOrder(null);
                        closeCart();
                        openAccountModal('orders');
                      }}
                      className="py-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold inline-flex items-center justify-center gap-1.5"
                    >
                      <Package className="w-3.5 h-3.5" /> My Orders
                    </button>
                    <button
                      onClick={() => {
                        setPlacedOrder(null);
                        closeCart();
                      }}
                      className="py-2.5 rounded-xl bg-slate-950 hover:bg-slate-800 text-white text-xs font-bold"
                    >
                      Keep Shopping
                    </button>
                  </div>
                </div>
              ) : items.length === 0 ? (
                <div className="text-center py-16 space-y-3">
                  <ShoppingBag className="w-10 h-10 text-slate-300 mx-auto" />
                  <p className="font-heading font-bold text-slate-700">
                    Your cart is empty
                  </p>
                  <p className="text-xs text-slate-500">
                    Choose a quantity on any product card and click Add or Buy Now.
                  </p>
                </div>
              ) : (
                <>
                  {/* Line Items with Editable Quantity Input */}
                  <div className="space-y-3">
                    {items.map(({ product, quantity }) => (
                      <div
                        key={product.id}
                        className="flex gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-200/70"
                      >
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-16 h-16 rounded-xl object-cover shrink-0 border border-slate-200"
                        />
                        <div className="flex-1 min-w-0">
                          <h4 className="text-xs font-bold text-slate-900 truncate">
                            {product.name}
                          </h4>
                          <div className="flex items-center justify-between mt-0.5">
                            <span className="text-xs font-extrabold text-amber-700 tabular-nums">
                              ₹{(product.priceINR * quantity).toLocaleString('en-IN')}
                            </span>
                            <span className="text-[10px] text-slate-400">
                              ₹{product.priceINR}/ea • Max {product.stock}
                            </span>
                          </div>

                          <div className="mt-2 flex items-center justify-between">
                            <div className="inline-flex items-center gap-1 bg-white border border-slate-200 rounded-lg px-1.5 py-0.5">
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="p-1 text-slate-500 hover:text-slate-950"
                              >
                                <Minus className="w-3 h-3" />
                              </button>
                              <input
                                type="number"
                                min={1}
                                max={product.stock}
                                value={quantity}
                                onChange={(e) => {
                                  const next = parseInt(e.target.value, 10);
                                  if (!Number.isNaN(next)) {
                                    updateQuantity(product.id, Math.max(1, next));
                                  }
                                }}
                                aria-label="Cart item quantity"
                                className="w-11 text-center text-xs font-extrabold text-slate-950 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                              />
                              <button
                                type="button"
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="p-1 text-slate-500 hover:text-slate-950"
                              >
                                <Plus className="w-3 h-3" />
                              </button>
                            </div>
                            <button
                              type="button"
                              onClick={() => removeItem(product.id)}
                              className="p-1.5 text-slate-400 hover:text-rose-600"
                              title="Remove item"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Checkout Form */}
                  <form
                    id="checkout-form"
                    onSubmit={handleCheckout}
                    className="space-y-3 pt-3 border-t border-slate-200"
                  >
                    <h3 className="text-xs font-bold uppercase tracking-wider text-slate-500">
                      Delivery Details
                    </h3>
                    {error && (
                      <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs">
                        {error}
                      </div>
                    )}
                    <input
                      required
                      value={shippingAddress}
                      onChange={(e) => setShippingAddress(e.target.value)}
                      placeholder="Full Shipping Address *"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                    <div className="grid grid-cols-2 gap-2.5">
                      <input
                        required
                        value={city}
                        onChange={(e) => setCity(e.target.value)}
                        placeholder="City & State *"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                      <input
                        required
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="Phone Number *"
                        className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                      />
                    </div>
                    <input
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                      placeholder="Delivery instructions (optional)"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
                    />
                  </form>
                </>
              )}
            </div>

            {/* Footer Totals + Submit */}
            {items.length > 0 && !placedOrder && (
              <div className="p-6 border-t border-slate-200 bg-slate-50 space-y-3">
                <div className="space-y-1.5 text-xs">
                  <div className="flex justify-between text-slate-600">
                    <span>Subtotal ({totalUnits} units)</span>
                    <span className="font-mono">
                      ₹{subtotalINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>GST (18%)</span>
                    <span className="font-mono">₹{gstINR.toLocaleString('en-IN')}</span>
                  </div>
                  <div className="flex justify-between font-heading font-extrabold text-base text-slate-950 pt-2 border-t border-slate-200">
                    <span>Grand Total</span>
                    <span className="font-mono">
                      ₹{grandTotalINR.toLocaleString('en-IN')}
                    </span>
                  </div>
                </div>

                {user ? (
                  <button
                    form="checkout-form"
                    type="submit"
                    disabled={placing}
                    className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors"
                  >
                    <Lock className="w-3.5 h-3.5" />
                    {placing ? 'Placing Order...' : 'Place Secure Order'}
                    <ArrowRight className="w-4 h-4" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={() => openAuthModal('login')}
                    className="w-full py-3.5 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                  >
                    Sign In or Create Account to Checkout
                  </button>
                )}
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
