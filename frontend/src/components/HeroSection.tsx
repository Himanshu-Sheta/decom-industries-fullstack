'use client';

import React, { useRef } from 'react';
import { motion, useScroll, useTransform } from 'framer-motion';
import {
  ArrowRight,
  ShieldCheck,
  Factory,
  Truck,
  Sparkles,
  CheckCircle2,
  Zap,
  Award,
} from 'lucide-react';

const SILK_EASE = [0.22, 1, 0.36, 1] as const;

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
    transition: { duration: 0.6, ease: SILK_EASE },
  },
};

export function HeroSection() {
  const heroRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ['start start', 'end start'],
  });

  // Pure GPU transform parallax for ultra-smooth 60-120fps
  const imageY = useTransform(scrollYProgress, [0, 1], ['0%', '12%']);
  const imageScale = useTransform(scrollYProgress, [0, 1], [1.02, 1.08]);

  return (
    <section
      ref={heroRef}
      className="relative overflow-hidden border-b border-slate-200/70 bg-gradient-to-b from-white via-[#FAF9F6] to-[#F5F2EA] min-h-[82vh] flex items-center"
    >
      {/* Lightweight Ambient Radial Gradient (Zero GPU Overhead on Mobile) */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-100/50 via-transparent to-transparent pointer-events-none -z-10" />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12 sm:py-16 lg:py-20 w-full">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-12 items-center">
          {/* Left Editorial Column */}
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="lg:col-span-6 space-y-6 text-left"
          >
            {/* Shimmering Trust Badge */}
            <motion.div
              variants={item}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200/90 text-amber-900 text-xs font-semibold shadow-xs"
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
              </span>
              <Sparkles className="w-3.5 h-3.5 text-amber-600" />
              <span>Direct Ex-Factory Store • Crafted in Surat, Gujarat</span>
            </motion.div>

            {/* Main Punchy Heading */}
            <motion.h1
              variants={item}
              className="font-heading text-4xl sm:text-5xl lg:text-[3.5rem] font-extrabold tracking-tight text-slate-950 leading-[1.08]"
            >
              Precision Apparel Packaging{' '}
              <span className="bg-gradient-to-r from-amber-600 via-amber-700 to-orange-600 bg-clip-text text-transparent">
                Built to Last.
              </span>
            </motion.h1>

            {/* Value Proposition */}
            <motion.p
              variants={item}
              className="text-base sm:text-lg text-slate-600 leading-relaxed max-w-xl"
            >
              Crystal-clear virgin PVC saree covers, foldable wardrobe closet cubes, and
              heavy-duty bridal packaging engineered with ultrasonic seam welds. Order
              directly from our Surat factory floor or customize OEM bulk batches.
            </motion.p>

            {/* Action Buttons */}
            <motion.div
              variants={item}
              className="flex flex-wrap items-center gap-3.5 pt-2"
            >
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                href="#products"
                className="inline-flex items-center gap-2.5 px-6 sm:px-7 py-3.5 rounded-2xl bg-gradient-to-r from-slate-950 to-slate-900 hover:from-amber-600 hover:to-amber-700 text-white text-sm font-bold shadow-lg shadow-slate-950/20 transition-all"
              >
                <span>Explore Catalog</span>
                <ArrowRight className="w-4 h-4" />
              </motion.a>
              <motion.a
                whileHover={{ scale: 1.03, y: -2 }}
                whileTap={{ scale: 0.97 }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                href="#oem"
                className="inline-flex items-center gap-2 px-6 py-3.5 rounded-2xl bg-white hover:bg-amber-50/80 border border-slate-300/80 text-slate-900 text-sm font-bold shadow-xs transition-all"
              >
                <span>Request Custom OEM</span>
              </motion.a>
            </motion.div>

            {/* Key Metrics / Highlights Grid */}
            <motion.div
              variants={item}
              className="grid grid-cols-3 gap-3 sm:gap-4 pt-6 border-t border-slate-200/90 max-w-lg"
            >
              <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 backdrop-blur-xs transition-transform hover:-translate-y-1">
                <div className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums">
                  150µm
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Virgin Clear PVC
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 backdrop-blur-xs transition-transform hover:-translate-y-1">
                <div className="font-heading text-2xl sm:text-3xl font-extrabold text-slate-950 tabular-nums">
                  1.2M+
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Monthly Capacity
                </div>
              </div>
              <div className="p-3 rounded-2xl bg-white/70 border border-slate-200/60 backdrop-blur-xs transition-transform hover:-translate-y-1">
                <div className="font-heading text-2xl sm:text-3xl font-extrabold text-amber-600 tabular-nums">
                  24–48h
                </div>
                <div className="text-[11px] sm:text-xs text-slate-500 font-medium mt-0.5">
                  Surat Dispatch
                </div>
              </div>
            </motion.div>
          </motion.div>

          {/* Right Visual Showcase with Floating Badges & Smooth Parallax */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.7, ease: SILK_EASE }}
            className="lg:col-span-6 relative w-full"
          >
            {/* Main Showcase Container */}
            <div className="relative rounded-3xl overflow-hidden border border-slate-200/90 bg-white shadow-2xl aspect-[4/3] sm:aspect-[16/11]">
              <motion.img
                style={{ y: imageY, scale: imageScale }}
                src="/images/hero-factory.jpg"
                alt="Decom Industries Surat Manufacturing Facility"
                className="w-full h-full object-cover will-change-transform"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-slate-950/75 via-slate-950/20 to-transparent pointer-events-none" />

              {/* Bottom Glass Overlay */}
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.55, ease: SILK_EASE }}
                className="absolute bottom-4 sm:bottom-5 left-4 sm:left-5 right-4 sm:right-5 flex flex-wrap items-end justify-between gap-3"
              >
                <div className="bg-white/95 backdrop-blur-md rounded-2xl px-4 py-3 shadow-lg border border-white/70">
                  <div className="flex items-center gap-2 text-xs sm:text-sm font-bold text-slate-950">
                    <Factory className="w-4 h-4 text-amber-600" />
                    Surat Ring Road Packaging Floor
                  </div>
                  <p className="text-[11px] text-slate-500 mt-0.5">
                    Automated ultrasonic sealing &amp; high-precision cutting line
                  </p>
                </div>

                <div className="flex gap-2">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-950/90 backdrop-blur text-white text-[11px] font-semibold">
                    <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                    GST Verified
                  </span>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-amber-500 text-white text-[11px] font-semibold">
                    <Truck className="w-3.5 h-3.5" />
                    Pan-India
                  </span>
                </div>
              </motion.div>
            </div>

            {/* Floating Live Accent Badge 1: 100% Virgin Polymer */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.45, duration: 0.6 }}
              className="absolute -top-4 -right-2 sm:-right-4 hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-white/95 backdrop-blur-md border border-amber-200/80 shadow-lg text-xs font-bold text-slate-900 animate-float"
            >
              <div className="w-7 h-7 rounded-lg bg-emerald-500/15 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
              <div>
                <div>100% Virgin PVC</div>
                <div className="text-[10px] text-slate-400 font-normal">Zero Yellowing Film</div>
              </div>
            </motion.div>

            {/* Floating Live Accent Badge 2: Ultrasonic Seams */}
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.55, duration: 0.6 }}
              className="absolute -bottom-4 -left-2 sm:-left-4 hidden sm:flex items-center gap-2.5 px-3.5 py-2.5 rounded-2xl bg-slate-950 text-white shadow-xl text-xs font-bold border border-slate-800 animate-float-delayed"
            >
              <div className="w-7 h-7 rounded-lg bg-amber-500/20 text-amber-400 flex items-center justify-center">
                <Zap className="w-4 h-4" />
              </div>
              <div>
                <div>Ultrasonic Seam Welds</div>
                <div className="text-[10px] text-slate-400 font-normal">Tear-Resistant Edges</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
