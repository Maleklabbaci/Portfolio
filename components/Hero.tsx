import React from 'react';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  const scrollToWork = () => {
    document.getElementById('work')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative h-[85vh] flex flex-col items-center justify-center overflow-hidden bg-white">
      {/* Background subtle grid */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#f1f5f9_1px,transparent_1px),linear-gradient(to_bottom,#f1f5f9_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center mt-20">
        <h1 className="text-7xl md:text-[10rem] font-black text-brand-black tracking-tighter leading-none mb-6 select-none animate-fade-in">
          iVISION<span className="text-brand-accent">.</span>
        </h1>
        
        <div className="flex flex-col items-center gap-6 animate-fade-in" style={{animationDelay: '0.2s'}}>
          <p className="text-xl md:text-2xl text-gray-500 font-medium tracking-wide max-w-2xl mx-auto">
            L'agence digitale qui fusionne <span className="text-brand-accent font-bold">Créativité</span> et <span className="text-brand-black font-bold">Performance</span>.
          </p>
          
          <div className="flex gap-4 mt-8">
            <a 
              href="#work" 
              className="bg-brand-black text-white px-8 py-4 rounded-full font-bold hover:bg-brand-accent transition-all shadow-xl hover:shadow-2xl active:scale-95 duration-200"
            >
              Voir les travaux
            </a>
            <a 
              href="#contact" 
              className="bg-white text-brand-black border border-gray-200 px-8 py-4 rounded-full font-bold hover:border-brand-black transition-all hover:bg-gray-50 active:scale-95 duration-200"
            >
              Nous contacter
            </a>
          </div>
        </div>
      </div>

      {/* Scroll Indicator - Clickable */}
      <button 
        onClick={scrollToWork}
        className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-400 animate-bounce cursor-pointer hover:text-brand-accent transition-colors p-4"
      >
        <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Scroll</span>
        <ArrowDown className="w-5 h-5" />
      </button>
    </section>
  );
};