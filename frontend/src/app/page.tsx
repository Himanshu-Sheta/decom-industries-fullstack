import React from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { ProductCatalog } from '@/components/ProductCatalog';
import { OemStudio } from '@/components/OemStudio';
import { FacilitySection } from '@/components/FacilitySection';
import { Footer } from '@/components/Footer';
import { CartDrawer } from '@/components/CartDrawer';
import { AuthModal } from '@/components/AuthModal';
import { AccountModal } from '@/components/AccountModal';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <main className="flex-1">
        <HeroSection />
        <ProductCatalog />
        <OemStudio />
        <FacilitySection />
      </main>
      <Footer />

      {/* Interactive Drawers & Auth Modals */}
      <CartDrawer />
      <AuthModal />
      <AccountModal />
    </>
  );
}
