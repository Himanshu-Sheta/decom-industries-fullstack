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
} from 'lucide-react';
import { productsApi } from '@/lib/api';
import type { Product } from '@/lib/types';
import { useCart } from '@/context/CartContext';

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

  const handleQuickAdd = (product: Product) => {
    addToCart(product, 1);
    setAddedId(product.id);
    setTimeout(() => setAddedId(null), 1200);
  };

  return (
    <section id="products" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      {/* Section Header + Search */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-10">
        <div>
          <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
            Live PostgreSQL Catalog
          </span>
          <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1">
            Apparel Covers & Organization Systems
          </h2>
          <p className="text-sm text-slate-600 mt-2 max-w-xl">
            Every product below is loaded live from your Docker PostgreSQL database via{' '}
            <code className="text-xs bg-slate-100 px-1.5 py-0.5 rounded">
              GET /api/products
            </code>
            .
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
                isActive ? 'text-white' : 'text-slate-600 hover:text-slate-950 bg-white border border-slate-200'
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

      {/* Product Grid */}
      {!loading && !error && (
        <motion.div
          layout
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6"
        >
          <AnimatePresence mode="popLayout">
            {products.map((product, index) => (
              <motion.article
                layout
                key={product.id}
                initial={{ opacity: 0, y: 18 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.35, delay: Math.min(index * 0.04, 0.25) }}
                whileHover={{ y: -4 }}
                className="group rounded-3xl bg-white border border-slate-200/80 shadow-card hover:shadow-soft overflow-hidden flex flex-col transition-shadow"
              >
                {/* Product Image */}
                <div
                  onClick={() => setSelectedProduct(product)}
                  className="relative aspect-[4/3] overflow-hidden bg-slate-100 cursor-pointer"
                >
                  <img
                    src={product.imageUrl}
                    alt={product.name}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute top-3 left-3 flex gap-1.5">
                    <span className="px-2.5 py-1 rounded-full bg-white/95 backdrop-blur text-[10px] font-bold uppercase tracking-wide text-amber-700 shadow-sm">
                      {product.category}
                    </span>
                  </div>
                  {product.stock <= 25 && (
                    <span className="absolute top-3 right-3 px-2 py-1 rounded-full bg-rose-600 text-white text-[10px] font-bold">
                      Only {product.stock} left
                    </span>
                  )}
                </div>

                {/* Card Body */}
                <div className="p-5 flex-1 flex flex-col">
                  <div className="text-[11px] font-mono text-slate-400 mb-1">
                    {product.sku}
                  </div>
                  <h3
                    onClick={() => setSelectedProduct(product)}
                    className="font-heading font-bold text-slate-950 text-base leading-snug cursor-pointer hover:text-amber-700 transition-colors"
                  >
                    {product.name}
                  </h3>
                  <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">
                    {product.tagline}
                  </p>

                  {/* Spec Pill Box */}
                  <div className="mt-4 p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5 text-[11px]">
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

                  {/* Price & Add Button */}
                  <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                    <div>
                      <div className="font-heading text-xl font-extrabold text-slate-950">
                        ₹{product.priceINR.toLocaleString('en-IN')}
                      </div>
                      <div className="text-[10px] text-slate-400 font-medium">
                        In stock: {product.stock}
                      </div>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      disabled={product.stock === 0}
                      onClick={() => handleQuickAdd(product)}
                      className={`inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${
                        addedId === product.id
                          ? 'bg-emerald-600 text-white'
                          : product.stock === 0
                            ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                            : 'bg-slate-950 hover:bg-amber-600 text-white'
                      }`}
                    >
                      {addedId === product.id ? (
                        <>
                          <Check className="w-3.5 h-3.5" /> Added
                        </>
                      ) : (
                        <>
                          <ShoppingBag className="w-3.5 h-3.5" /> Add
                        </>
                      )}
                    </motion.button>
                  </div>
                </div>
              </motion.article>
            ))}
          </AnimatePresence>
        </motion.div>
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

      {/* Product Quick View Modal */}
      <AnimatePresence>
        {selectedProduct && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedProduct(null)}
            className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-center justify-center p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.94, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              onClick={(e) => e.stopPropagation()}
              className="relative w-full max-w-2xl bg-white rounded-3xl overflow-hidden shadow-2xl border border-slate-200 grid grid-cols-1 md:grid-cols-2"
            >
              <button
                onClick={() => setSelectedProduct(null)}
                className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/90 hover:bg-slate-100 text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="bg-slate-100 aspect-square md:aspect-auto">
                <img
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  className="w-full h-full object-cover"
                />
              </div>

              <div className="p-6 flex flex-col">
                <span className="text-[11px] font-bold uppercase tracking-wider text-amber-600">
                  {selectedProduct.category} • {selectedProduct.sku}
                </span>
                <h3 className="font-heading text-xl font-extrabold text-slate-950 mt-1">
                  {selectedProduct.name}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-3">
                  {selectedProduct.description}
                </p>

                <div className="mt-4 space-y-2 text-xs border-t border-slate-100 pt-4">
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
                      <PackageCheck className="w-3.5 h-3.5" /> {selectedProduct.stock} units
                    </span>
                  </div>
                </div>

                <div className="mt-auto pt-6 flex items-center justify-between gap-3">
                  <div>
                    <div className="font-heading text-2xl font-extrabold text-slate-950">
                      ₹{selectedProduct.priceINR.toLocaleString('en-IN')}
                    </div>
                    <div className="text-[11px] text-slate-400">+ 18% GST at checkout</div>
                  </div>
                  <button
                    onClick={() => {
                      addToCart(selectedProduct, 1);
                      setSelectedProduct(null);
                      openCart();
                    }}
                    className="px-5 py-3 rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
                  >
                    Add & Checkout
                  </button>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </section>
  );
}
