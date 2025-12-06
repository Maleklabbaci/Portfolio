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
        isScrolled ? 'bg-white/80 backdrop-blur-md py-4 shadow-sm border-b border-gray-100' : 'bg-transparent py-6'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="text-2xl font-black tracking-tighter z-50 text-brand-black">
            iVISION<span className="text-brand-accent">.</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-sm font-semibold text-gray-600 hover:text-brand-accent transition-colors">Work</a>
            <a href="#performance" className="text-sm font-semibold text-gray-600 hover:text-brand-accent transition-colors">Performance</a>
            <a href="#contact" className="text-sm font-semibold text-gray-600 hover:text-brand-accent transition-colors">Contact</a>
            
            {/* Admin Toggle */}
            {isAdmin ? (
               <button onClick={logout} className="text-red-500 hover:text-red-600 transition-colors flex items-center gap-1 text-xs uppercase font-bold border border-red-200 bg-red-50 rounded px-3 py-1.5">
                 <LogOut className="w-3 h-3" /> Sortir
               </button>
            ) : (
               <button onClick={() => setIsLoginOpen(true)} className="text-gray-400 hover:text-brand-accent transition-colors">
                 <Lock className="w-4 h-4" />
               </button>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden z-50 text-brand-black"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-white flex flex-col items-center justify-center gap-8 z-40 animate-fade-in">
             <a href="#work" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-bold text-brand-black">Work</a>
             <a href="#performance" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-bold text-brand-black">Performance</a>
             <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-3xl font-bold text-brand-black">Contact</a>
             <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }} className="text-gray-400 mt-8 text-sm">Admin Access</button>
          </div>
        )}
      </header>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-8 max-w-sm w-full relative shadow-2xl animate-fade-in">
            <button 
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-400 hover:text-brand-black"
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
                className="w-full bg-brand-black text-white hover:bg-brand-accent font-bold py-3 rounded-lg transition-colors shadow-lg hover:shadow-xl"
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