import React from 'react';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative min-h-screen flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Background subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center flex flex-col items-center">
        <h1 className="text-4xl sm:text-5xl md:text-[8rem] font-black text-brand-black tracking-tighter leading-none mb-4 md:mb-8 select-none">
          iVISION<span className="text-brand-accent">.</span>
        </h1>
        
        <div className="flex flex-col items-center gap-5 md:gap-8">
          <p className="text-sm sm:text-base md:text-xl text-gray-500 font-medium tracking-wide max-w-xs md:max-w-2xl mx-auto leading-relaxed px-2">
            L'agence digitale qui fusionne <span className="text-brand-accent font-bold">Créativité</span> et <span className="text-brand-black font-bold">Performance</span>.
          </p>
          
          <div className="flex gap-3 md:gap-4 mt-2 md:mt-4">
            <a 
              href="#work" 
              className="bg-brand-black text-white px-5 py-3 md:px-8 md:py-4 text-xs md:text-sm rounded-full font-bold hover:bg-brand-accent transition-all shadow-xl hover:shadow-2xl active:scale-95 duration-200"
            >
              Voir les travaux
            </a>
            <a 
              href="#contact" 
              className="bg-white text-brand-black border border-gray-200 px-5 py-3 md:px-8 md:py-4 text-xs md:text-sm rounded-full font-bold hover:border-brand-black transition-all hover:bg-gray-50 active:scale-95 duration-200"
            >
              Nous contacter
            </a>
          </div>
        </div>

        {/* Scroll Indicator - Positioned in flow (middle) instead of absolute bottom */}
        <button 
          onClick={scrollToWork}
          className="mt-12 md:mt-24 flex flex-col items-center gap-2 text-gray-400 animate-bounce cursor-pointer hover:text-brand-accent transition-colors p-4"
        >
          <span className="text-[8px] md:text-[10px] font-bold uppercase tracking-[0.2em]">Scroll</span>
          <ArrowDown className="w-3 h-3 md:w-5 md:h-5" />
        </button>
      </div>
    </section>
  );
};