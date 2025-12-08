
import React, { useState, useEffect } from 'react';
import { X, Monitor, Smartphone } from 'lucide-react';

export const MobileAlert: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Vérifier si c'est un mobile
    const isMobile = window.innerWidth < 768;
    // Vérifier si l'utilisateur a déjà vu le message durant cette session
    const hasSeen = sessionStorage.getItem('ivision_mobile_alert_seen');

    if (isMobile && !hasSeen) {
      // Petit délai pour l'animation
      const timer = setTimeout(() => setIsVisible(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    sessionStorage.setItem('ivision_mobile_alert_seen', 'true');
  };

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl p-6 w-full max-w-sm text-center relative shadow-2xl border border-gray-100 transform transition-all scale-100">
        
        {/* Close Button (Left side for RTL context) */}
        <button 
          onClick={handleClose}
          className="absolute top-4 left-4 p-2 bg-gray-50 rounded-full text-gray-400 hover:text-black transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Icon */}
        <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-6">
          <Monitor className="w-8 h-8 text-brand-accent" />
        </div>

        {/* Arabic Text */}
        <h3 className="text-2xl font-black text-brand-black mb-3 font-sans" dir="rtl">
          تنبيه
        </h3>
        
        <p className="text-gray-500 text-lg leading-relaxed font-medium mb-8" dir="rtl">
          للحصول على أفضل رؤية وتجربة تصفح، يرجى استخدام جهاز <span className="text-brand-accent font-bold">الكمبيوتر</span>.
        </p>

        {/* Action Button */}
        <button 
          onClick={handleClose}
          className="w-full bg-brand-black text-white font-bold py-4 rounded-xl shadow-lg active:scale-95 transition-transform"
        >
          موافق (Continue)
        </button>

      </div>
    </div>
  );
};
