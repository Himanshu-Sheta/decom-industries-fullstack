'use client';

import React, { useState, useMemo } from 'react';
import {
  Search,
  Mail,
  MessageCircle,
  Trash2,
  Sparkles,
  Download,
} from 'lucide-react';
import { oemApi, ApiError } from '@/lib/api';
import type { OemQuote, QuoteStatus } from '@/lib/types';
import { exportToCsv, QUOTE_STATUS_META } from './adminUtils';

interface OemTabProps {
  quotes: OemQuote[];
  globalSearch: string;
  onChanged: (toast: string) => void;
  onError: (msg: string) => void;
}

const QUOTE_STATUSES: ('ALL' | QuoteStatus)[] = [
  'ALL',
  'NEW',
  'REVIEWED',
  'QUOTED',
  'CONVERTED',
  'CLOSED',
];

export function OemTab({
  quotes,
  globalSearch,
  onChanged,
  onError,
}: OemTabProps) {
  const [statusFilter, setStatusFilter] = useState<'ALL' | QuoteStatus>('ALL');
  const [localSearch, setLocalSearch] = useState('');

  const filtered = useMemo(() => {
    const q = (localSearch || globalSearch).trim().toLowerCase();
    return quotes.filter((item) => {
      if (statusFilter !== 'ALL' && item.status !== statusFilter) return false;
      if (
        q &&
        !item.quoteNumber.toLowerCase().includes(q) &&
        !item.name.toLowerCase().includes(q) &&
        !item.email.toLowerCase().includes(q) &&
        !item.productType.toLowerCase().includes(q)
      ) {
        return false;
      }
      return true;
    });
  }, [quotes, statusFilter, localSearch, globalSearch]);

  const handleStatusChange = async (quote: OemQuote, next: QuoteStatus) => {
    try {
      await oemApi.updateStatus(quote.id, next);
      onChanged(`OEM Quote ${quote.quoteNumber} → ${QUOTE_STATUS_META[next].label}`);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Status update failed.');
    }
  };

  const handleDelete = async (quote: OemQuote) => {
    if (!confirm(`Delete OEM Quote ${quote.quoteNumber} from ${quote.name}?`)) return;
    try {
      await oemApi.remove(quote.id);
      onChanged(`Deleted OEM quote ${quote.quoteNumber}`);
    } catch (err) {
      onError(err instanceof ApiError ? err.message : 'Delete failed.');
    }
  };

  const handleExport = () => {
    exportToCsv(
      'decom-oem-quotes.csv',
      filtered.map((q) => ({
        QuoteNumber: q.quoteNumber,
        Client: q.name,
        Business: q.businessName || '',
        Email: q.email,
        Phone: q.phone,
        ProductType: q.productType,
        Material: q.materialMicron,
        Size: q.customSize,
        Quantity: q.quantity,
        LogoPrinting: q.logoPrinting ? 'YES' : 'NO',
        Status: q.status,
      }))
    );
  };

  return (
    <div className="space-y-5">
      {/* Toolbar */}
      <div className="rounded-2xl bg-white border border-slate-200/80 p-4 shadow-card space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="relative flex-1 min-w-[220px] max-w-sm">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              value={localSearch}
              onChange={(e) => setLocalSearch(e.target.value)}
              placeholder="Search quote #, client, product type..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-xs focus:outline-none focus:border-amber-500"
            />
          </div>
          <button
            onClick={handleExport}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold"
          >
            <Download className="w-3.5 h-3.5" /> Export Leads CSV
          </button>
        </div>

        <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
          {QUOTE_STATUSES.map((st) => {
            const count =
              st === 'ALL'
                ? quotes.length
                : quotes.filter((q) => q.status === st).length;
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
                {st === 'ALL' ? 'All' : QUOTE_STATUS_META[st].label} ({count})
              </button>
            );
          })}
        </div>
      </div>

      {/* OEM Lead Cards */}
      {filtered.length === 0 ? (
        <div className="rounded-2xl bg-white border border-slate-200/80 p-12 text-center text-xs text-slate-400 shadow-card">
          No custom OEM quotes match your filter.
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {filtered.map((q) => {
            const cleanPhone = q.phone.replace(/\D/g, '');
            const waText = encodeURIComponent(
              `Hello ${q.name}, thank you for your Decom Industries OEM inquiry (${q.quoteNumber}) for ${q.quantity}× ${q.productType}.`
            );
            return (
              <div
                key={q.id}
                className="rounded-2xl bg-white border border-slate-200/80 p-5 shadow-card space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-extrabold text-slate-950">
                        {q.quoteNumber}
                      </span>
                      {q.logoPrinting && (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-[10px] font-bold">
                          <Sparkles className="w-3 h-3" /> Logo Print
                        </span>
                      )}
                    </div>
                    <h4 className="font-heading font-extrabold text-base text-slate-950 mt-1">
                      {q.name}{' '}
                      {q.businessName && (
                        <span className="text-xs font-semibold text-slate-500">
                          • {q.businessName}
                        </span>
                      )}
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {q.email} • {q.phone}
                    </p>
                  </div>

                  <select
                    value={q.status}
                    onChange={(e) =>
                      handleStatusChange(q, e.target.value as QuoteStatus)
                    }
                    className={`px-2.5 py-1.5 rounded-xl border text-[11px] font-bold ${QUOTE_STATUS_META[q.status].badge}`}
                  >
                    {(Object.keys(QUOTE_STATUS_META) as QuoteStatus[]).map((s) => (
                      <option key={s} value={s}>
                        {QUOTE_STATUS_META[s].label}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Spec Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-[11px]">
                  <div>
                    <div className="text-slate-400">Product</div>
                    <div className="font-bold text-slate-900 mt-0.5">
                      {q.productType}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Material</div>
                    <div className="font-bold text-slate-900 mt-0.5 truncate">
                      {q.materialMicron}
                    </div>
                  </div>
                  <div>
                    <div className="text-slate-400">Size</div>
                    <div className="font-bold text-slate-900 mt-0.5">{q.customSize}</div>
                  </div>
                  <div>
                    <div className="text-slate-400">Quantity</div>
                    <div className="font-mono font-extrabold text-amber-700 mt-0.5">
                      {q.quantity.toLocaleString('en-IN')} pcs
                    </div>
                  </div>
                </div>

                {q.notes && (
                  <p className="text-xs text-slate-600 bg-amber-50/50 border border-amber-100 rounded-xl px-3.5 py-2.5">
                    {q.notes}
                  </p>
                )}

                {/* Quick Contact & Delete Bar */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <span className="text-[10px] text-slate-400">
                    {new Date(q.createdAt).toLocaleString()}
                  </span>
                  <div className="flex items-center gap-2">
                    <a
                      href={`mailto:${q.email}?subject=Decom Industries OEM Quote ${q.quoteNumber}`}
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-800 text-[11px] font-bold"
                    >
                      <Mail className="w-3.5 h-3.5" /> Email
                    </a>
                    <a
                      href={`https://wa.me/${cleanPhone}?text=${waText}`}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 text-emerald-800 text-[11px] font-bold"
                    >
                      <MessageCircle className="w-3.5 h-3.5" /> WhatsApp
                    </a>
                    <button
                      onClick={() => handleDelete(q)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-600 hover:bg-rose-50"
                      title="Delete Lead"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
