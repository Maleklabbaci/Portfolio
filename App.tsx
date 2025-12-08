
import React, { useEffect } from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PortfolioGallery } from './components/PortfolioGallery';
import { AdsStats } from './components/AdsStats';
import { Footer } from './components/Footer';
import { MobileAlert } from './components/MobileAlert';
import { AdminProvider } from './context/AdminContext';

function App() {
  // Fix startup scroll position
  useEffect(() => {
    window.scrollTo(0, 0);
  }, []);

  return (
    <AdminProvider>
      <div className="bg-white min-h-screen text-brand-dark selection:bg-brand-accent selection:text-white font-sans">
        <MobileAlert />
        <Header />
        <main>
          <Hero />
          <PortfolioGallery />
          <AdsStats />
        </main>
        <Footer />
      </div>
    </AdminProvider>
  );
}

export default App;
