import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, LogOut } from 'lucide-react';
import { useAdmin } from '../context/AdminContext';

export const Header: React.FC = () => {
  const { isAdmin, login, logout } = useAdmin();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // Login Modal State
  const [isLoginOpen, setIsLoginOpen] = useState(false);
  const [password, setPassword] = useState('');
  const [error, setError] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Lock scroll when login modal or mobile menu is open
  useEffect(() => {
    if (isLoginOpen || isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [isLoginOpen, isMobileMenuOpen]);

  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(password)) {
      setIsLoginOpen(false);
      setPassword('');
      setError(false);
    } else {
      setError(true);
    }
  };

  return (
    <>
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 ${
        isScrolled ? 'bg-white/80 backdrop-blur-md py-3 md:py-4 shadow-sm border-b border-gray-100' : 'bg-transparent py-4 md:py-6'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="text-lg md:text-xl font-black tracking-tighter z-50 text-brand-black">
            iVISION<span className="text-brand-accent">.</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-xs font-semibold text-gray-600 hover:text-brand-accent transition-colors uppercase tracking-wider">Work</a>
            <a href="#performance" className="text-xs font-semibold text-gray-600 hover:text-brand-accent transition-colors uppercase tracking-wider">Performance</a>
            <a href="#contact" className="text-xs font-semibold text-gray-600 hover:text-brand-accent transition-colors uppercase tracking-wider">Contact</a>
            
            {/* Admin Toggle */}
            {isAdmin ? (
               <button onClick={logout} className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-[10px] uppercase font-bold border border-red-200 bg-red-50 rounded px-3 py-1.5">
                 <LogOut className="w-3 h-3" /> Sortir
               </button>
            ) : (
               <button onClick={() => setIsLoginOpen(true)} className="text-gray-400 hover:text-brand-accent transition-colors relative">
                 <Lock className="w-3 h-3 md:w-4 md:h-4" />
                 {/* Petit point orange si Offline/Demo */}
                 {!useAdmin().isLive && (
                    <span className="absolute -top-1 -right-1 w-2 h-2 bg-orange-400 rounded-full border border-white"></span>
                 )}
               </button>
            )
          }
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden z-50 text-brand-black w-8 h-8 flex items-center justify-center"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>

        {/* Mobile Menu with Fade Transition */}
        <div className={`fixed inset-0 bg-white/95 backdrop-blur-xl flex flex-col items-center justify-center gap-6 z-40 transition-all duration-300 ease-in-out ${
          isMobileMenuOpen 
            ? 'opacity-100 visible translate-y-0' 
            : 'opacity-0 invisible translate-y-4 pointer-events-none'
        }`}>
           <a href="#work" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-brand-black hover:text-brand-accent transition-colors uppercase tracking-widest">Work</a>
           <a href="#performance" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-brand-black hover:text-brand-accent transition-colors uppercase tracking-widest">Performance</a>
           <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-lg font-bold text-brand-black hover:text-brand-accent transition-colors uppercase tracking-widest">Contact</a>
           <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }} className="text-gray-400 mt-8 text-xs hover:text-brand-black transition-colors uppercase tracking-wider">Admin Access</button>
        </div>
      </header>

      {/* Login Modal */}
      {isLoginOpen && (
        <div 
          className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 transition-opacity duration-300"
          onClick={(e) => { if(e.target === e.currentTarget) setIsLoginOpen(false); }}
        >
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl animate-fade-in" onClick={(e) => e.stopPropagation()}>
            <button 
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-brand-black transition-colors"
            >
              <X />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-blue-50 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-xl font-bold text-brand-black">Espace Admin</h3>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mot de passe"
                className="w-full bg-gray-50 border border-gray-200 text-brand-black px-4 py-3 rounded-lg mb-4 focus:outline-none focus:border-brand-accent focus:ring-2 focus:ring-blue-100 transition-all"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mb-4 text-center font-medium">Mot de passe incorrect</p>}
              <button 
                type="submit"
                className="w-full bg-brand-black text-white hover:bg-brand-accent font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl active:scale-95"
              >
                Connexion
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  );
};