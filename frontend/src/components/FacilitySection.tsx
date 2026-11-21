'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Factory, ShieldCheck, Truck, Award, CheckCircle2, Sparkles, MapPin } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Factory,
    title: 'Surat Manufacturing Unit',
    desc: 'Modern in-house production with automated die-cutting, polymer rolling, and ultrasonic seam welding.',
    badge: 'In-House Line',
  },
  {
    icon: ShieldCheck,
    title: '100% Virgin Clear Polymer',
    desc: 'Zero recycled yellowing film. Every batch passes tensile pull and optical clarity checks before packing.',
    badge: 'ISO Grade',
  },
  {
    icon: Truck,
    title: 'Pan-India Express Freight',
    desc: '24–48 hour dispatch from Surat Ring Road Hub in 7-ply moisture-sealed export-grade cartons.',
    badge: 'Fast Dispatch',
  },
  {
    icon: Award,
    title: 'Direct Factory GST Billing',
    desc: 'Transparent ex-factory wholesale and retail pricing with instant GST tax invoices on every order.',
    badge: '18% ITC Credit',
  },
];

export function FacilitySection() {
  return (
    <section id="facility" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      {/* Header */}
      <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-bold">
          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
          Manufacturing &amp; Engineering
        </div>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950">
          Engineered in Surat, Dispatched Nationwide
        </h2>
        <p className="text-sm text-slate-600 max-w-xl mx-auto">
          Over 1.2 million packaging units manufactured every month with strict quality
          standards for India&apos;s leading boutiques, designers, and home organizers.
        </p>
      </div>

      {/* Grid Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
        {HIGHLIGHTS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -5, scale: 1.01 }}
              className="group relative rounded-3xl bg-white border border-slate-200/90 p-6 shadow-card hover:shadow-xl transition-all duration-300 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                    <Icon className="w-6 h-6 text-amber-600" />
                  </div>
                  <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                    {card.badge}
                  </span>
                </div>
                <h3 className="font-heading font-extrabold text-slate-950 text-base group-hover:text-amber-600 transition-colors">
                  {card.title}
                </h3>
                <p className="text-xs text-slate-600 leading-relaxed mt-2.5">
                  {card.desc}
                </p>
              </div>

              <div className="mt-5 pt-4 border-t border-slate-100 flex items-center gap-1.5 text-[11px] font-semibold text-emerald-700">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Verified Standards</span>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
