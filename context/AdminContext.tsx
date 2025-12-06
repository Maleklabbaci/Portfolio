import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectCategory } from '../types';
import { supabase } from '../services/supabaseClient';

// Données de secours si Supabase n'est pas configuré
const FALLBACK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Exemple Summer Vibes',
    category: ProjectCategory.REELS,
    imageUrl: 'https://images.unsplash.com/photo-1516035069371-29a1b244cc32?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    client: 'NeonEnergy',
    size: 'tall',
    metrics: [{ label: 'Vues', value: '2.4M' }]
  },
  {
    id: '2',
    title: 'Exemple Cinematic Brand',
    category: ProjectCategory.VIDEO,
    imageUrl: 'https://images.unsplash.com/photo-1492691527719-9d1e07e534b4?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4',
    client: 'LuxeAuto',
    size: 'wide'
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

  // --- FETCH PROJECTS FROM SUPABASE ---
  const fetchProjects = async () => {
    setIsLoading(true);
    try {
      // On récupère les projets ET leurs métriques associées
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
        console.error("Error fetching projects:", error);
        // Si erreur (ex: mauvaise config), on charge le fallback pour que le site marche quand même
        setProjects(FALLBACK_PROJECTS);
      } else {
        // Transformation des données Supabase pour matcher notre type Project
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
      console.error("Supabase connection failed:", e);
      setProjects(FALLBACK_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  // --- AUTH SIMPLE (UI Only) ---
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

  const addProject = async (project: Project) => {
    try {
      // 1. Insert Project
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

      // 2. Insert Metrics if any
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

      await fetchProjects(); // Refresh UI
    } catch (error) {
      console.error("Error adding project:", error);
      alert("Erreur lors de l'ajout sur Supabase");
    }
  };

  const updateProject = async (project: Project) => {
    try {
      // 1. Update Project Fields
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

      // 2. Update Metrics (Strategy: Delete all old, Insert new)
      // Delete old metrics
      await supabase.from('project_metrics').delete().eq('project_id', project.id);

      // Insert new ones
      if (project.metrics && project.metrics.length > 0) {
        const metricsToInsert = project.metrics.map(m => ({
          project_id: project.id,
          label: m.label,
          value: m.value
        }));
        await supabase.from('project_metrics').insert(metricsToInsert);
      }

      await fetchProjects(); // Refresh UI
    } catch (error) {
      console.error("Error updating project:", error);
      alert("Erreur lors de la mise à jour");
    }
  };

  const deleteProject = async (id: string) => {
    try {
      const { error } = await supabase
        .from('projects')
        .delete()
        .eq('id', id);

      if (error) throw error;
      
      await fetchProjects(); // Refresh UI
    } catch (error) {
      console.error("Error deleting project:", error);
      alert("Erreur lors de la suppression");
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
