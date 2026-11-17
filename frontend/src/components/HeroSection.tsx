'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { ArrowRight, ShieldCheck, Factory, Truck, Sparkles } from 'lucide-react';

const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.08, delayChildren: 0.05 },
  },
};

const item = {
  hidden: { opacity: 0, y: 18 },
  show: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.55, ease: [0.22, 1, 0.36, 1] },
  },
};

export function HeroSection() {
  return (
    <section className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-[#FAF9F6] to-[#F6F3EC]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          {/* Left Editorial Column */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 space-y-6"
          >
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-amber-50 border border-amber-200/80 text-amber-800 text-xs font-semibold"
            >
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              Direct Ex-Factory Store • Crafted in Surat, Gujarat
            </motion.div>

            <motion.h1
              variants={item}
              className="font-heading text-4xl sm:text-5xl lg:text-[3.4rem] font-extrabold tracking-tight text-slate-950 leading-[1.08]"
            >
              Precision Apparel Packaging{' '}
              <span className="text-amber-600">Built to Last.</span>
            </motion.h1>

            <motion.p
              variants={item}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl"
            >
              Crystal-clear virgin PVC saree covers, foldable wardrobe closet cubes, and
              luxury bridal storage engineered with ultrasonic seam welds. Order directly
              from our Surat manufacturing floor or customize OEM batches.
            </motion.p>

            <motion.div variants={item} className="flex flex-wrap items-center gap-3.5 pt-2">
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#products"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-slate-950 hover:bg-slate-800 text-white text-sm font-bold shadow-soft transition-colors"
              >
                Explore Catalog
                <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                href="#oem"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-50 border border-slate-200 text-slate-900 text-sm font-bold transition-colors"
              >
                Request Custom OEM
              </motion.a>
            </motion.div>

            {/* Key Metrics */}
            <motion.div
              variants={item}
              className="grid grid-cols-3 gap-4 pt-6 border-t border-slate-200/80 max-w-lg"
            >
              <div>
                <div className="font-heading text-2xl font-extrabold text-slate-950">
                  150µm
                </div>
                <div className="text-xs text-slate-500 font-medium">Virgin Clear PVC</div>
              </div>
              <div>
                <div className="font-heading text-2xl font-extrabold text-slate-950">
                  1.2M+
                </div>
                <div className="text-xs text-slate-500 font-medium">Monthly Capacity</div>
              </div>
              <div>
                <div className="font-heading text-2xl font-extrabold text-slate-950">
                  24–48h
                </div>
                <div className="text-xs text-slate-500 font-medium">Surat Dispatch</div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual Showcase */}
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-6 relative"
          >
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/80 bg-white shadow-soft aspect-[4/3]">
              <img
                src="/images/hero-factory.jpg"
                alt="Decom Industries Surat Cleanroom Packaging Facility"
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/60 via-transparent to-transparent" />
              <div className="absolute bottom-5 left-5 right-5 flex flex-wrap items-end justify-between gap-3">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg border border-white/60">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-900">
                    <Factory className="w-4 h-4 text-amber-600" />
                    Surat Ring Road Packaging Hub
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automated ultrasonic sealing & die-cutting line
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/85 backdrop-blur text-white text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    GST Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[11px] font-semibold">
                    <Truck className="w-3.5 h-3.5" />
                    Pan-India
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
