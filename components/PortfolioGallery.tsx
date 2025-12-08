
import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectCategory } from '../types';
import { useAdmin } from '../context/AdminContext';
import { ProjectFormModal } from './ProjectFormModal';
import { Edit2, Trash2, Plus, X, AlertCircle, Play } from 'lucide-react';

// --- SMART VIDEO PLAYER (OPTIMISÉ) ---
const SmartVideoPlayer: React.FC<{ 
  src: string; 
  className?: string; 
  autoPlay?: boolean; 
  controls?: boolean; 
  mode?: 'cover' | 'contain' 
}> = ({ src, className, autoPlay = false, controls = false, mode = 'cover' }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Intersection Observer léger pour la performance
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { rootMargin: '100px' }); // Charge un peu avant d'arriver à l'écran
    
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Gestion stricte de la lecture
  useEffect(() => {
    if (videoRef.current) {
      if (isVisible && autoPlay) {
        videoRef.current.currentTime = 0;
        videoRef.current.muted = true;
        videoRef.current.loop = true;
        videoRef.current.play().catch(() => {});
      } else {
        videoRef.current.pause();
      }
    }
  }, [isVisible, autoPlay]);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-100 ${className}`}>
         <AlertCircle className="w-5 h-5 text-gray-400 mb-1" />
      </div>
    );
  }

  const driveMatch = src.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.google\.com\/uc\?.*id=)([a-zA-Z0-9_-]+)/);
  const ytMatch = src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);

  // CSS classes pour le centrage parfait
  const fitClass = mode === 'contain' ? 'object-contain' : 'object-cover';
  const baseClass = "absolute inset-0 w-full h-full";

  const renderContent = () => {
    if (!isVisible && !autoPlay) return null;

    if (driveMatch) {
      return (
        <iframe
          src={`https://drive.google.com/file/d/${driveMatch[1]}/preview`}
          className={`${baseClass} ${fitClass} border-0`}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title="Drive"
          onError={() => setHasError(true)}
          style={{ pointerEvents: controls ? 'auto' : 'none' }}
        />
      );
    }

    if (ytMatch) {
      return (
        <iframe
          src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=${autoPlay ? 1 : 0}&mute=1&loop=1&playlist=${ytMatch[1]}&controls=${controls ? 1 : 0}&showinfo=0&rel=0&modestbranding=1`}
          className={`${baseClass} ${fitClass} border-0`}
          allow="autoplay; encrypted-media; fullscreen"
          allowFullScreen
          title="YouTube"
          onError={() => setHasError(true)}
          style={{ pointerEvents: controls ? 'auto' : 'none' }}
        />
      );
    }

    return (
      <video
        ref={videoRef}
        src={src}
        className={`${baseClass} ${fitClass}`} 
        muted
        loop
        playsInline
        controls={controls}
        onError={() => setHasError(true)}
      />
    );
  };

  return (
    <div ref={containerRef} className={`relative bg-black w-full h-full overflow-hidden flex items-center justify-center ${className}`}>
      {renderContent()}
    </div>
  );
};

// --- PROJECT CARD (SIMPLIFIÉE) ---
const ProjectCard: React.FC<{ 
  project: Project; 
  onClick: () => void;
  isAdmin: boolean;
  onEdit: (p: Project) => void;
  onDelete: (id: string) => void;
}> = ({ project, onClick, isAdmin, onEdit, onDelete }) => {
  const [isHovered, setIsHovered] = useState(false);
  
  // Détection Mobile (pour désactiver les effets lourds)
  const isMobile = typeof window !== 'undefined' && window.matchMedia('(max-width: 768px)').matches;
  const isDriveImage = project.imageUrl && project.imageUrl.includes('drive.google.com');

  return (
    <div 
      className="group relative w-full h-full overflow-hidden rounded-2xl md:rounded-3xl bg-gray-200 cursor-pointer transform transition-transform duration-300 active:scale-95"
      onClick={onClick}
      onMouseEnter={() => !isMobile && setIsHovered(true)}
      onMouseLeave={() => !isMobile && setIsHovered(false)}
    >
      {/* Media Layer */}
      <div className="absolute inset-0 w-full h-full">
         {project.imageUrl && !isDriveImage ? (
           <img 
             src={project.imageUrl} 
             alt={project.title}
             loading="lazy"
             decoding="async"
             className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
           />
         ) : (
           <SmartVideoPlayer 
             src={isDriveImage ? project.imageUrl! : project.videoUrl || ''} 
             className="w-full h-full"
             autoPlay={!project.imageUrl} 
             mode="cover"
           />
         )}
      </div>

      {/* Hover Video Preview (Desktop Only) */}
      {!isMobile && isHovered && project.videoUrl && (
        <div className="absolute inset-0 z-10 animate-fade-in bg-black">
           <SmartVideoPlayer src={project.videoUrl} autoPlay={true} mode="cover" />
        </div>
      )}

      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300 z-20 pointer-events-none" />

      {/* Text Info */}
      <div className="absolute bottom-0 left-0 p-4 z-30 flex flex-col items-start transform translate-y-2 md:translate-y-4 md:group-hover:translate-y-0 transition-transform duration-300">
         <span className="bg-brand-accent text-white text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider mb-1">
           {project.category}
         </span>
         <h3 className="text-white font-bold text-sm md:text-lg leading-tight drop-shadow-md">
           {project.title}
         </h3>
      </div>

      {/* Admin Buttons */}
      {isAdmin && (
        <div className="absolute top-2 right-2 flex gap-2 z-40" onClick={e => e.stopPropagation()}>
          <button onClick={() => onEdit(project)} className="p-2 bg-white rounded-full text-black hover:text-blue-600 shadow-sm">
            <Edit2 className="w-3 h-3" />
          </button>
          <button onClick={() => onDelete(project.id)} className="p-2 bg-white rounded-full text-red-500 hover:bg-red-50 shadow-sm">
            <Trash2 className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};

// --- MAIN GALLERY ---
export const PortfolioGallery: React.FC = () => {
  const { projects, isAdmin, isLoading, addProject, updateProject, deleteProject } = useAdmin();
  const [filter, setFilter] = useState<ProjectCategory | 'ALL'>('ALL');
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);

  const filteredProjects = filter === 'ALL' ? projects : projects.filter(p => p.category === filter);

  // GRILLE MOBILE ULTRA PRÉCISE (Masonry naturel)
  const getGridClass = (size?: string, category?: string) => {
    // Hauteur de base mobile = 50px
    let mobileRows = 'row-span-4'; // Carré standard (4x50 = 200px)
    
    if (category === ProjectCategory.REELS) mobileRows = 'row-span-6'; // Très haut (300px)
    else if (size === 'portrait') mobileRows = 'row-span-5'; // Haut (250px)
    else if (size === 'wide' || category === ProjectCategory.VIDEO) mobileRows = 'row-span-2'; // Petit (100px)

    // Desktop
    switch(size) {
      case 'tall': return `${mobileRows} md:col-span-1 md:row-span-2`;
      case 'wide': return `${mobileRows} md:col-span-2 md:row-span-1`;
      case 'large': return `${mobileRows} md:col-span-2 md:row-span-2`;
      case 'portrait': return `${mobileRows} md:col-span-1 md:row-span-2`;
      default: return `${mobileRows} md:col-span-1 md:row-span-1`;
    }
  };

  const handleNew = () => { setEditingProject(undefined); setIsFormOpen(true); };
  const handleEdit = (p: Project) => { setEditingProject(p); setIsFormOpen(true); };

  return (
    <section id="work" className="py-12 md:py-24 bg-white min-h-screen">
      <div className="container mx-auto px-4">
        
        {/* Filters */}
        <div className="flex flex-col md:flex-row justify-between items-center mb-8 gap-4 relative">
          <div className="flex flex-wrap justify-center gap-2">
            <button onClick={() => setFilter('ALL')} className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${filter === 'ALL' ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>Tout</button>
            {Object.values(ProjectCategory).map(cat => (
              <button key={cat} onClick={() => setFilter(cat)} className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold uppercase tracking-widest transition-all ${filter === cat ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>{cat}</button>
            ))}
          </div>
          {isAdmin && (
            <button onClick={handleNew} className="fixed bottom-6 right-6 z-50 bg-blue-600 text-white w-14 h-14 rounded-full flex items-center justify-center shadow-2xl active:scale-90 md:absolute md:top-0 md:bottom-auto md:right-0">
              <Plus className="w-6 h-6" />
            </button>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
           <div className="flex justify-center py-20"><div className="w-10 h-10 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div></div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-4 auto-rows-[50px] md:auto-rows-[180px] gap-3 md:gap-6 flow-dense">
            {filteredProjects.map((project) => (
              <div key={project.id} className={getGridClass(project.size, project.category)}>
                 <ProjectCard project={project} onClick={() => setSelectedProject(project)} isAdmin={isAdmin} onEdit={handleEdit} onDelete={deleteProject} />
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VIEWER (MODAL) */}
      {selectedProject && (
        <div className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-md flex items-center justify-center p-0 md:p-8" onClick={() => setSelectedProject(null)}>
          <button className="absolute top-4 right-4 z-[70] p-2 bg-white/10 rounded-full text-white" onClick={() => setSelectedProject(null)}>
            <X className="w-6 h-6" />
          </button>

          <div className="bg-white w-full h-full md:max-w-6xl md:h-[90vh] md:rounded-3xl overflow-hidden flex flex-col md:flex-row shadow-2xl" onClick={e => e.stopPropagation()}>
             {/* Player Area */}
             <div className="w-full h-[50vh] md:w-2/3 md:h-full bg-black flex items-center justify-center relative">
                {selectedProject.videoUrl ? (
                  <SmartVideoPlayer src={selectedProject.videoUrl} className="w-full h-full" controls={true} autoPlay={true} mode="contain" />
                ) : selectedProject.imageUrl ? (
                   <SmartVideoPlayer src={selectedProject.imageUrl} className="w-full h-full" mode="contain" />
                ) : null}
             </div>

             {/* Details Area */}
             <div className="w-full h-[50vh] md:w-1/3 md:h-full bg-white p-6 md:p-10 overflow-y-auto">
                <span className="text-blue-600 text-[10px] font-bold uppercase tracking-wider mb-2 block">{selectedProject.category}</span>
                <h2 className="text-2xl md:text-3xl font-black mb-1">{selectedProject.title}</h2>
                <p className="text-gray-400 font-medium mb-4">{selectedProject.client}</p>
                <p className="text-gray-600 text-sm leading-relaxed mb-6">{selectedProject.description}</p>
                
                {selectedProject.metrics && (
                  <div className="grid grid-cols-2 gap-3">
                    {selectedProject.metrics.map((m, i) => (
                      <div key={i} className="bg-gray-50 p-3 rounded-xl">
                        <div className="text-blue-600 font-black text-xl">{m.value}</div>
                        <div className="text-gray-400 text-[10px] font-bold uppercase">{m.label}</div>
                      </div>
                    ))}
                  </div>
                )}
             </div>
          </div>
        </div>
      )}

      {isFormOpen && (
        <ProjectFormModal isOpen={isFormOpen} onClose={() => setIsFormOpen(false)} onSave={editingProject ? updateProject : addProject} initialData={editingProject} />
      )}
    </section>
  );
};
