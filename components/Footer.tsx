import React from 'react';
import { Instagram, Linkedin, Twitter, Mail } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="bg-[#050914] pt-20 pb-10 border-t border-gray-900">
      <div className="container mx-auto px-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          <div className="col-span-1 md:col-span-2">
             <a href="#" className="text-3xl font-bold text-white tracking-tighter mb-6 block">
              iVision<span className="text-brand-accent">.</span>
            </a>
            <p className="text-gray-500 max-w-sm">
              Une agence digitale nouvelle génération. Nous combinons l'art visuel et la science des données pour créer des marques inoubliables.
            </p>
          </div>
          
          <div>
            <h4 className="text-white font-bold mb-6">Services</h4>
            <ul className="space-y-4 text-gray-500 text-sm">
              <li className="hover:text-brand-accent cursor-pointer transition-colors">Production Vidéo</li>
              <li className="hover:text-brand-accent cursor-pointer transition-colors">Design Graphique</li>
              <li className="hover:text-brand-accent cursor-pointer transition-colors">Social Ads (Meta/TikTok)</li>
              <li className="hover:text-brand-accent cursor-pointer transition-colors">Branding Strategy</li>
            </ul>
          </div>

          <div>
             <h4 className="text-white font-bold mb-6">Social</h4>
             <div className="flex gap-4">
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-accent hover:text-white transition-all">
                  <Instagram className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-accent hover:text-white transition-all">
                  <Linkedin className="w-5 h-5" />
                </a>
                <a href="#" className="w-10 h-10 rounded-full bg-gray-800 flex items-center justify-center text-gray-400 hover:bg-brand-accent hover:text-white transition-all">
                  <Twitter className="w-5 h-5" />
                </a>
             </div>
             <a href="mailto:hello@ivision.agency" className="flex items-center gap-2 mt-6 text-gray-400 hover:text-white transition-colors">
               <Mail className="w-4 h-4" />
               hello@ivision.agency
             </a>
          </div>
        </div>
        
        <div className="border-t border-gray-900 pt-8 flex flex-col md:flex-row justify-between items-center text-xs text-gray-600">
          <p>&copy; 2024 iVision Agency. All rights reserved.</p>
          <div className="flex gap-6 mt-4 md:mt-0">
            <a href="#" className="hover:text-gray-400">Mentions Légales</a>
            <a href="#" className="hover:text-gray-400">Confidentialité</a>
          </div>
        </div>
      </div>
    </footer>
  );
};