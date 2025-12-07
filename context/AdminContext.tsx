
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Project, ProjectCategory } from '../types';
import { supabase, isSupabaseConfigured } from '../services/supabaseClient';

// Données de secours (Mode Démo)
const FALLBACK_PROJECTS: Project[] = [
  {
    id: '1',
    title: 'Neon Energy Drink',
    category: ProjectCategory.REELS,
    imageUrl: 'https://images.unsplash.com/photo-1626806819282-2c1dc01a5e0c?q=80&w=1000&auto=format&fit=crop',
    videoUrl: 'https://storage.googleapis.com/gtv-videos-bucket/sample/ForBiggerJoyrides.mp4',
    client: 'NeonEnergy',
    size: 'tall',
    metrics: [{ label: 'Vues', value: '2.4M' }, { label: 'Likes', value: '150k' }]
  },
  {
    id: '2',
    title: 'Luxe Automotive',
    category: ProjectCategory.VIDEO,
    imageUrl: 'https://images.unsplash.com/photo-1503376763036-066120622c74?q=80&w=1000&auto=format&fit=crop',
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
  }
];

// Version des données (Incrémenté pour forcer le refresh)
const DATA_VERSION = 'v13';

interface AdminContextType {
  isAdmin: boolean;
  login: (password: string) => boolean;
  logout: () => void;
  projects: Project[];
  isLoading: boolean;
  addProject: (project: Project) => Promise<void>;
  updateProject: (project: Project) => Promise<void>;
  deleteProject: (id: string) => Promise<void>;
  isLive: boolean;
}

const AdminContext = createContext<AdminContextType | undefined>(undefined);

// Helper transformation lien Google Drive (Image OU Vidéo) - EXPORTÉ pour être utilisé dans le Modal
export const processGoogleDriveLink = (url?: string): string | undefined => {
  if (!url || url.trim() === '') return undefined;

  // Détection des liens Google Drive
  const driveIdRegex = /(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.google\.com\/uc\?id=)([a-zA-Z0-9_-]+)/;
  const match = url.match(driveIdRegex);

  if (match && match[1]) {
    // Conversion en lien de téléchargement direct pour lecture HTML5 / Affichage IMG
    return `https://drive.google.com/uc?export=download&id=${match[1]}`;
  }

  return url;
};

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

    if (!isSupabaseConfigured) {
      console.log("⚠️ Supabase non configuré. Mode lecture locale.");
      const storedVersion = localStorage.getItem('ivision_data_version');
      if (storedVersion !== DATA_VERSION) {
         localStorage.setItem('ivision_data_version', DATA_VERSION);
      }
      setProjects(FALLBACK_PROJECTS);
      setIsLoading(false);
      return;
    }

    try {
      const { data, error } = await supabase
        .from('projects')
        .select(`
          *,
          project_metrics (label, value)
        `)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedProjects: Project[] = data.map((p: any) => ({
          id: p.id.toString(),
          title: p.title,
          category: p.category as ProjectCategory,
          imageUrl: p.image_url || undefined,
          videoUrl: p.video_url,
          client: p.client,
          description: p.description,
          size: p.size,
          metrics: p.project_metrics || []
        }));
        setProjects(formattedProjects);
      }
    } catch (e: any) {
      console.error("Erreur chargement DB:", e.message);
      // En cas d'erreur réseau, on ne remplace pas par le fallback pour ne pas induire en erreur l'admin
      if (projects.length === 0) setProjects(FALLBACK_PROJECTS);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

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
    // Traitement automatique des liens Google Drive pour Vidéo ET Image
    const cleanVideoUrl = processGoogleDriveLink(project.videoUrl);
    const cleanImageUrl = processGoogleDriveLink(project.imageUrl) || project.imageUrl || ''; // Empty string if missing

    if (!isSupabaseConfigured) {
      alert("⚠️ ATTENTION: Vos clés Supabase ne sont pas configurées correctement.\n\nLe projet sera ajouté TEMPORAIREMENT et disparaîtra au rechargement.");
      setProjects(prev => [{ ...project, imageUrl: cleanImageUrl, videoUrl: cleanVideoUrl }, ...prev]);
      return;
    }

    try {
      const { data: projectData, error: projectError } = await supabase
        .from('projects')
        .insert([{
          title: project.title,
          category: project.category,
          image_url: cleanImageUrl, // Peut être vide
          video_url: cleanVideoUrl,
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
      // Pas d'alerte de succès pour le mode "Lazy" - C'est immédiat.
    } catch (error: any) {
      console.error("Erreur Ajout:", error);
      alert(`❌ Erreur lors de la sauvegarde : ${error.message}`);
      throw error; // Re-throw pour que le formulaire sache qu'il y a eu une erreur
    }
  };

  const updateProject = async (project: Project) => {
    // Traitement automatique des liens Google Drive pour Vidéo ET Image
    const cleanVideoUrl = processGoogleDriveLink(project.videoUrl);
    const cleanImageUrl = processGoogleDriveLink(project.imageUrl) || project.imageUrl || '';

    if (!isSupabaseConfigured) {
      alert("⚠️ ATTENTION: Supabase non configuré. Modification temporaire.");
      setProjects(prev => prev.map(p => p.id === project.id ? { ...project, imageUrl: cleanImageUrl, videoUrl: cleanVideoUrl } : p));
      return;
    }

    try {
      const { error: projectError } = await supabase
        .from('projects')
        .update({
          title: project.title,
          category: project.category,
          image_url: cleanImageUrl,
          video_url: cleanVideoUrl,
          client: project.client,
          description: project.description,
          size: project.size
        })
        .eq('id', project.id);

      if (projectError) throw projectError;

      // Update metrics
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
      // Pas d'alerte de succès
    } catch (error: any) {
      console.error("Erreur Update:", error);
      alert(`❌ Erreur modification : ${error.message}`);
      throw error;
    }
  };

  const deleteProject = async (id: string) => {
    if (!isSupabaseConfigured) {
      if (confirm("Supabase non configuré. Supprimer localement ?")) {
        setProjects(prev => prev.filter(p => p.id !== id));
      }
      return;
    }

    try {
      const { error } = await supabase.from('projects').delete().eq('id', id);
      if (error) throw error;
      await fetchProjects();
    } catch (error: any) {
      console.error("Erreur Delete:", error);
      alert(`❌ Erreur suppression : ${error.message}`);
    }
  };

  return (
    <AdminContext.Provider value={{ isAdmin, login, logout, projects, isLoading, addProject, updateProject, deleteProject, isLive: isSupabaseConfigured }}>
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
