import React from 'react';
import Link from 'next/link';
import { Package } from 'lucide-react';

export function Footer() {
  return (
    <footer className="mt-auto bg-slate-950 text-slate-300 border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 grid grid-cols-1 md:grid-cols-3 gap-10">
        <div className="space-y-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500 flex items-center justify-center">
              <Package className="w-4 h-4 text-white" />
            </div>
            <span className="font-heading font-extrabold text-white tracking-tight">
              DECOM <span className="text-amber-400">INDUSTRIES</span>
            </span>
          </div>
          <p className="text-xs text-slate-400 leading-relaxed max-w-xs">
            Surat’s manufacturer of crystal PVC saree covers, foldable wardrobe closet
            cubes, bridal jewelry organizers, and custom OEM apparel packaging.
          </p>
          <p className="text-[11px] font-medium text-slate-500">
            Surat, Gujarat, India • Direct Manufacturer
          </p>
        </div>

        <div className="space-y-2.5 text-xs">
          <h4 className="font-heading font-bold text-white uppercase tracking-wider text-[11px]">
            Quick Links
          </h4>
          <ul className="space-y-2 text-slate-400">
            <li>
              <Link href="/" className="hover:text-amber-400 transition-colors">
                Home
              </Link>
            </li>
            <li>
              <Link href="/#products" className="hover:text-amber-400 transition-colors">
                Product Catalog
              </Link>
            </li>
            <li>
              <Link href="/#oem" className="hover:text-amber-400 transition-colors">
                Custom OEM Studio
              </Link>
            </li>
            <li>
              <Link href="/#facility" className="hover:text-amber-400 transition-colors">
                Our Surat Facility
              </Link>
            </li>
          </ul>
        </div>

        <div className="space-y-2.5 text-xs">
          <h4 className="font-heading font-bold text-white uppercase tracking-wider text-[11px]">
            Surat Manufacturing Office
          </h4>
          <p className="text-slate-400 leading-relaxed">
            Surat Ring Road Packaging & Textile Hub, Surat, Gujarat — 395004, India.
          </p>
          <p className="text-slate-400">
            Direct Dispatch: <strong className="text-white">Pan-India Supply</strong>
          </p>
        </div>
      </div>

      <div className="border-t border-slate-800/80 py-4 px-4 text-center text-[11px] text-slate-500">
        © {new Date().getFullYear()} Decom Industries. All Rights Reserved. Surat,
        Gujarat, India.
      </div>
    </footer>
  );
}
