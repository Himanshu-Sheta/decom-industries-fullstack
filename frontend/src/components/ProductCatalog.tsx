'use client';

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search,
  ShoppingBag,
  Check,
  Layers,
  Ruler,
  PackageCheck,
  AlertCircle,
  X,
  Plus,
  Minus,
  Zap,
  ChevronLeft,
  ChevronRight,
  Images,
  Eye,
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

function getProductPhotos(p: Product): string[] {
  const unique = new Set<string>();
  if (p.imageUrl) unique.add(p.imageUrl);
  for (const url of p.galleryUrls || []) {
    if (url) unique.add(url);
  }
  return Array.from(unique);
}

export function ProductCatalog() {
  const { addToCart, openCart } = useCart();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<string[]>(['All']);
  const [activeCategory, setActiveCategory] = useState('All');
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [addedId, setAddedId] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [modalQty, setModalQty] = useState(1);
  const [modalPhotoIdx, setModalPhotoIdx] = useState(0);
  const [cardPhotoIdx, setCardPhotoIdx] = useState<Record<string, number>>({});
  const [cardQuantities, setCardQuantities] = useState<Record<string, number>>({});
  const [refreshTick, setRefreshTick] = useState(0);

  useEffect(() => {
    const onInventoryUpdated = () => setRefreshTick((t) => t + 1);
    window.addEventListener('decom:inventory-updated', onInventoryUpdated);
    return () =>
      window.removeEventListener('decom:inventory-updated', onInventoryUpdated);
  }, []);

  useEffect(() => {
    const timer = setTimeout(async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await productsApi.list({
          category: activeCategory,
          search: search.trim() || undefined,
        });
        setProducts(res.products);
        setCategories(['All', ...res.categories]);
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Could not reach Backend API (http://localhost:4000).'
        );
      } finally {
        setLoading(false);
      }
    }, 180);

    return () => clearTimeout(timer);
  }, [activeCategory, search, refreshTick]);

  const getCardQty = (p: Product) => {
    const saved = cardQuantities[p.id] ?? 1;
    return Math.min(Math.max(1, saved), Math.max(1, p.stock));
  };

  const setCardQty = (p: Product, next: number) => {
    const clamped = Math.min(Math.max(1, next || 1), Math.max(1, p.stock));
    setCardQuantities((prev) => ({ ...prev, [p.id]: clamped }));
  };

  const handleCardAdd = (product: Product) => {
    const qty = getCardQty(product);
    addToCart(product, qty);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1300);
  };

  const handleCardBuyNow = (product: Product) => {
    const qty = getCardQty(product);
    addToCart(product, qty);
    openCart();
  };

  const openQuickView = (product: Product) => {
    setSelectedProduct(product);
    setModalQty(getCardQty(product));
    setModalPhotoIdx(cardPhotoIdx[product.id] ?? 0);
  };

  const stepCardPhoto = (
    e: React.MouseEvent,
    productId: string,
    total: number,
    delta: number
  ) => {
    e.stopPropagation();
    setCardPhotoIdx((prev) => {
      const current = prev[productId] ?? 0;
      const next = (current + delta + total) % total;
      return { ...prev, [productId]: next };
    });
  };

  const quickPresets = selectedProduct
    ? [1, 5, 10, 25, 50].filter((n) => n <= selectedProduct.stock)
    : [];

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      {/* Section Header + Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Direct Ex-Factory Catalog
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1">
            Apparel Covers & Organization Systems
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl">
            Pick your exact quantity on any product card (retail or bulk) and check out
            with instant server-verified GST billing.
          </p>
        </div>

        {/* Live Search Input */}
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search saree covers, micron, SKU..."
            className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-slate-200 text-sm text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-amber-500/30 focus:border-amber-500 transition-all"
          />
        </div>
      </div>

      {/* Animated Category Filter Pills */}
      <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 no-scrollbar">
        {categories.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`relative px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                isActive
                  ? 'text-white'
                  : 'text-slate-600 hover:text-slate-950 bg-white border border-slate-200'
              }`}
            >
              {isActive && (
                <motion.span
                  layoutId="activeCategoryPill"
                  transition={{ type: 'spring', stiffness: 420, damping: 32 }}
                  className="absolute inset-0 rounded-full bg-slate-950 -z-0"
                />
              )}
              <span className="relative z-10">{cat}</span>
            </button>
          );
        })}
      </div>

      {/* Error State */}
      {error && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 flex items-start gap-3 text-red-800 text-sm mb-8">
          <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
          <div>
            <p className="font-bold">Could not load products from Backend API</p>
            <p className="text-xs mt-1 text-red-700">
              {error} — Make sure your Express server is running on{' '}
              <code>http://localhost:4000</code> (<code>cd backend && npm run dev</code>).
            </p>
          </div>
        </div>
      )}

      {/* Loading Skeletons */}
      {loading && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div
              key={n}
              className="rounded-3xl bg-white border border-slate-200/80 p-4 animate-pulse"
            >
              <div className="aspect-[4/3] rounded-2xl bg-slate-100 mb-4" />
              <div className="h-3 w-24 bg-slate-100 rounded mb-2" />
              <div className="h-5 w-4/5 bg-slate-200 rounded mb-3" />
              <div className="h-10 w-full bg-slate-100 rounded-xl" />
            </div>
          ))}
        </div>
      )}

      {/* Product Grid — Pure GPU transitions (no layout thrashing!) */}
      {!loading && !error && (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.map((product, index) => {
            const qty = getCardQty(product);
            const outOfStock = product.stock === 0;
            const photos = getProductPhotos(product);
            const activePhotoIdx = (cardPhotoIdx[product.id] ?? 0) % Math.max(1, photos.length);
            const currentPhoto = photos[activePhotoIdx] || product.imageUrl;
            return (
              <motion.article
                key={product.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{
                  duration: 0.42,
                  delay: Math.min(index * 0.045, 0.28),
                  ease: [0.22, 1, 0.36, 1],
                }}
                className="group rounded-3xl bg-white border border-slate-200/80 shadow-card sm:hover:shadow-soft sm:hover:-translate-y-1.5 overflow-hidden flex flex-col transition-[box-shadow,transform] duration-300 ease-out"
              >
                {/* Interactive Multi-Photo Product Image */}
                <div className="relative aspect-[4/3] overflow-hidden bg-slate-100 select-none">
                  <img
                    loading="lazy"
                    decoding="async"
                    src={currentPhoto}
                    alt={product.name}
                    className="w-full h-full object-cover transition-transform duration-300 sm:group-hover:scale-105"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5 z-10 pointer-events-none">
                    <span className="px-2.5 py-1 rounded-full bg-white/95 text-[10px] font-bold uppercase tracking-wide text-amber-700 shadow-xs">
                      {product.category}
                    </span>
                  </div>

                  {photos.length > 1 && (
                    <span className="absolute bottom-3 right-3 inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-slate-950/80 text-white text-[10px] font-bold z-10 pointer-events-none">
                      <Images className="w-3 h-3" />
                      {activePhotoIdx + 1}/{photos.length}
                    </span>
                  )}

                  {product.stock <= 25 && (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold z-10 pointer-events-none">
                      {outOfStock ? 'Out of stock' : `Only ${product.stock} left`}
                    </span>
                  )}

                  {/* Desktop Quick View Overlay Button */}
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      openQuickView(product);
                    }}
                    className="absolute inset-x-4 bottom-3.5 py-2 rounded-xl bg-white/95 hover:bg-white text-slate-900 text-xs font-bold shadow-md opacity-0 group-hover:opacity-100 transition-opacity hidden sm:flex items-center justify-center gap-1.5 z-20"
                  >
                    <Eye className="w-3.5 h-3.5 text-amber-600" />
                    <span>Quick View</span>
                  </button>

                  {/* Card Prev / Next Photo Chevrons + Dots */}
                  {photos.length > 1 && (
                    <>
                      <button
                        type="button"
                        aria-label="Previous photo"
                        onClick={(e) => stepCardPhoto(e, product.id, photos.length, -1)}
                        className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center touch-manipulation z-20 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronLeft className="w-4 h-4" />
                      </button>
                      <button
                        type="button"
                        aria-label="Next photo"
                        onClick={(e) => stepCardPhoto(e, product.id, photos.length, 1)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-800 shadow-sm flex items-center justify-center touch-manipulation z-20 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                      >
                        <ChevronRight className="w-4 h-4" />
                      </button>
                      <div className="absolute bottom-3 left-3 flex items-center gap-1 z-20">
                        {photos.map((_, dotIdx) => (
                          <button
                            key={dotIdx}
                            type="button"
                            aria-label={`Photo ${dotIdx + 1}`}
                            onClick={(e) => {
                              e.stopPropagation();
                              setCardPhotoIdx((prev) => ({
                                ...prev,
                                [product.id]: dotIdx,
                              }));
                            }}
                            className={`h-1.5 rounded-full transition-all touch-manipulation ${
                              dotIdx === activePhotoIdx
                                ? 'w-4 bg-amber-400'
                                : 'w-1.5 bg-white/80 hover:bg-white'
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="flex items-center justify-between gap-2 mb-1">
                    <span className="text-[11px] font-mono text-slate-400">
                      {product.sku}
                    </span>
                    <button
                      type="button"
                      onClick={() => openQuickView(product)}
                      className="sm:hidden inline-flex items-center gap-1 text-[11px] font-bold text-amber-600 hover:text-amber-700"
                    >
                      <Eye className="w-3.5 h-3.5" /> View Details
                    </button>
                  </div>
                  <h3
                    onClick={() => openQuickView(product)}
                    className="font-heading font-bold text-slate-950 text-base leading-snug cursor-pointer hover:text-amber-700 transition-colors"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                    {product.tagline}
                  </p>

                    {/* Spec Pill Box */}
                    <div className="mt-3.5 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Layers className="w-3 h-3" /> Spec
                        </span>
                        <span className="font-semibold text-slate-700 truncate max-w-[155px]">
                          {product.materialSpec}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-slate-400 flex items-center gap-1">
                          <Ruler className="w-3 h-3" /> Size
                        </span>
                        <span className="font-semibold text-slate-700">
                          {product.dimensions}
                        </span>
                      </div>
                    </div>

                    {/* Price + Quantity Selector + Add/Buy Actions */}
                    <div className="mt-auto pt-4 space-y-3">
                      <div className="flex items-end justify-between gap-2">
                        <div>
                          <div className="font-heading text-xl font-extrabold text-slate-950 tabular-nums">
                            ₹{product.priceINR.toLocaleString('en-IN')}
                            <span className="text-[11px] font-normal text-slate-400">
                              {' '}
                              / unit
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-500 font-medium">
                            {qty > 1
                              ? `Subtotal: ₹${(product.priceINR * qty).toLocaleString('en-IN')}`
                              : `In stock: ${product.stock}`}
                          </div>
                        </div>

                        {/* Interactive Quantity Stepper */}
                        {!outOfStock && (
                          <div className="inline-flex items-center rounded-xl bg-slate-50 border border-slate-200 p-0.5">
                            <button
                              type="button"
                              aria-label="Decrease quantity"
                              onClick={() => setCardQty(product, qty - 1)}
                              className="w-8 h-8 rounded-lg hover:bg-white active:bg-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors touch-manipulation"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <input
                              type="number"
                              min={1}
                              max={product.stock}
                              value={qty}
                              onChange={(e) =>
                                setCardQty(product, parseInt(e.target.value, 10))
                              }
                              aria-label="Quantity"
                              className="w-10 text-center bg-transparent text-xs font-extrabold text-slate-950 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            />
                            <button
                              type="button"
                              aria-label="Increase quantity"
                              onClick={() => setCardQty(product, qty + 1)}
                              className="w-8 h-8 rounded-lg hover:bg-white active:bg-slate-200 text-slate-700 hover:text-slate-950 flex items-center justify-center transition-colors touch-manipulation"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Dual Buttons: Add to Cart + Instant Checkout */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          disabled={outOfStock}
                          onClick={() => handleCardAdd(product)}
                          className={`inline-flex items-center justify-center gap-1.5 py-2.5 px-3 rounded-xl text-xs font-bold active:scale-[0.97] transition-[transform,background-color] duration-200 touch-manipulation ${
                            addedId === product.id
                              ? 'bg-emerald-600 text-white'
                              : outOfStock
                                ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                                : 'bg-slate-950 hover:bg-slate-800 text-white'
                          }`}
                        >
                          {addedId === product.id ? (
                            <>
                              <Check className="w-3.5 h-3.5" /> Added
                            </>
                          ) : (
                            <>
                              <ShoppingBag className="w-3.5 h-3.5" /> Add ({qty})
                            </>
                          )}
                        </button>

                        <button
                          disabled={outOfStock}
                          onClick={() => handleCardBuyNow(product)}
                          className={`inline-flex items-center justify-center gap-1 py-2.5 px-3 rounded-xl text-xs font-bold active:scale-[0.97] transition-[transform,background-color] duration-200 touch-manipulation ${
                            outOfStock
                              ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                              : 'bg-amber-500 hover:bg-amber-600 text-white'
                          }`}
                        >
                          <Zap className="w-3.5 h-3.5" /> Buy Now
                        </button>
                      </div>
                    </div>
                  </div>
                </motion.article>
            );
          })}
        </div>
      )}

      {!loading && !error && products.length === 0 && (
        <div className="text-center py-16 rounded-3xl bg-white border border-slate-200">
          <p className="font-heading font-bold text-slate-900">
            No products matched your filter
          </p>
          <button
            onClick={() => {
              setActiveCategory('All');
              setSearch('');
            }}
            className="mt-3 text-xs font-semibold text-amber-700 hover:underline"
          >
            Reset search & filters
          </button>
        </div>
      )}

      {/* Product Quick View Modal (with Quantity Presets & Live Total) */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-3 sm:p-4 overscroll-contain"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.96 }}
              transition={{ duration: 0.2 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-slate-200 max-h-[88vh] max-h-[88dvh] flex flex-col md:grid md:grid-cols-2 overflow-y-auto overscroll-contain [-webkit-overflow-scrolling:touch]"
            >
              <button
                type="button"
                aria-label="Close modal"
                onClick={() => setSelectedProduct(null)}
                className="sticky md:absolute top-3 right-3 self-end z-30 p-2.5 rounded-full bg-white/95 border border-slate-200 text-slate-800 shadow-md active:bg-slate-200 touch-manipulation cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>

              <div className="bg-slate-50 p-4 flex flex-col justify-between gap-3">
                {(() => {
                  const modalPhotos = getProductPhotos(selectedProduct);
                  const safeIdx = modalPhotoIdx % Math.max(1, modalPhotos.length);
                  const activeUrl = modalPhotos[safeIdx] || selectedProduct.imageUrl;
                  return (
                    <>
                      <div className="relative rounded-2xl overflow-hidden bg-slate-100 aspect-[4/3] border border-slate-200/80">
                        <AnimatePresence mode="wait">
                          <motion.img
                            key={activeUrl}
                            src={activeUrl}
                            alt={`${selectedProduct.name} — view ${safeIdx + 1}`}
                            loading="lazy"
                            decoding="async"
                            initial={{ opacity: 0.25 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0.25 }}
                            transition={{ duration: 0.2 }}
                            className="w-full h-full object-cover"
                          />
                        </AnimatePresence>

                        {modalPhotos.length > 1 && (
                          <>
                            <button
                              type="button"
                              aria-label="Previous photo"
                              onClick={() =>
                                setModalPhotoIdx(
                                  (safeIdx - 1 + modalPhotos.length) %
                                    modalPhotos.length
                                )
                              }
                              className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow flex items-center justify-center"
                            >
                              <ChevronLeft className="w-4 h-4" />
                            </button>
                            <button
                              type="button"
                              aria-label="Next photo"
                              onClick={() =>
                                setModalPhotoIdx((safeIdx + 1) % modalPhotos.length)
                              }
                              className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-slate-900 shadow flex items-center justify-center"
                            >
                              <ChevronRight className="w-4 h-4" />
                            </button>
                            <span className="absolute bottom-2.5 right-2.5 px-2.5 py-0.5 rounded-full bg-slate-950/75 text-white text-[10px] font-bold">
                              {safeIdx + 1} / {modalPhotos.length}
                            </span>
                          </>
                        )}
                      </div>

                      {modalPhotos.length > 1 && (
                        <div className="grid grid-cols-4 gap-2">
                          {modalPhotos.map((url, idx) => (
                            <button
                              key={url}
                              type="button"
                              onClick={() => setModalPhotoIdx(idx)}
                              className={`rounded-xl overflow-hidden aspect-[4/3] border-2 transition-all ${
                                idx === safeIdx
                                  ? 'border-amber-500 ring-2 ring-amber-500/25'
                                  : 'border-slate-200 opacity-70 hover:opacity-100'
                              }`}
                            >
                              <img
                                loading="lazy"
                                decoding="async"
                                src={url}
                                alt={`Thumbnail ${idx + 1}`}
                                className="w-full h-full object-cover"
                              />
                            </button>
                          ))}
                        </div>
                      )}
                    </>
                  );
                })()}
              </div>

              <div className="p-6 flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  {selectedProduct.category} • {selectedProduct.sku}
                </span>
                <h3 className="font-heading text-xl font-extrabold text-slate-950 mt-1">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                  {selectedProduct.description}
                </p>

                <div className="mt-4 space-y-1.5 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Material</span>
                    <span className="font-semibold text-slate-800 text-right">
                      {selectedProduct.materialSpec}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Dimensions</span>
                    <span className="font-semibold text-slate-800">
                      {selectedProduct.dimensions}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Available Stock</span>
                    <span className="font-semibold text-emerald-700 inline-flex items-center gap-1">
                      <PackageCheck className="w-3.5 h-3.5" /> {selectedProduct.stock}{' '}
                      units
                    </span>
                  </div>
                </div>

                {/* Quantity Selector + Quick Bulk Presets */}
                {selectedProduct.stock > 0 && (
                  <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-700">
                        Select Quantity
                      </span>
                      <div className="inline-flex items-center rounded-xl bg-white border border-slate-200 p-0.5">
                        <button
                          type="button"
                          onClick={() => setModalQty((q) => Math.max(1, q - 1))}
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center touch-manipulation"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <input
                          type="number"
                          min={1}
                          max={selectedProduct.stock}
                          value={modalQty}
                          onChange={(e) => {
                            const val = parseInt(e.target.value, 10) || 1;
                            setModalQty(
                              Math.min(Math.max(1, val), selectedProduct.stock)
                            );
                          }}
                          className="w-12 text-center text-xs font-extrabold text-slate-950 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setModalQty((q) => Math.min(selectedProduct.stock, q + 1))
                          }
                          className="w-8 h-8 rounded-lg hover:bg-slate-100 active:bg-slate-200 flex items-center justify-center touch-manipulation"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>

                    {quickPresets.length > 1 && (
                      <div className="flex flex-wrap gap-1.5">
                        {quickPresets.map((preset) => (
                          <button
                            key={preset}
                            type="button"
                            onClick={() => setModalQty(preset)}
                            className={`px-2.5 py-1.5 rounded-lg text-[11px] font-bold transition-colors touch-manipulation active:scale-95 ${
                              modalQty === preset
                                ? 'bg-slate-950 text-white'
                                : 'bg-white border border-slate-200 text-slate-600 hover:border-amber-500'
                            }`}
                          >
                            {preset} pcs
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-auto pt-4 space-y-3">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="font-heading text-2xl font-extrabold text-slate-950 tabular-nums">
                        ₹
                        {(selectedProduct.priceINR * modalQty).toLocaleString('en-IN')}
                      </div>
                      <div className="text-[11px] text-slate-400">
                        ₹{selectedProduct.priceINR.toLocaleString('en-IN')} × {modalQty}{' '}
                        (+ 18% GST at checkout)
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2 pb-1">
                    <button
                      disabled={selectedProduct.stock === 0}
                      onClick={() => {
                        addToCart(selectedProduct, modalQty);
                        setCardQty(selectedProduct, modalQty);
                        setSelectedProduct(null);
                      }}
                      className="py-3 px-2 rounded-xl bg-slate-950 hover:bg-slate-800 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold transition-all touch-manipulation"
                    >
                      Add {modalQty} to Cart
                    </button>
                    <button
                      disabled={selectedProduct.stock === 0}
                      onClick={() => {
                        addToCart(selectedProduct, modalQty);
                        setCardQty(selectedProduct, modalQty);
                        setSelectedProduct(null);
                        openCart();
                      }}
                      className="py-3 px-2 rounded-xl bg-amber-500 hover:bg-amber-600 active:scale-[0.98] disabled:opacity-50 text-white text-xs font-bold transition-all touch-manipulation"
                    >
                      Buy Now & Checkout
                    </button>
                  </div>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
