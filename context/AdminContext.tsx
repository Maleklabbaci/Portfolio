import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectCategory } from '../types';

// Données initiales (anciennement dans PortfolioGallery)
const INITIAL_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Summer Vibes Reel',
    category: ProjectCategory.REELS,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-girl-in-neon-sign-1232-large.mp4',
    client: 'NeonEnergy',
    size: 'tall',
    metrics: [{ label: 'Vues', value: '2.4M' }]
  },
  {
    id: '2',
    title: 'Cinematic Brand Movie',
    category: ProjectCategory.VIDEO,
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-stars-in-space-1610-large.mp4',
    client: 'LuxeAuto',
    size: 'wide'
  },
  {
    id: '3',
    title: 'Performance Campaign',
    category: ProjectCategory.ADS,
    imageUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?q=80&w=1000&auto=format&fit=crop',
    client: 'TechStart',
    metrics: [{ label: 'ROAS', value: '8.5x' }, { label: 'Revenue', value: '45k€' }],
    size: 'normal'
  },
  {
    id: '4',
    title: 'Editorial Shoot',
    category: ProjectCategory.PHOTO,
    imageUrl: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?q=80&w=1000&auto=format&fit=crop',
    client: 'Vogue Like',
    size: 'tall'
  },
  {
    id: '5',
    title: 'TikTok Viral',
    category: ProjectCategory.REELS,
    imageUrl: 'https://images.unsplash.com/photo-1611162617474-5b21e879e113?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://assets.mixkit.co/videos/preview/mixkit-vertical-shot-of-a-woman-running-on-a-bridge-40245-large.mp4',
    client: 'FastFashion',
    size: 'tall',
    metrics: [{ label: 'Likes', value: '150k' }]
  },
  {
    id: '6',
    title: 'UI/UX Mobile App',
    category: ProjectCategory.DESIGN,
    imageUrl: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?q=80&w=1000&auto=format&fit=crop',
    client: 'BankApp',
    size: 'normal'
  },
  {
    id: '7',
    title: 'Corporate Film',
    category: ProjectCategory.VIDEO,
    imageUrl: 'https://images.unsplash.com/photo-1536240478700-b869070f9279?q=80&w=1000&auto=format&fit=crop',
    client: 'ConstructCorp',
    size: 'wide'
  },
   {
    id: '8',
    title: 'Facebook Ads Scale',
    category: ProjectCategory.ADS,
    imageUrl: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?q=80&w=1000&auto=format&fit=crop',
    client: 'E-com Brand',
    size: 'normal',
    metrics: [{ label: 'CPA', value: '-40%' }, { label: 'Scale', value: '10k/day' }]
  },
];

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  projects: Project[];
  addProject: (project: Project) => void;
  updateProject: (project: Project) => void;
  deleteProject: (id: string) => void;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Helper for safe storage access to prevent crashes
const safeStorage = {
  getItem: (key: string) => {
    try {
      return localStorage.getItem(key);
    } catch (e) {
      console.warn('LocalStorage access denied/failed', e);
      return null;
    }
  },
  setItem: (key: string, value: string) => {
    try {
      localStorage.setItem(key, value);
    } catch (e) {
      console.warn('LocalStorage write failed', e);
    }
  }
};

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Persistance de l'état Admin avec gestion d'erreurs
  const [isAdmin, setIsAdmin] = useState(() => {
    const saved = safeStorage.getItem('ivision_is_admin');
    return saved === 'true';
  });

  // Persistance des Projets avec gestion d'erreurs
  const [projects, setProjects] = useState<Project[]>(() => {
    const saved = safeStorage.getItem('ivision_projects');
    try {
      const parsed = saved ? JSON.parse(saved) : null;
      // Ensure we have an array
      return Array.isArray(parsed) && parsed.length > 0 ? parsed : INITIAL_PROJECTS;
    } catch (e) {
      return INITIAL_PROJECTS;
    }
  });

  // Sauvegarde automatique lors des changements
  useEffect(() => {
    safeStorage.setItem('ivision_is_admin', String(isAdmin));
  }, [isAdmin]);

  useEffect(() => {
    safeStorage.setItem('ivision_projects', JSON.stringify(projects));
  }, [projects]);

  const login = (password: string) => {
    if (password === 'admin') {
      setIsAdmin(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
  };

  const addProject = (project: Project) => {
    setProjects((prev) => [project, ...prev]);
  };

  const updateProject = (updatedProject: Project) => {
    setProjects((prev) => prev.map(p => p.id === updatedProject.id ? updatedProject : p));
  };

  const deleteProject = (id: string) => {
    setProjects((prev) => prev.filter(p => p.id !== id));
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, projects, addProject, updateProject, deleteProject }}>
      {children}
    </AdminContext.Provider>
  );
};

export const useAdmin = () => {
  const context = useContext(AdminContext);
  if (context === undefined) {
    throw new Error('useAdmin must be used within an AdminProvider');
  }
  return context;
};
