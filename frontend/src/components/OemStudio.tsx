'use client';

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sliders, CheckCircle2, Send, Sparkles } from 'lucide-react';
import { oemApi, ApiError } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

export function OemStudio() {
  const { user } = useAuth();

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [businessName, setBusinessName] = useState('');
  const [productType, setProductType] = useState('PVC Saree Cover');
  const [materialMicron, setMaterialMicron] = useState('150 Micron Virgin Crystal PVC');
  const [customSize, setCustomSize] = useState('42 × 35 × 5 cm');
  const [quantity, setQuantity] = useState(500);
  const [logoPrinting, setLogoPrinting] = useState(true);
  const [notes, setNotes] = useState('');

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [submittedQuoteNumber, setSubmittedQuoteNumber] = useState<string | null>(null);

  // Auto-fill contact details if user is logged in
  useEffect(() => {
    if (user) {
      setName((prev) => prev || user.name);
      setEmail((prev) => prev || user.email);
      setPhone((prev) => prev || user.phone);
      setBusinessName((prev) => prev || user.businessName || '');
    }
  }, [user]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      const res = await oemApi.create({
        name,
        email,
        phone,
        businessName: businessName || undefined,
        productType,
        materialMicron,
        customSize,
        quantity: Number(quantity),
        logoPrinting,
        notes: notes || undefined,
      });
      setSubmittedQuoteNumber(res.quote.quoteNumber);
      setNotes('');
    } catch (err) {
      setError(
        err instanceof ApiError ? err.message : 'Failed to submit OEM quote.'
      );
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <section
      id="oem"
      className="bg-white border-y border-slate-200/80 py-16 lg:py-24"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start">
          {/* Left Explanation */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.2 }}
            transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-5 space-y-5 will-change-transform"
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-amber-50 border border-amber-200 text-amber-800 text-xs font-bold">
              <Sliders className="w-3.5 h-3.5 text-amber-600" />
              Custom OEM Manufacturing Studio
            </div>
            <h2 className="font-heading text-3xl sm:text-4xl font-extrabold text-slate-950 leading-tight">
              Tailor-Made Packaging for Your Brand
            </h2>
            <p className="text-sm text-slate-600 leading-relaxed">
              Need custom micron thickness, gold-foil logo screen printing, or bespoke
              boutique dimensions? Submit your specifications below and our Surat
              production desk will prepare your custom quote &amp; sample timeline.
            </p>

            <div className="rounded-3xl bg-[#FAF9F6] border border-slate-200/80 p-5 space-y-3 text-xs">
              <div className="flex items-center gap-2 font-bold text-slate-900">
                <Sparkles className="w-4 h-4 text-amber-600" />
                Direct Factory Advantages
              </div>
              <ul className="space-y-2 text-slate-600">
                <li>• Custom PVC gauges from 100µm up to 220µm heavy-duty</li>
                <li>• 1–4 color brand logo screen & foil printing</li>
                <li>• 5-day prototype sample dispatch across India</li>
                <li>• Dedicated GST billing & pan-India master carton freight</li>
              </ul>
            </div>
          </motion.div>

          {/* Right Live OEM Form */}
          <motion.div
            initial={{ opacity: 0, y: 18 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.15 }}
            transition={{ duration: 0.55, delay: 0.08, ease: [0.22, 1, 0.36, 1] }}
            className="lg:col-span-7 will-change-transform"
          >
            {submittedQuoteNumber ? (
              <div className="rounded-3xl bg-emerald-50 border border-emerald-200 p-8 text-center space-y-4">
                <CheckCircle2 className="w-12 h-12 text-emerald-600 mx-auto" />
                <h3 className="font-heading text-2xl font-extrabold text-slate-950">
                  OEM Specification Saved!
                </h3>
                <p className="text-sm text-slate-600">
                  Your custom manufacturing inquiry has been received by our Surat
                  production desk under reference:
                </p>
                <div className="inline-block px-5 py-2 rounded-2xl bg-white border border-emerald-200 font-mono text-base font-bold text-emerald-800">
                  {submittedQuoteNumber}
                </div>
                <div className="pt-2">
                  <button
                    onClick={() => setSubmittedQuoteNumber(null)}
                    className="px-5 py-2.5 rounded-xl bg-slate-950 text-white text-xs font-bold hover:bg-slate-800 transition-colors"
                  >
                    Submit Another OEM Request
                  </button>
                </div>
              </div>
            ) : (
              <form
                onSubmit={handleSubmit}
                className="rounded-3xl bg-[#FAF9F6] border border-slate-200/90 p-6 sm:p-8 shadow-card space-y-5"
              >
                {error && (
                  <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs font-medium">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Your Name *
                    </label>
                    <input
                      required
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Full Name"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="you@example.com"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Mobile / WhatsApp *
                    </label>
                    <input
                      required
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="+91 98251 12345"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Brand / Firm (Optional)
                    </label>
                    <input
                      value={businessName}
                      onChange={(e) => setBusinessName(e.target.value)}
                      placeholder="e.g. Surat Silk House"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Product Category
                    </label>
                    <select
                      value={productType}
                      onChange={(e) => setProductType(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option>PVC Saree Cover</option>
                      <option>Foldable Wardrobe Closet Cube</option>
                      <option>Bridal Jewelry Vanity Kit</option>
                      <option>Jumbo Blanket Storage Bag</option>
                      <option>Handbag Dust Cover</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Polymer Gauge / Material
                    </label>
                    <select
                      value={materialMicron}
                      onChange={(e) => setMaterialMicron(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    >
                      <option>120 Micron Virgin Crystal PVC</option>
                      <option>150 Micron Virgin Crystal PVC</option>
                      <option>200 Micron Heavy Waterproof PVC</option>
                      <option>100 GSM Non-Woven + Clear PVC</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Target Dimensions
                    </label>
                    <input
                      required
                      value={customSize}
                      onChange={(e) => setCustomSize(e.target.value)}
                      placeholder="42 × 35 × 5 cm"
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1.5">
                      Estimated Quantity (Min 50)
                    </label>
                    <input
                      required
                      type="number"
                      min={50}
                      value={quantity}
                      onChange={(e) => setQuantity(Number(e.target.value))}
                      className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                <label className="flex items-center gap-2.5 text-xs font-semibold text-slate-700 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={logoPrinting}
                    onChange={(e) => setLogoPrinting(e.target.checked)}
                    className="w-4 h-4 rounded accent-amber-600"
                  />
                  Include custom brand logo printing on front panel
                </label>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1.5">
                    Additional Notes (Zipper color, piping trim, delivery timeline)
                  </label>
                  <textarea
                    rows={3}
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Tell our Surat engineering team any special requirements..."
                    className="w-full px-3.5 py-2.5 rounded-xl bg-white border border-slate-200 text-sm focus:outline-none focus:border-amber-500"
                  />
                </div>

                <motion.button
                  whileHover={{ y: -1 }}
                  whileTap={{ scale: 0.98 }}
                  disabled={submitting}
                  type="submit"
                  className="w-full py-3.5 rounded-2xl bg-slate-950 hover:bg-amber-600 disabled:opacity-60 text-white text-sm font-bold flex items-center justify-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                  {submitting ? 'Submitting Inquiry...' : 'Submit Custom OEM Quote'}
                </motion.button>
              </form>
            )}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
