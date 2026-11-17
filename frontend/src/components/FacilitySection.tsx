'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Factory, ShieldCheck, Truck, Award } from 'lucide-react';

const HIGHLIGHTS = [
  {
    icon: Factory,
    title: '45,000 sq.ft Surat Cleanroom',
    desc: 'Automated die-cutting, polymer rolling, and ultrasonic seam welding under strict dust-free inspection.',
  },
  {
    icon: ShieldCheck,
    title: '100% Virgin Clear Polymer',
    desc: 'Zero recycled yellowing film. Every batch passes tensile pull and clarity checks before master packing.',
  },
  {
    icon: Truck,
    title: 'Pan-India Express Freight',
    desc: '24–48 hour dispatch from Surat Ring Road Hub in 7-ply moisture-sealed master cartons.',
  },
  {
    icon: Award,
    title: 'Full-Stack Security Built In',
    desc: 'Every order total & 18% GST is verified on the Express backend with bcrypt & HttpOnly JWT sessions.',
  },
];

export function FacilitySection() {
  return (
    <section id="facility" className="max-w-7xl mx-auto px-4 sm:px-6 py-16 lg:py-24">
      <div className="text-center max-w-2xl mx-auto mb-12">
        <span className="text-xs font-bold uppercase tracking-wider text-amber-600">
          Manufacturing & Reliability
        </span>
        <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950 mt-1">
          Engineered in Surat, Dispatched Nationwide
        </h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {HIGHLIGHTS.map((card, i) => {
          const Icon = card.icon;
          return (
            <motion.div
              key={card.title}
              initial={{ opacity: 0, y: 18 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.5,
                delay: i * 0.07,
                ease: [0.22, 1, 0.36, 1],
              }}
              className="rounded-3xl bg-white border border-slate-200/80 p-6 shadow-card hover:shadow-soft hover:-translate-y-1 transition-[transform,box-shadow] duration-300 ease-out will-change-transform"
            >
              <div className="w-11 h-11 rounded-2xl bg-amber-50 border border-amber-200/70 flex items-center justify-center mb-4">
                <Icon className="w-5 h-5 text-amber-600" />
              </div>
              <h3 className="font-heading font-bold text-slate-950 text-base">
                {card.title}
              </h3>
              <p className="text-xs text-slate-600 leading-relaxed mt-2">{card.desc}</p>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
