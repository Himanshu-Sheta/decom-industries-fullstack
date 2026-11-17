'use client';

import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  Search,
  Download,
  Edit3,
  Trash2,
  Star,
  X,
  Check,
  Archive,
  RotateCcw,
  UploadCloud,
  Loader2,
  Image as ImageIcon,
} from 'lucide-react';
import { productsApi, uploadApi, ApiError } from '@/lib/api';
import type { Product } from '@/lib/types';
import { DECOM_IMAGES, exportToCsv, formatINR } from './adminUtils';

interface ProductsTabProps {
  products: Product[];
  globalSearch: string;
  onChanged: (toast: string) => void;
  onError: (msg: string) => void;
  triggerAddCount: number;
}

const EMPTY_FORM = {
  name: '',
  slug: '',
  sku: '',
  category: 'PVC Saree Covers',
  tagline: '',
  description: '',
  materialSpec: '150 Micron Virgin Crystal PVC',
  dimensions: '42 × 35 × 5 cm',
  moq: 5,
  priceINR: 250,
  samplePriceINR: 320,
  stock: 100,
  imageUrl: '/images/product-saree-organizer.jpg',
  galleryUrls: ['/images/product-saree-organizer.jpg'] as string[],
  isFeatured: false,
  isActive: true,
};

export function ProductsTab({
  products,
  globalSearch,
  onChanged,
  onError,
  triggerAddCount,
}: ProductsTabProps) {
  const [localSearch, setLocalSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'ARCHIVED'>('ALL');

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [dragActive, setDragActive] = useState(false);
  const [uploadStatus, setUploadStatus] = useState<string | null>(null);

  const handleImageFiles = async (fileList: FileList | null | undefined) => {
    if (!fileList || fileList.length === 0) return;
    const files = Array.from(fileList);
    setUploading(true);
    setUploadStatus(null);
    try {
      const uploadedUrls: string[] = [];
      let totalKB = 0;
      for (const file of files) {
        const res = await uploadApi.productImage(file);
        uploadedUrls.push(res.imageUrl);
        totalKB += Math.round(res.sizeBytes / 1024);
      }
      setForm((f) => {
        const existing = f.galleryUrls.length > 0 ? f.galleryUrls : [f.imageUrl].filter(Boolean);
        // Replace default placeholder when creating a brand-new product
        const base =
          !editingId &&
          existing.length === 1 &&
          existing[0] === EMPTY_FORM.imageUrl
            ? []
            : existing;
        const merged = Array.from(new Set([...base, ...uploadedUrls])).slice(0, 12);
        return {
          ...f,
          imageUrl: merged[0] || uploadedUrls[0],
          galleryUrls: merged,
        };
      });
      setUploadStatus(
        `Uploaded ${uploadedUrls.length} photo${uploadedUrls.length > 1 ? 's' : ''} (${totalKB} KB total)`
      );
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Image upload failed.');
    } finally {
      setUploading(false);
    }
  };

  const setCoverPhoto = (url: string) => {
    setForm((f) => {
      const rest = f.galleryUrls.filter((u) => u !== url);
      return {
        ...f,
        imageUrl: url,
        galleryUrls: [url, ...rest],
      };
    });
  };

  const removeGalleryPhoto = (url: string) => {
    setForm((f) => {
      const remaining = f.galleryUrls.filter((u) => u !== url);
      if (remaining.length === 0) {
        return { ...f, imageUrl: '', galleryUrls: [] };
      }
      return {
        ...f,
        imageUrl: remaining[0],
        galleryUrls: remaining,
      };
    });
  };

  const addPresetPhoto = (url: string) => {
    setForm((f) => {
      const merged = Array.from(new Set([...f.galleryUrls, url])).slice(0, 12);
      return {
        ...f,
        imageUrl: f.imageUrl || merged[0],
        galleryUrls: merged,
      };
    });
  };

  // Open drawer when parent Top Bar clicks "+ New Product"
  React.useEffect(() => {
    if (triggerAddCount > 0) {
      setEditingId(null);
      setForm(EMPTY_FORM);
      setDrawerOpen(true);
    }
  }, [triggerAddCount]);

  const categories = useMemo(
    () => ['All', ...Array.from(new Set(products.map((p) => p.category))).sort()],
    [products]
  );

  const filtered = useMemo(() => {
    const q = (localSearch || globalSearch).trim().toLowerCase();
    return products.filter((p) => {
      if (categoryFilter !== 'All' && p.category !== categoryFilter) return false;
      if (statusFilter === 'ACTIVE' && !p.isActive) return false;
      if (statusFilter === 'ARCHIVED' && p.isActive) return false;
      if (
        q &&
        !p.name.toLowerCase().includes(q) &&
        !p.sku.toLowerCase().includes(q) &&
        !p.category.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [products, localSearch, globalSearch, categoryFilter, statusFilter]);

  const openCreate = () => {
    setEditingId(null);
    setForm(EMPTY_FORM);
    setUploadStatus(null);
    setDrawerOpen(true);
  };

  const openEdit = (p: Product) => {
    setEditingId(p.id);
    setUploadStatus(null);
    const gallery =
      p.galleryUrls && p.galleryUrls.length > 0
        ? Array.from(new Set([p.imageUrl, ...p.galleryUrls]))
        : [p.imageUrl];
    setForm({
      name: p.name,
      slug: p.slug,
      sku: p.sku,
      category: p.category,
      tagline: p.tagline,
      description: p.description,
      materialSpec: p.materialSpec,
      dimensions: p.dimensions,
      moq: p.moq,
      priceINR: p.priceINR,
      samplePriceINR: p.samplePriceINR,
      stock: p.stock,
      imageUrl: p.imageUrl,
      galleryUrls: gallery,
      isFeatured: p.isFeatured,
      isActive: p.isActive,
    });
    setDrawerOpen(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    try {
      if (editingId) {
        await productsApi.update(editingId, form);
        onChanged(`Updated "${form.name}" in PostgreSQL!`);
      } else {
        await productsApi.create(form);
        onChanged(`Created "${form.name}" in PostgreSQL!`);
      }
      setDrawerOpen(false);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Failed to save product.');
    } finally {
      setSaving(false);
    }
  };

  const handleStockDelta = async (p: Product, delta: number) => {
    try {
      const nextStock = Math.max(0, p.stock + delta);
      await productsApi.update(p.id, { stock: nextStock });
      onChanged(`${p.sku} stock updated → ${nextStock}`);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Stock update failed.');
    }
  };

  const handleToggleFeatured = async (p: Product) => {
    try {
      await productsApi.update(p.id, { isFeatured: !p.isFeatured });
      onChanged(
        `${p.sku} ${!p.isFeatured ? 'marked Featured' : 'removed from Featured'}`
      );
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Update failed.');
    }
  };

  const handleToggleActive = async (p: Product) => {
    try {
      await productsApi.update(p.id, { isActive: !p.isActive });
      onChanged(`${p.sku} ${!p.isActive ? 'restored to Active' : 'archived'}`);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Status toggle failed.');
    }
  };

  const handleDelete = async (p: Product) => {
    if (!confirm(`Delete or archive "${p.name}" (${p.sku})?`)) return;
    try {
      const res = await productsApi.remove(p.id);
      onChanged(res.message);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Delete failed.');
    }
  };

  const handleExport = () => {
    exportToCsv(
      'decom-products.csv',
      filtered.map((p) => ({
        SKU: p.sku,
        Name: p.name,
        Category: p.category,
        PriceINR: p.priceINR,
        Stock: p.stock,
        MOQ: p.moq,
        Status: p.isActive ? 'ACTIVE' : 'ARCHIVED',
        Featured: p.isFeatured ? 'YES' : 'NO',
      }))
    );
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-card flex flex-col lg:flex-row lg:items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative flex-1 min-w-[200px] max-w-xs">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Filter name, SKU, category..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>

          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs font-semibold text-slate-700"
          >
            {categories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>

          <div className="inline-flex rounded-xl bg-slate-100 p-0.5 text-[11px] font-bold">
            {(['ALL', 'ACTIVE', 'ARCHIVED'] as const).map((s) => (
              <button
                key={s}
                onClick={() => setStatusFilter(s)}
                className={`px-3 py-1.5 rounded-lg transition-all ${
                  statusFilter === s
                    ? 'bg-white text-slate-950 shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" /> CSV
          </button>
          <button
            onClick={openCreate}
            className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-950 hover:bg-amber-600 text-white text-xs font-bold transition-colors"
          >
            <Plus className="w-4 h-4" /> Add Product
          </button>
        </div>
      </div>

      {/* Products Table */}
      <div className="rounded-2xl bg-white border border-slate-200/80 shadow-card overflow-x-auto">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-50/90 border-b border-slate-200 text-[11px] uppercase tracking-wide text-slate-500">
            <tr>
              <th className="px-5 py-3.5">Product</th>
              <th className="px-4 py-3.5">SKU / Spec</th>
              <th className="px-4 py-3.5">Price</th>
              <th className="px-4 py-3.5">Quick Stock Control</th>
              <th className="px-4 py-3.5">Visibility</th>
              <th className="px-5 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50/70 transition-colors">
                <td className="px-5 py-3.5">
                  <div className="flex items-center gap-3">
                    <div className="relative shrink-0">
                      <img
                        src={p.imageUrl}
                        alt={p.name}
                        className="w-12 h-12 rounded-xl object-cover border border-slate-200"
                      />
                      {p.galleryUrls && p.galleryUrls.length > 1 && (
                        <span className="absolute -bottom-1 -right-1 px-1.5 py-0.5 rounded-md bg-slate-950 text-white text-[9px] font-bold">
                          +{p.galleryUrls.length - 1}
                        </span>
                      )}
                    </div>
                    <div className="min-w-0 max-w-[240px]">
                      <div className="font-bold text-slate-950 truncate">{p.name}</div>
                      <div className="text-[11px] text-amber-700 font-semibold">
                        {p.category}
                      </div>
                    </div>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-mono font-bold text-slate-800">{p.sku}</div>
                  <div className="text-[11px] text-slate-500">{p.dimensions}</div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="font-heading font-extrabold text-sm text-slate-950 tabular-nums">
                    {formatINR(p.priceINR)}
                  </div>
                  <div className="text-[10px] text-slate-400">
                    MOQ: {p.moq} • Sample: {formatINR(p.samplePriceINR)}
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="inline-flex items-center gap-1.5">
                    <button
                      onClick={() => handleStockDelta(p, -10)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                    >
                      -10
                    </button>
                    <span
                      className={`min-w-[42px] text-center font-mono font-extrabold text-xs px-2 py-1 rounded-lg ${
                        p.stock <= 25
                          ? 'bg-rose-50 text-rose-700'
                          : p.stock <= 50
                            ? 'bg-amber-50 text-amber-800'
                            : 'bg-emerald-50 text-emerald-700'
                      }`}
                    >
                      {p.stock}
                    </span>
                    <button
                      onClick={() => handleStockDelta(p, 10)}
                      className="px-2 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px]"
                    >
                      +10
                    </button>
                    <button
                      onClick={() => handleStockDelta(p, 50)}
                      className="px-2 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px]"
                    >
                      +50
                    </button>
                  </div>
                </td>
                <td className="px-4 py-3.5">
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => handleToggleFeatured(p)}
                      title="Toggle Featured on Storefront"
                      className={`p-1.5 rounded-lg border transition-colors ${
                        p.isFeatured
                          ? 'bg-amber-50 border-amber-200 text-amber-600'
                          : 'bg-white border-slate-200 text-slate-300 hover:text-slate-600'
                      }`}
                    >
                      <Star
                        className={`w-3.5 h-3.5 ${p.isFeatured ? 'fill-amber-500' : ''}`}
                      />
                    </button>
                    <button
                      onClick={() => handleToggleActive(p)}
                      className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold border ${
                        p.isActive
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-600 border-slate-200'
                      }`}
                    >
                      {p.isActive ? (
                        <>
                          <Check className="w-3 h-3" /> Active
                        </>
                      ) : (
                        <>
                          <Archive className="w-3 h-3" /> Archived
                        </>
                      )}
                    </button>
                  </div>
                </td>
                <td className="px-5 py-3.5 text-right">
                  <div className="inline-flex items-center gap-1">
                    <button
                      onClick={() => openEdit(p)}
                      className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-900 hover:text-white text-slate-700 font-bold text-[11px] transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" /> Edit
                    </button>
                    {!p.isActive && (
                      <button
                        onClick={() => handleToggleActive(p)}
                        title="Restore Active"
                        className="p-1.5 rounded-lg text-emerald-600 hover:bg-emerald-50"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                    <button
                      onClick={() => handleDelete(p)}
                      title="Delete / Archive"
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}

            {filtered.length === 0 && (
              <tr>
                <td colSpan={6} className="py-12 text-center text-slate-400">
                  No products match your filter.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {/* Add / Edit Product Slide-Over Drawer */}
      <AnimatePresence>
        {drawerOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setDrawerOpen(false)}
              className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-sm"
            />
            <motion.aside
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', damping: 28, stiffness: 300 }}
              className="fixed top-0 right-0 bottom-0 z-50 w-full max-w-xl bg-white shadow-2xl border-l border-slate-200 flex flex-col"
            >
              <div className="px-6 py-4 border-b border-slate-200 flex items-center justify-between">
                <div>
                  <h3 className="font-heading font-extrabold text-lg text-slate-950">
                    {editingId ? 'Edit Product' : 'Add New Product'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    Changes sync live to your Storefront & PostgreSQL database
                  </p>
                </div>
                <button
                  onClick={() => setDrawerOpen(false)}
                  className="p-2 rounded-full hover:bg-slate-100 text-slate-500"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form
                id="product-drawer-form"
                onSubmit={handleSave}
                className="flex-1 overflow-y-auto p-6 space-y-4 text-xs"
              >
                {/* Multi-Photo Upload from Computer + Gallery Manager */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <label className="block font-bold text-slate-700">
                      Product Photos ({form.galleryUrls.length} / 12)
                    </label>
                    <span className="text-[10px] text-slate-400 font-semibold">
                      Select multiple files at once
                    </span>
                  </div>

                  {/* Live Cover Preview + Multi-File Dropzone */}
                  <div className="grid grid-cols-1 sm:grid-cols-12 gap-3 items-stretch">
                    <div className="sm:col-span-5 relative rounded-2xl overflow-hidden border border-slate-200 bg-slate-100 aspect-[4/3]">
                      {form.imageUrl ? (
                        <img
                          src={form.imageUrl}
                          alt="Product cover preview"
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-slate-400">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                      )}
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-slate-950/80 text-amber-300 text-[10px] font-bold">
                        Cover Photo
                      </span>
                    </div>

                    <label
                      onDragOver={(e) => {
                        e.preventDefault();
                        setDragActive(true);
                      }}
                      onDragLeave={() => setDragActive(false)}
                      onDrop={(e) => {
                        e.preventDefault();
                        setDragActive(false);
                        handleImageFiles(e.dataTransfer.files);
                      }}
                      className={`sm:col-span-7 rounded-2xl border-2 border-dashed p-4 flex flex-col items-center justify-center text-center cursor-pointer transition-all ${
                        dragActive
                          ? 'border-amber-500 bg-amber-50'
                          : 'border-slate-300 bg-slate-50 hover:border-amber-500 hover:bg-amber-50/40'
                      }`}
                    >
                      <input
                        type="file"
                        multiple
                        accept="image/jpeg,image/png,image/webp"
                        disabled={uploading}
                        onChange={(e) => {
                          handleImageFiles(e.target.files);
                          e.target.value = '';
                        }}
                        className="hidden"
                      />
                      {uploading ? (
                        <>
                          <Loader2 className="w-6 h-6 text-amber-600 animate-spin mb-1.5" />
                          <span className="font-bold text-slate-800">
                            Uploading photos...
                          </span>
                        </>
                      ) : (
                        <>
                          <UploadCloud className="w-6 h-6 text-amber-600 mb-1.5" />
                          <span className="font-bold text-slate-900">
                            Click or drop 1 or multiple images
                          </span>
                          <span className="text-[10px] text-slate-500 mt-0.5">
                            JPG, PNG, WebP • Max 5 MB each • Up to 12 photos
                          </span>
                        </>
                      )}
                    </label>
                  </div>

                  {uploadStatus && (
                    <div className="px-3 py-2 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-[11px] font-bold flex items-center gap-1.5">
                      <Check className="w-3.5 h-3.5 shrink-0" />
                      {uploadStatus}
                    </div>
                  )}

                  {/* Active Product Gallery Strip (Reorder Cover / Remove) */}
                  {form.galleryUrls.length > 0 && (
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                        Uploaded Gallery (click a photo to set as Cover, × to remove)
                      </span>
                      <div className="grid grid-cols-4 gap-2">
                        {form.galleryUrls.map((url, idx) => {
                          const isCover = url === form.imageUrl || idx === 0;
                          return (
                            <div
                              key={url}
                              className={`relative group rounded-xl overflow-hidden border-2 aspect-[4/3] bg-white ${
                                isCover ? 'border-amber-500' : 'border-slate-200'
                              }`}
                            >
                              <img
                                src={url}
                                alt={`Gallery ${idx + 1}`}
                                onClick={() => setCoverPhoto(url)}
                                className="w-full h-full object-cover cursor-pointer"
                              />
                              {isCover ? (
                                <span className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-amber-500 text-slate-950 text-[9px] font-extrabold">
                                  Cover
                                </span>
                              ) : (
                                <button
                                  type="button"
                                  onClick={() => setCoverPhoto(url)}
                                  className="absolute bottom-1 left-1 px-1.5 py-0.5 rounded bg-slate-950/80 text-white text-[9px] font-bold opacity-0 group-hover:opacity-100 transition-opacity"
                                >
                                  Set Cover
                                </button>
                              )}
                              <button
                                type="button"
                                onClick={() => removeGalleryPhoto(url)}
                                aria-label="Remove photo"
                                className="absolute top-1 right-1 w-5 h-5 rounded-full bg-slate-950/80 hover:bg-rose-600 text-white flex items-center justify-center"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* Quick Preset Gallery (appends to product gallery) */}
                  <div>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Or click a Decom preset photo to add to gallery
                    </span>
                    <div className="grid grid-cols-4 gap-2">
                      {DECOM_IMAGES.map((img) => {
                        const inGallery = form.galleryUrls.includes(img.url);
                        return (
                          <button
                            key={img.url}
                            type="button"
                            onClick={() => addPresetPhoto(img.url)}
                            className={`relative rounded-xl overflow-hidden border-2 aspect-[4/3] transition-all ${
                              inGallery
                                ? 'border-amber-500 ring-2 ring-amber-500/20'
                                : 'border-slate-200 opacity-75 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img.url}
                              alt={img.label}
                              className="w-full h-full object-cover"
                            />
                            <span className="absolute inset-x-0 bottom-0 bg-slate-950/70 text-[9px] text-white px-1 py-0.5 truncate">
                              {inGallery ? '✓ ' : '+ '}
                              {img.label}
                            </span>
                          </button>
                        );
                      })}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Product Name *
                    </label>
                    <input
                      required
                      value={form.name}
                      onChange={(e) => {
                        const name = e.target.value;
                        const autoSlug = name
                          .toLowerCase()
                          .replace(/[^a-z0-9]+/g, '-')
                          .replace(/(^-|-$)/g, '');
                        setForm((f) => ({
                          ...f,
                          name,
                          slug: editingId ? f.slug : autoSlug,
                        }));
                      }}
                      placeholder="e.g. Heavy-Duty Bridal Saree Cover"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      URL Slug *
                    </label>
                    <input
                      required
                      value={form.slug}
                      onChange={(e) => setForm((f) => ({ ...f, slug: e.target.value }))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      SKU Code *
                    </label>
                    <input
                      required
                      value={form.sku}
                      onChange={(e) => setForm((f) => ({ ...f, sku: e.target.value }))}
                      placeholder="DCM-SAR-180"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200 font-mono"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Category *
                    </label>
                    <input
                      required
                      value={form.category}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, category: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 mb-1">
                      Dimensions *
                    </label>
                    <input
                      required
                      value={form.dimensions}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, dimensions: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Material Specification *
                    </label>
                    <input
                      required
                      value={form.materialSpec}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, materialSpec: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Short Tagline *
                    </label>
                    <input
                      required
                      value={form.tagline}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, tagline: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>

                  <div className="grid grid-cols-4 gap-2.5 sm:col-span-2">
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Price (₹)
                      </label>
                      <input
                        required
                        type="number"
                        min={1}
                        value={form.priceINR}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, priceINR: Number(e.target.value) }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Sample (₹)
                      </label>
                      <input
                        required
                        type="number"
                        min={1}
                        value={form.samplePriceINR}
                        onChange={(e) =>
                          setForm((f) => ({
                            ...f,
                            samplePriceINR: Number(e.target.value),
                          }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">
                        Stock
                      </label>
                      <input
                        required
                        type="number"
                        min={0}
                        value={form.stock}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, stock: Number(e.target.value) }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                    <div>
                      <label className="block font-bold text-slate-700 mb-1">MOQ</label>
                      <input
                        required
                        type="number"
                        min={1}
                        value={form.moq}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, moq: Number(e.target.value) }))
                        }
                        className="w-full px-3 py-2 rounded-xl bg-slate-50 border border-slate-200"
                      />
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block font-bold text-slate-700 mb-1">
                      Full Description *
                    </label>
                    <textarea
                      required
                      rows={3}
                      value={form.description}
                      onChange={(e) =>
                        setForm((f) => ({ ...f, description: e.target.value }))
                      }
                      className="w-full px-3.5 py-2.5 rounded-xl bg-slate-50 border border-slate-200"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-6 pt-1">
                    <label className="inline-flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isFeatured}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, isFeatured: e.target.checked }))
                        }
                        className="w-4 h-4 accent-amber-600"
                      />
                      Featured Product
                    </label>
                    <label className="inline-flex items-center gap-2 font-bold text-slate-700 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={form.isActive}
                        onChange={(e) =>
                          setForm((f) => ({ ...f, isActive: e.target.checked }))
                        }
                        className="w-4 h-4 accent-emerald-600"
                      />
                      Visible on Storefront
                    </label>
                  </div>
                </div>
              </form>

              <div className="px-6 py-4 border-t border-slate-200 bg-slate-50 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setDrawerOpen(false)}
                  className="px-4 py-2.5 rounded-xl bg-white border border-slate-200 text-slate-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  form="product-drawer-form"
                  type="submit"
                  disabled={saving || uploading}
                  className="px-5 py-2.5 rounded-xl bg-slate-950 hover:bg-amber-600 disabled:opacity-60 text-white text-xs font-bold transition-colors"
                >
                  {uploading
                    ? 'Uploading Photo...'
                    : saving
                      ? 'Saving...'
                      : editingId
                        ? 'Save Changes'
                        : 'Create Product'}
                </button>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
