'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ShieldCheck, Zap, Layers, Box, Sparkles } from 'lucide-react';

const TRUST_PILLARS = [
  {
    icon: Layers,
    tag: '150µm Gauge',
    title: 'Virgin Optical PVC',
    desc: 'Crystal-clear polymer with zero toxic odor and zero recycled yellowing film.',
    accent: 'from-amber-500/10 to-orange-500/5',
    iconColor: 'text-amber-600',
    iconBg: 'bg-amber-50 border-amber-200/80',
  },
  {
    icon: Zap,
    tag: 'High-Frequency',
    title: 'Ultrasonic Seam Welds',
    desc: 'Soundwave-fused perimeter joints that resist heavy bridal weight without tearing.',
    accent: 'from-blue-500/10 to-indigo-500/5',
    iconColor: 'text-blue-600',
    iconBg: 'bg-blue-50 border-blue-200/80',
  },
  {
    icon: ShieldCheck,
    tag: '10,000+ Cycles',
    title: 'Anti-Rust Metal Zippers',
    desc: 'Corrosion-resistant electroplated sliders with dual-reinforced nylon teeth.',
    accent: 'from-emerald-500/10 to-teal-500/5',
    iconColor: 'text-emerald-600',
    iconBg: 'bg-emerald-50 border-emerald-200/80',
  },
  {
    icon: Box,
    tag: 'Surat Dispatch',
    title: '7-Ply Moisture Packing',
    desc: 'Heavy-duty export grade master cartons sealed against monsoon humidity.',
    accent: 'from-purple-500/10 to-pink-500/5',
    iconColor: 'text-purple-600',
    iconBg: 'bg-purple-50 border-purple-200/80',
  },
];

export function TrustBar() {
  return (
    <section className="relative z-10 -mt-6 sm:-mt-8 max-w-7xl mx-auto px-4 sm:px-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {TRUST_PILLARS.map((pillar, i) => {
          const Icon = pillar.icon;
          return (
            <motion.div
              key={pillar.title}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{
                duration: 0.45,
                delay: i * 0.08,
                ease: [0.22, 1, 0.36, 1],
              }}
              whileHover={{ y: -4, scale: 1.01 }}
              className="group relative rounded-3xl bg-white/95 backdrop-blur-md border border-slate-200/90 p-5 shadow-soft hover:shadow-xl transition-all duration-300"
            >
              {/* Subtle Gradient Backlight */}
              <div
                className={`absolute inset-0 rounded-3xl bg-gradient-to-br ${pillar.accent} opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none`}
              />

              <div className="relative z-10 flex items-start gap-4">
                <div
                  className={`w-11 h-11 rounded-2xl border flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-110 transition-transform duration-300 ${pillar.iconBg}`}
                >
                  <Icon className={`w-5 h-5 ${pillar.iconColor}`} />
                </div>
                <div className="space-y-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200/60">
                      {pillar.tag}
                    </span>
                  </div>
                  <h3 className="font-heading font-extrabold text-sm text-slate-950 group-hover:text-amber-700 transition-colors">
                    {pillar.title}
                  </h3>
                  <p className="text-xs text-slate-500 leading-relaxed">
                    {pillar.desc}
                  </p>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </section>
  );
}
