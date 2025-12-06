import React from 'react';
import { ArrowDown } from 'lucide-react';

export const Hero: React.FC = () => {
  return (
    <section className="relative h-[60vh] md:h-[70vh] flex flex-col items-center justify-center overflow-hidden bg-brand-dark">
      {/* Background Subtle Texture */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-gray-800/30 via-brand-dark to-brand-dark z-0"></div>
      
      {/* Content */}
      <div className="relative z-10 container mx-auto px-4 text-center">
        <h1 className="text-6xl md:text-9xl font-bold text-white tracking-tighter mb-2 select-none">
          iVISION<span className="text-brand-accent">.</span>
        </h1>
        
        <div className="flex flex-col items-center gap-4">
          <p className="text-xl md:text-2xl text-gray-400 font-light tracking-widest uppercase">
            Creative House & Performance
          </p>
          <div className="h-1 w-24 bg-brand-accent rounded-full mt-4"></div>
        </div>
      </div>

      {/* Scroll Indicator */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-gray-500 animate-pulse">
        <span className="text-xs uppercase tracking-widest">Scroll</span>
        <ArrowDown className="w-5 h-5" />
      </div>
    </section>
  );
};