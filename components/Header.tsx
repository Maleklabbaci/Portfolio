
import React, { useState, useEffect } from 'react';
import { Menu, X, Lock, Unlock, LogOut } from 'lucide-react';
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
      setIsScrolled(window.scrollY > 50);
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
      <header className={`fixed top-0 left-0 w-full z-50 transition-all duration-300 mix-blend-difference text-white ${
        isScrolled ? 'py-4' : 'py-6'
      }`}>
        <div className="container mx-auto px-4 flex justify-between items-center">
          {/* Logo */}
          <a href="#" className="text-xl font-bold tracking-tight z-50">
            iVision<span className="text-brand-accent">.</span>
          </a>

          {/* Desktop Nav */}
          <nav className="hidden md:flex items-center gap-8">
            <a href="#work" className="text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">Work</a>
            <a href="#performance" className="text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">Performance</a>
            <a href="#contact" className="text-sm font-bold uppercase tracking-widest hover:text-brand-accent transition-colors">Contact</a>
            
            {/* Admin Toggle */}
            {isAdmin ? (
               <button onClick={logout} className="text-red-500 hover:text-white transition-colors flex items-center gap-1 text-xs uppercase font-bold border border-red-500/50 rounded px-2 py-1">
                 <LogOut className="w-3 h-3" /> Sortir
               </button>
            ) : (
               <button onClick={() => setIsLoginOpen(true)} className="text-gray-500 hover:text-white transition-colors">
                 <Lock className="w-4 h-4" />
               </button>
            )}
          </nav>

          {/* Mobile Toggle */}
          <button 
            className="md:hidden z-50"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? <X /> : <Menu />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-brand-dark flex flex-col items-center justify-center gap-8 z-40">
             <a href="#work" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest">Work</a>
             <a href="#performance" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest">Performance</a>
             <a href="#contact" onClick={() => setIsMobileMenuOpen(false)} className="text-2xl font-bold uppercase tracking-widest">Contact</a>
             <button onClick={() => { setIsMobileMenuOpen(false); setIsLoginOpen(true); }} className="text-gray-500 mt-8">Admin Access</button>
          </div>
        )}
      </header>

      {/* Login Modal */}
      {isLoginOpen && (
        <div className="fixed inset-0 z-[100] bg-black/90 flex items-center justify-center p-4">
          <div className="bg-brand-dark border border-gray-800 rounded-xl p-8 max-w-sm w-full relative">
            <button 
              onClick={() => setIsLoginOpen(false)}
              className="absolute top-4 right-4 text-gray-500 hover:text-white"
            >
              <X />
            </button>
            
            <div className="flex flex-col items-center mb-6">
              <div className="w-12 h-12 bg-gray-800 rounded-full flex items-center justify-center mb-4">
                <Lock className="w-6 h-6 text-brand-accent" />
              </div>
              <h3 className="text-xl font-bold text-white">Espace Admin</h3>
              <p className="text-gray-500 text-sm">Mot de passe requis</p>
            </div>

            <form onSubmit={handleLoginSubmit}>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Entrez le mot de passe"
                className="w-full bg-gray-900 border border-gray-700 text-white px-4 py-3 rounded-lg mb-4 focus:outline-none focus:border-brand-accent"
                autoFocus
              />
              {error && <p className="text-red-500 text-xs mb-4 text-center">Mot de passe incorrect</p>}
              <button 
                type="submit"
                className="w-full bg-brand-accent hover:bg-indigo-600 text-white font-bold py-3 rounded-lg transition-colors"
              >
                Connexion
              </button>
            </form>
             <p className="text-center text-gray-700 text-xs mt-4">Hint: admin</p>
          </div>
        </div>
      )}
    </>
  );
};
