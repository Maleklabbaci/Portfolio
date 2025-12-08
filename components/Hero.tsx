
import React from 'react';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-screen flex flex-col items-center justify-center bg-white overflow-hidden">
      {/* Background simplifiée */}
      <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-30"></div>
      
      <div className="relative z-10 flex flex-col items-center text-center px-4">
        <h1 className="text-5xl md:text-8xl lg:text-9xl font-black text-brand-black tracking-tighter mb-4 md:mb-6 select-none leading-none">
          iVISION<span className="text-brand-accent">.</span>
        </h1>
        
        <p className="text-sm md:text-xl text-gray-500 font-medium tracking-wide max-w-lg mb-8 md:mb-12">
          L'agence digitale qui fusionne <span className="text-brand-accent font-bold">Créativité</span> et <span className="text-brand-black font-bold">Performance</span>.
        </p>
        
        <div className="flex gap-3">
          <a href="#work" className="bg-black text-white px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-bold rounded-full hover:bg-brand-accent transition-colors shadow-lg active:scale-95">
            Voir les travaux
          </a>
          <a href="#contact" className="bg-white text-black border border-gray-200 px-6 py-3 md:px-8 md:py-4 text-xs md:text-sm font-bold rounded-full hover:bg-gray-50 transition-colors active:scale-95">
            Nous contacter
          </a>
        </div>

        <button onClick={scrollToWork} className="mt-16 md:mt-24 animate-bounce text-gray-400 hover:text-brand-accent transition-colors p-4">
          <ArrowDown className="w-5 h-5" />
        </button>
      </div>
    </section>
  );
};
