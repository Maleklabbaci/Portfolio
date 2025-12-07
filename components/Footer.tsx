import React from 'react';
import { Instagram, Facebook, Mail, ArrowUp } from 'lucide-react';

export const Footer: React.FC = () => {
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer id="contact" className="bg-brand-dark pt-24 pb-12 relative">
      <div className="container mx-auto px-4">
        
        {/* Lazy Back to Top - Centered */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <button 
            onClick={scrollToTop}
            className="bg-brand-accent text-white w-16 h-16 rounded-full flex items-center justify-center shadow-2xl hover:bg-white hover:text-brand-accent transition-all duration-300 active:scale-90 group ring-8 ring-white/5"
          >
            <ArrowUp className="w-8 h-8 group-hover:-translate-y-1 transition-transform" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-20 text-center md:text-left">
          <div className="col-span-1 md:col-span-2 flex flex-col items-center md:items-start">
             <a href="#" className="text-3xl font-black text-white tracking-tighter mb-8 block">
              iVision<span className="text-brand-accent">.</span>
            </a>
            <p className="text-gray-400 max-w-sm leading-relaxed text-lg">
              Une agence digitale nouvelle génération. Nous combinons l'art visuel et la science des données pour créer des marques inoubliables.
            </p>
          </div>
          
          <div className="flex flex-col items-center md:items-start">
            <h4 className="text-white font-bold mb-8 text-lg">Services</h4>
            <ul className="space-y-4 text-gray-400">
              <li className="hover:text-white cursor-pointer transition-colors">Production Vidéo</li>
              <li className="hover:text-white cursor-pointer transition-colors">Design Graphique</li>
              <li className="hover:text-white cursor-pointer transition-colors">Social Ads (Meta/TikTok)</li>
              <li className="hover:text-white cursor-pointer transition-colors">Branding Strategy</li>
            </ul>
          </div>

          <div className="flex flex-col items-center md:items-start">
             <h4 className="text-white font-bold mb-8 text-lg">Social</h4>
             <div className="flex gap-4">
                <a 
                  href="https://www.instagram.com/ivision_agency/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-accent hover:text-white transition-all active:scale-95"
                >
                  <Instagram className="w-5 h-5" />
                </a>
                <a 
                  href="https://www.facebook.com/agencyivision/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-12 h-12 rounded-full bg-white/5 flex items-center justify-center text-gray-400 hover:bg-brand-accent hover:text-white transition-all active:scale-95"
                >
                  <Facebook className="w-5 h-5" />
                </a>
             </div>
             <a href="mailto:ivsioncontact@gmail.com" className="flex items-center gap-2 mt-8 text-gray-400 hover:text-white transition-colors group">
               <Mail className="w-4 h-4 group-hover:scale-110 transition-transform" />
               ivsioncontact@gmail.com
             </a>
          </div>
        </div>
        
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-gray-500 gap-4">
          <p>&copy; 2025 iVision Agency. All rights reserved.</p>
          <div className="flex gap-8">
            <a href="#" className="hover:text-white transition-colors">Mentions Légales</a>
            <a href="#" className="hover:text-white transition-colors">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};