import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectCategory } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

// Données de secours (Mode Démo)
const FALLBACK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Neon Energy Drink',
    category: ProjectCategory.REELS,
    imageUrl: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    client: 'NeonEnergy',
    size: 'tall',
    metrics: [{ label: 'Vues', value: '2.4M' }, { label: 'Likes', value: '150k' }]
  },
  {
    id: '2',
    title: 'Luxe Automotive',
    category: ProjectCategory.VIDEO,
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    client: 'LuxeAuto',
    size: 'wide',
    metrics: [{ label: 'Conversion', value: '4.2%' }]
  },
  {
    id: '3',
    title: 'Minimalist Furniture',
    category: ProjectCategory.PHOTO,
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?q=80&w=1000&auto=format&fit=crop',
    client: 'NordicHome',
    size: 'normal'
  },
  {
    id: '4',
    title: 'Tech Startup Brand',
    category: ProjectCategory.DESIGN,
    imageUrl: 'https://images.unsplash.com/photo-1626785774573-4b799314346d?q=80&w=1000&auto=format&fit=crop',
    client: 'FlowApp',
    size: 'large',
    metrics: [{ label: 'Brand Lift', value: '+45%' }]
  },
  {
    id: '5',
    title: 'Fashion Week Coverage',
    category: ProjectCategory.REELS,
    imageUrl: 'https://images.unsplash.com/photo-1537832816519-689ad163238b?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerBlazes.mp4',
    client: 'VogueLocal',
    size: 'tall'
  }
];

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  projects: Project[];
  isLoading: boolean;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

export const AdminProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isAdmin, setIsAdmin] = useState(() => {
    try {
      return localStorage.getItem('ivision_is_admin') === 'true';
    } catch {
      return false;
    }
  });

  const [projects, setProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // --- FETCH PROJECTS ---
  const fetchProjects = async () => {
    setIsLoading(true);

    // MODE DÉMO (Si pas de clés API)
    if (!isSupabaseConfigured) {
      console.log("Supabase non configuré : Chargement du mode démo local.");
      // Petit délai simulé pour la fluidité UX, mais très court
      setTimeout(() => {
        setProjects(FALLBACK_PROJECTS);
        setIsLoading(false);
      }, 100);
      return;
    }

    // MODE CONNECTÉ
    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_metrics (
            label,
            value
          )
        `)
        .order('created_at', { ascending: false });

      if (error) {
        // En cas d'erreur explicite de Supabase
        console.warn("Erreur Supabase, bascule sur backup:", error.message);
        setProjects(FALLBACK_PROJECTS);
      } else {
        const formattedProjects: Project[] = data.map((p: any) => ({
          id: p.id.toString(),
          title: p.title,
          category: p.category as ProjectCategory,
          imageUrl: p.image_url,
          videoUrl: p.video_url,
          client: p.client,
          description: p.description,
          size: p.size,
          metrics: p.project_metrics || []
        }));
        setProjects(formattedProjects);
      }
    } catch (e) {
      // En cas d'erreur réseau grave
      console.error("Erreur critique chargement données:", e);
      setProjects(FALLBACK_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- AUTH SIMPLE ---
  const login = (password: string) => {
    if (password === 'admin') {
      setIsAdmin(true);
      localStorage.setItem('ivision_is_admin', 'true');
      return true;
    }
    return false;
  };

  const logout = () => {
    setIsAdmin(false);
    localStorage.removeItem('ivision_is_admin');
  };

  // --- CRUD ACTIONS ---
  // Ces fonctions vérifient la configuration avant d'agir

  const addProject = async (project: Project) => {
    if (!isSupabaseConfigured) {
      alert("Mode DÉMO : Connectez Supabase pour sauvegarder réellement.");
      // Simulation locale pour l'UX
      setProjects(prev => [project, ...prev]);
      return;
    }

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: project.title,
          category: project.category,
          image_url: project.imageUrl,
          video_url: project.videoUrl,
          client: project.client,
          description: project.description,
          size: project.size
        }])
        .select()
        .single();

      if (projectError) throw projectError;

      if (project.metrics && project.metrics.length > 0) {
        const metricsToInsert = project.metrics.map(m => ({
          project_id: projectData.id,
          label: m.label,
          value: m.value
        }));
        
        const { error: metricsError } = await supabase
          .from('project_metrics')
          .insert(metricsToInsert);

        if (metricsError) throw metricsError;
      }

      await fetchProjects();
    } catch (error: any) {
      console.error("Error adding project:", error);
      alert(`Erreur: ${error.message || 'Impossible de sauvegarder'}`);
    }
  };

  const updateProject = async (project: Project) => {
    if (!isSupabaseConfigured) {
      alert("Mode DÉMO : Connectez Supabase pour modifier réellement.");
      setProjects(prev => prev.map(p => p.id === project.id ? project : p));
      return;
    }

    try {
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: project.title,
          category: project.category,
          image_url: project.imageUrl,
          video_url: project.videoUrl,
          client: project.client,
          description: project.description,
          size: project.size
        })
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Update metrics: delete all and recreate
      await supabase.from('project_metrics').delete().eq('project_id', project.id);

      if (project.metrics && project.metrics.length > 0) {
        const metricsToInsert = project.metrics.map(m => ({
          project_id: project.id,
          label: m.label,
          value: m.value
        }));
        await supabase.from('project_metrics').insert(metricsToInsert);
      }

      await fetchProjects();
    } catch (error: any) {
      console.error("Error updating project:", error);
      alert(`Erreur: ${error.message || 'Impossible de modifier'}`);
    }
  };

  const deleteProject = async (id: string) => {
    if (!isSupabaseConfigured) {
      if (confirm("Mode DÉMO : Supprimer localement ?")) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
      return;
    }

    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProjects();
    } catch (error: any) {
      console.error("Error deleting project:", error);
      alert(`Erreur: ${error.message}`);
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, projects, isLoading, addProject, updateProject, deleteProject }}>
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