import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { TrustBar } from '@/components/TrustBar';
import { ProductCatalog } from '@/components/ProductCatalog';
import { OemStudio } from '@/components/OemStudio';
import { FacilitySection } from '@/components/FacilitySection';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { AuthModal } from '@/components/AuthModal';
import { AccountModal } from '@/components/AccountModal';
import { FloatingActions } from '@/components/FloatingActions';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 overflow-x-hidden">
        <HeroSection />
        <TrustBar />
        <ProductCatalog />
        <OemStudio />
        <FacilitySection />
      </main>
      <Footer />

      {/* Interactive Drawers, Modals & Floating WhatsApp */}
      <CartDrawer />
      <AuthModal />
      <AccountModal />
      <FloatingActions />
    </>
  );
}
