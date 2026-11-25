import type { OrderStatus, QuoteStatus } from '@/lib/types';

export const DECOM_IMAGES = [
  { label: 'PVC Saree Cover', url: '/images/product-saree-organizer.jpg' },
  { label: 'Wardrobe Closet Cube', url: '/images/product-closet-storage.jpg' },
  { label: 'Bridal Jewelry Kit', url: '/images/product-jewelry-kit.jpg' },
  { label: 'Handbag Organizer', url: '/images/decom-handbag-purse-organizer-angle-1.jpg' },
  { label: 'Jumbo Blanket Bag', url: '/images/decom-blanket-bedsheet-storage-angle-1.jpg' },
  { label: 'Vanity Pouch', url: '/images/decom-transparent-vanity-pouch-angle-1.jpg' },
  { label: 'Bridal Combo Set', url: '/images/decom-combo-storage-set-angle-1.jpg' },
  { label: 'Surat Facility', url: '/images/hero-factory.jpg' },
];

export const ORDER_STATUS_META: Record<
  OrderStatus,
  { label: string; badge: string; bar: string; next?: OrderStatus; nextLabel?: string }
> = {
  PENDING: {
    label: 'Pending',
    badge: 'bg-amber-50 text-amber-800 border-amber-200',
    bar: 'bg-amber-500',
    next: 'CONFIRMED',
    nextLabel: 'Confirm Order',
  },
  CONFIRMED: {
    label: 'Confirmed & Packed',
    badge: 'bg-sky-50 text-sky-800 border-sky-200',
    bar: 'bg-sky-500',
    next: 'READY_FOR_PICKUP',
    nextLabel: 'Schedule Pickup',
  },
  IN_PRODUCTION: {
    label: 'In Production',
    badge: 'bg-indigo-50 text-indigo-800 border-indigo-200',
    bar: 'bg-indigo-500',
    next: 'READY_FOR_PICKUP',
    nextLabel: 'Ready for Pickup',
  },
  READY_FOR_PICKUP: {
    label: 'Ready for Pickup',
    badge: 'bg-purple-50 text-purple-800 border-purple-200',
    bar: 'bg-purple-500',
    next: 'PICKED_UP',
    nextLabel: 'Mark Picked Up',
  },
  PICKED_UP: {
    label: 'Picked Up by Courier',
    badge: 'bg-blue-50 text-blue-800 border-blue-200',
    bar: 'bg-blue-500',
    next: 'DISPATCHED',
    nextLabel: 'Mark In Transit',
  },
  DISPATCHED: {
    label: 'In Transit',
    badge: 'bg-teal-50 text-teal-800 border-teal-200',
    bar: 'bg-teal-500',
    next: 'DELIVERED',
    nextLabel: 'Mark Delivered',
  },
  DELIVERED: {
    label: 'Delivered',
    badge: 'bg-emerald-50 text-emerald-800 border-emerald-200',
    bar: 'bg-emerald-500',
  },
  CANCELLED: {
    label: 'Cancelled',
    badge: 'bg-rose-50 text-rose-700 border-rose-200',
    bar: 'bg-rose-400',
  },
};

export const QUOTE_STATUS_META: Record<
  QuoteStatus,
  { label: string; badge: string }
> = {
  NEW: { label: 'New Lead', badge: 'bg-amber-50 text-amber-800 border-amber-200' },
  REVIEWED: { label: 'Reviewed', badge: 'bg-sky-50 text-sky-800 border-sky-200' },
  QUOTED: { label: 'Quoted', badge: 'bg-indigo-50 text-indigo-800 border-indigo-200' },
  CONVERTED: { label: 'Converted', badge: 'bg-emerald-50 text-emerald-800 border-emerald-200' },
  CLOSED: { label: 'Closed', badge: 'bg-slate-100 text-slate-600 border-slate-200' },
};

export function formatINR(amount: number): string {
  return `₹${amount.toLocaleString('en-IN')}`;
}

export function exportToCsv(filename: string, rows: Record<string, unknown>[]): void {
  if (rows.length === 0) return;
  const headers = Object.keys(rows[0]);
  const csvLines = [
    headers.join(','),
    ...rows.map((row) =>
      headers
        .map((h) => {
          const val = String(row[h] ?? '').replace(/"/g, '""');
          return `"${val}"`;
        })
        .join(',')
    ),
  ];
  const blob = new Blob([csvLines.join('\n')], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  link.click();
  URL.revokeObjectURL(url);
}
