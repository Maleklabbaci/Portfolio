
import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { PortfolioGallery } from './components/PortfolioGallery';
import { AdsStats } from './components/AdsStats';
import { ContactAI } from './components/ContactAI';
import { Footer } from './components/Footer';
import { AdminProvider } from './context/AdminContext';

function App() {
  return (
    <AdminProvider>
      <div className="bg-brand-dark min-h-screen text-white selection:bg-brand-accent selection:text-white font-sans">
        <Header />
        <main>
          <Hero />
          <PortfolioGallery />
          <AdsStats />
          <ContactAI />
        </main>
        <Footer />
      </div>
    </AdminProvider>
  );
}

export default App;
