import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectCategory } from '../types';
import { useAdmin } from '../context/AdminContext';
import { ProjectFormModal } from './ProjectFormModal';
import { Maximize2, Edit2, Trash2, Plus, X, ArrowRight, AlertCircle } from 'lucide-react';

// --- SMART VIDEO PLAYER (Main Content) ---
// Détecte Google Drive / YouTube et utilise un Iframe si nécessaire, sinon Video HTML5
// Utilise IntersectionObserver pour ne charger/jouer que si visible à l'écran
const SmartVideoPlayer: React.FC<{ src: string; className?: string; autoPlay?: boolean; controls?: boolean }> = ({ src, className, autoPlay = false, controls = false }) => {
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setHasError(false);
  }, [src]);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      // Chargement dynamique : On charge quand c'est visible, on décharge (optionnel) ou pause quand ça sort
      // Pour les performances maximales sur une grande grille, on toggle la visibilité
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 });
    
    if (containerRef.current) observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  if (hasError) {
    return (
      <div className={`flex flex-col items-center justify-center bg-gray-50 border border-gray-100 ${className}`}>
         <AlertCircle className="w-8 h-8 text-gray-300 mb-2" />
         <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest px-4 text-center">Média Indisponible</span>
      </div>
    );
  }

  const driveMatch = src.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.google\.com\/uc\?.*id=)([a-zA-Z0-9_-]+)/);
  const ytMatch = src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);

  // Render logic based on visibility to save resources
  const shouldRender = isVisible || !autoPlay; // If it's not autoplay (e.g. click to play), we might want to keep it ready, but here we prioritize scroll perf

  if (driveMatch) {
    const driveId = driveMatch[1];
    const embedUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    return (
      <div ref={containerRef} className={`relative bg-black ${className}`}>
        {shouldRender && (
          <iframe
            src={embedUrl}
            className="w-full h-full absolute inset-0 border-0"
            allow="autoplay; encrypted-media; fullscreen"
            allowFullScreen
            title="Drive Video"
            onError={() => setHasError(true)}
          />
        )}
      </div>
    );
  }

  if (ytMatch) {
    const ytId = ytMatch[1];
    const embedUrl = `https://www.youtube.com/embed/${ytId}?autoplay=${autoPlay ? 1 : 0}&mute=1&loop=1&playlist=${ytId}&rel=0&modestbranding=1&controls=${controls ? 1 : 0}`;
    return (
      <div ref={containerRef} className={`relative bg-black ${className}`}>
        {shouldRender && (
          <iframe
            src={embedUrl}
            className="w-full h-full absolute inset-0 border-0"
            allow="autoplay; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
            title="YouTube Video"
          />
        )}
      </div>
    );
  }

  return (
    <div ref={containerRef} className={className}>
       {shouldRender && (
         <video
            src={src}
            className="w-full h-full object-cover"
            muted
            loop={!controls}
            autoPlay={autoPlay}
            controls={controls}
            playsInline
            onError={() => setHasError(true)}
          />
       )}
    </div>
  );
};

// --- LAZY HOVER PREVIEW ---
// Handles hover previews efficiently using IntersectionObserver from Parent
const LazyHoverPreview: React.FC<{ src: string; isHovered: boolean; isParentVisible: boolean }> = ({ src, isHovered, isParentVisible }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  
  // Logic for HTML5 videos: Play only when hovered
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;

    if (isHovered) {
      video.muted = true;
      video.currentTime = 0;
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {});
      }
    } else {
      video.pause();
    }
  }, [isHovered]);

  // If parent card isn't visible in viewport, don't render anything to save memory (Virtualization logic)
  if (!isParentVisible) return null;

  const driveMatch = src.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.google\.com\/uc\?.*id=)([a-zA-Z0-9_-]+)/);
  const ytMatch = src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);

  // For Iframes (Drive/YT): Only mount if hovered (heavy resource)
  if (driveMatch) {
    if (!isHovered) return null;
    const driveId = driveMatch[1];
    return (
      <iframe
        src={`https://drive.google.com/file/d/${driveId}/preview?autoplay=1`}
        className="absolute inset-0 w-full h-full object-cover z-10 border-0 pointer-events-none"
        allow="autoplay"
      />
    );
  }

  if (ytMatch) {
    if (!isHovered) return null;
    const ytId = ytMatch[1];
    return (
      <iframe
        src={`https://www.youtube.com/embed/${ytId}?autoplay=1&mute=1&controls=0&modestbranding=1&loop=1&playlist=${ytId}`}
        className="absolute inset-0 w-full h-full object-cover z-10 border-0 pointer-events-none"
        allow="autoplay"
      />
    );
  }

  // For HTML5: Mount but don't play until effect triggers
  return (
    <video
      ref={videoRef}
      src={src}
      muted
      loop
      playsInline
      preload="none"
      className={`absolute inset-0 w-full h-full object-cover z-10 transition-opacity duration-300 pointer-events-none ${isHovered ? 'opacity-100' : 'opacity-0'}`}
    />
  );
};

// --- PROJECT CARD COMPONENT ---
interface ProjectCardProps {
  project: Project;
  isAdmin: boolean;
  onEdit: (p: Project, e: React.MouseEvent) => void;
  onDelete: (id: string, e: React.MouseEvent) => void;
  onClick: (p: Project) => void;
  getGridClass: (size?: string) => string;
}

const ProjectCard: React.FC<ProjectCardProps> = ({ project, isAdmin, onEdit, onDelete, onClick, getGridClass }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [isImageLoaded, setIsImageLoaded] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);

  // Intersection Observer for the card itself
  useEffect(() => {
    if (!('IntersectionObserver' in window)) {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      setIsVisible(entry.isIntersecting);
    }, { threshold: 0.1 }); // Load when 10% visible
    
    if (cardRef.current) observer.observe(cardRef.current);
    return () => observer.disconnect();
  }, []);

  const hasVideo = !!project.videoUrl;
  const hasImage = !!project.imageUrl;
  // Detect if the "Image" is actually a Google Drive link (which needs iframe)
  const isDriveImage = hasImage && project.imageUrl!.includes('drive.google.com');

  const showHoverPreview = hasVideo && hasImage;

  return (
    <div
      ref={cardRef}
      onClick={() => onClick(project)}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`group relative rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer transform transition-all duration-300 hover:scale-[1.03] hover:z-20 ${getGridClass(project.size)}`}
    >
      {/* Background Media */}
      {hasImage && !isDriveImage ? (
        <>
          {/* Skeleton Placeholder */}
          {!isImageLoaded && <div className="absolute inset-0 bg-gray-200 animate-pulse z-0" />}
          <img
            src={project.imageUrl}
            alt={project.title}
            loading="lazy"
            decoding="async"
            onLoad={() => setIsImageLoaded(true)}
            className={`w-full h-full object-cover transition-all duration-700 z-0 relative ${
              isImageLoaded 
                ? 'opacity-100 blur-0 scale-100' 
                : 'opacity-0 blur-lg scale-105'
            }`}
          />
        </>
      ) : (hasImage && isDriveImage) || hasVideo ? (
          <SmartVideoPlayer
          src={(hasImage && isDriveImage) ? project.imageUrl! : project.videoUrl!}
          className="w-full h-full pointer-events-none"
          autoPlay={true}
        />
      ) : (
        <div className="w-full h-full bg-gray-100 flex items-center justify-center text-gray-300">
          <Maximize2 className="w-12 h-12" />
        </div>
      )}

      {/* Lazy Hover Video Preview (Only if we have a separate video URL) */}
      {showHoverPreview && (
        <LazyHoverPreview 
          src={project.videoUrl!} 
          isHovered={isHovered} 
          isParentVisible={isVisible}
        />
      )}
      
      {/* Admin Overlay Controls */}
      {isAdmin && (
        <div className="absolute top-3 right-3 z-40 flex gap-2">
          <button 
            onClick={(e) => onEdit(project, e)}
            className="p-3 bg-white/90 hover:bg-brand-accent rounded-full text-brand-black hover:text-white backdrop-blur-sm transition-colors shadow-lg active:scale-90"
            title="Modifier"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button 
            onClick={(e) => onDelete(project.id, e)}
            className="p-3 bg-white/90 hover:bg-red-500 rounded-full text-brand-black hover:text-white backdrop-blur-sm transition-colors shadow-lg active:scale-90"
            title="Supprimer"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Content Overlay */}
      <div className="absolute inset-0 z-20 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 pointer-events-none">
        <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
          <div className="flex items-center gap-2 mb-3">
              <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-brand-accent px-3 py-1 rounded-full shadow-lg">
                {project.category}
              </span>
          </div>
          
          <h3 className="text-2xl font-black text-white leading-tight mb-1 drop-shadow-md">{project.title}</h3>
          <p className="text-gray-300 font-medium text-sm mb-4 drop-shadow-sm">{project.client}</p>

          {/* Metrics */}
          {project.metrics && (
            <div className="flex flex-wrap gap-2 mt-2">
              {project.metrics.map((m, idx) => (
                <div key={idx} className="bg-white/10 border border-white/20 px-3 py-1.5 rounded-lg text-xs text-white backdrop-blur-md">
                  <span className="opacity-70 mr-1.5">{m.label}</span>
                  <span className="font-bold">{m.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export const PortfolioGallery: React.FC = () => {
  const { projects, isAdmin, deleteProject, updateProject, addProject } = useAdmin();
  const [filter, setFilter] = useState<string>('ALL');
  
  // State for modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  const [viewingProject, setViewingProject] = useState<Project | null>(null);
  
  // Viewer Image Loading State
  const [isViewerImageLoaded, setIsViewerImageLoaded] = useState(false);

  // Manage body scroll when viewer is open
  useEffect(() => {
    if (viewingProject) {
      document.body.style.overflow = 'hidden';
      setIsViewerImageLoaded(false); // Reset loading state
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [viewingProject]);

  const filteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const categories = ['ALL', ...Object.values(ProjectCategory)];

  // Refined grid logic to match user request (3:4 different from 9:16)
  const getGridClassRefined = (size?: string) => {
      switch(size) {
          case 'tall': return 'row-span-4 col-span-1'; // 9:16 REELS
          case 'portrait': return 'row-span-3 col-span-1'; // 3:4 PORTRAIT
          case 'wide': return 'col-span-1 md:col-span-2 row-span-2'; // 16:9
          case 'large': return 'col-span-2 row-span-4'; // 2x2
          default: return 'col-span-1 row-span-2'; // 1:1 SQUARE
      }
  };

  // Helper to get aspect ratio for similar projects thumbnails
  const getAspectRatioClass = (size?: string) => {
    switch (size) {
      case 'tall': return 'aspect-[9/16]';
      case 'portrait': return 'aspect-[3/4]';
      case 'wide': return 'aspect-video';
      case 'large': return 'aspect-square';
      default: return 'aspect-square';
    }
  };

  const handleProjectClick = (project: Project) => {
    setViewingProject(project);
  };

  const handleEditClick = (project: Project, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingProject(project);
    setIsFormOpen(true);
  };

  const handleDeleteClick = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm('Voulez-vous vraiment supprimer ce projet ?')) {
      deleteProject(id);
    }
  };

  const handleAddNew = () => {
    setEditingProject(undefined);
    setIsFormOpen(true);
  };

  const handleSaveProject = async (project: Project) => {
    if (editingProject) {
      await updateProject(project);
    } else {
      await addProject({ ...project, id: Date.now().toString() });
    }
  };

  const similarProjects = viewingProject 
    ? projects
        .filter(p => p.category === viewingProject.category && p.id !== viewingProject.id)
        .slice(0, 2) 
    : [];

  return (
    <section id="work" className="py-24 bg-brand-light min-h-screen relative">
      <div className="container mx-auto px-4">
        
        {/* Navigation Filters */}
        <div className="sticky top-24 z-30 mb-16">
          <div className="relative flex justify-center items-center">
            <div className="flex overflow-x-auto gap-2 no-scrollbar bg-white/90 backdrop-blur-md p-2 rounded-2xl shadow-sm border border-gray-100 max-w-full">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setFilter(cat)}
                  className={`whitespace-nowrap px-6 py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all duration-300 active:scale-95 ${
                    filter === cat
                      ? 'bg-brand-black text-white shadow-lg'
                      : 'text-gray-500 hover:text-brand-black hover:bg-gray-100'
                  }`}
                >
                  {cat === 'ALL' ? 'Tout' : cat}
                </button>
              ))}
            </div>

            {isAdmin && (
              <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden lg:block">
                <button 
                  onClick={handleAddNew}
                  className="flex items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95"
                >
                  <Plus className="w-5 h-5" />
                  Nouveau
                </button>
              </div>
            )}
          </div>
          
          {isAdmin && (
            <div className="lg:hidden mt-4 flex justify-center">
               <button 
                  onClick={handleAddNew}
                  className="flex items-center gap-2 bg-brand-accent hover:bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold transition-all shadow-lg hover:shadow-blue-500/30 active:scale-95 w-full justify-center"
                >
                  <Plus className="w-5 h-5" />
                  Ajouter un projet
                </button>
            </div>
          )}
        </div>

        {/* Masonry/Bento Grid with ProjectCard Component */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[180px]">
          {filteredProjects.map((project) => (
            <ProjectCard
              key={project.id}
              project={project}
              isAdmin={isAdmin}
              onEdit={handleEditClick}
              onDelete={handleDeleteClick}
              onClick={handleProjectClick}
              getGridClass={getGridClassRefined}
            />
          ))}
        </div>
      </div>

      {/* Admin Edit Modal */}
      <ProjectFormModal 
        isOpen={isFormOpen} 
        onClose={() => setIsFormOpen(false)} 
        onSave={handleSaveProject}
        initialData={editingProject}
      />

      {/* Project Viewer Modal */}
      {viewingProject && (
        <div 
          className="fixed inset-0 z-[100] bg-brand-dark/95 backdrop-blur-xl flex items-center justify-center p-4" 
          onClick={(e) => {
            if (e.target === e.currentTarget) setViewingProject(null);
          }}
        >
          <button 
            className="absolute top-4 right-4 md:top-8 md:right-8 text-white/50 hover:text-white transition-colors z-[110] p-2 hover:bg-white/10 rounded-full active:scale-95"
            onClick={() => setViewingProject(null)}
          >
            <X className="w-10 h-10" />
          </button>

          <div 
            className="max-w-7xl w-full max-h-[90vh] flex flex-col md:flex-row bg-white rounded-[2.5rem] overflow-hidden shadow-2xl animate-fade-in relative" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Area */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[400px] bg-grid-white/[0.05]">
              {viewingProject.videoUrl ? (
                <SmartVideoPlayer 
                  src={viewingProject.videoUrl} 
                  controls={true}
                  autoPlay={true}
                  className={`max-h-[85vh] w-full h-full ${viewingProject.category === ProjectCategory.REELS ? 'max-w-md mx-auto aspect-[9/16]' : 'aspect-video'}`}
                />
              ) : viewingProject.imageUrl && viewingProject.imageUrl.includes('drive.google.com') ? (
                 <SmartVideoPlayer 
                  src={viewingProject.imageUrl} 
                  controls={true}
                  autoPlay={false}
                  className="max-h-[85vh] w-full h-full aspect-video"
                />
              ) : viewingProject.imageUrl ? (
                <>
                 {!isViewerImageLoaded && <div className="absolute inset-0 bg-gray-800 animate-pulse" />}
                 <img 
                  src={viewingProject.imageUrl} 
                  alt={viewingProject.title} 
                  loading="lazy"
                  decoding="async"
                  onLoad={() => setIsViewerImageLoaded(true)}
                  className={`w-full h-full max-h-[85vh] object-contain transition-all duration-700 ${
                    isViewerImageLoaded ? 'opacity-100 blur-0' : 'opacity-0 blur-sm'
                  }`}
                />
                </>
              ) : (
                <div className="text-white">Media non disponible</div>
              )}
            </div>

            {/* Info Area */}
            <div className="w-full md:w-[400px] lg:w-[450px] p-8 md:p-12 flex flex-col bg-white overflow-y-auto max-h-[50vh] md:max-h-auto">
               <div className="flex-1">
                 <span className="text-brand-accent text-xs font-bold uppercase tracking-wider mb-4 px-3 py-1 bg-blue-50 w-fit rounded-full block">
                   {viewingProject.category}
                 </span>
                 <h2 className="text-4xl md:text-5xl font-black text-brand-black mb-2 tracking-tighter leading-none">{viewingProject.title}</h2>
                 <p className="text-gray-400 font-bold text-lg mb-8 pb-6 border-b border-gray-100">{viewingProject.client}</p>

                 {viewingProject.description && (
                   <p className="text-gray-600 leading-relaxed mb-8 text-lg">
                     {viewingProject.description}
                   </p>
                 )}

                 {viewingProject.metrics && viewingProject.metrics.length > 0 && (
                   <div className="space-y-6 mb-8">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider">Performance Metrics</h3>
                     <div className="grid grid-cols-2 gap-4">
                      {viewingProject.metrics.map((m, idx) => (
                        <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100 hover:border-brand-accent/30 transition-colors">
                          <span className="text-gray-400 text-xs font-bold uppercase block mb-1">{m.label}</span>
                          <span className="text-brand-accent font-black font-mono text-xl md:text-2xl">{m.value}</span>
                        </div>
                      ))}
                     </div>
                   </div>
                 )}

                 {/* Similar Projects Section */}
                 {similarProjects.length > 0 && (
                   <div className="mt-6 pt-6 border-t border-gray-100">
                     <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-4">Projets Similaires</h3>
                     <div className="grid grid-cols-2 gap-3 items-start">
                       {similarProjects.map((simProject) => (
                         <div 
                           key={simProject.id} 
                           onClick={() => setViewingProject(simProject)}
                           className="group cursor-pointer"
                         >
                           {/* Dynamic Aspect Ratio Class applied here */}
                           <div className={`${getAspectRatioClass(simProject.size)} rounded-xl overflow-hidden mb-2 relative bg-gray-100 w-full`}>
                             {simProject.imageUrl && !simProject.imageUrl.includes('drive.google.com') ? (
                                <img 
                                  src={simProject.imageUrl} 
                                  alt={simProject.title}
                                  loading="lazy"
                                  decoding="async"
                                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500 opacity-0 animate-[fadeIn_0.5s_ease-out_forwards]"
                                />
                             ) : (
                                <SmartVideoPlayer 
                                  src={simProject.imageUrl && simProject.imageUrl.includes('drive.google.com') ? simProject.imageUrl : simProject.videoUrl!} 
                                  className="w-full h-full object-cover pointer-events-none"
                                />
                             )}
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                           </div>
                           <h4 className="text-sm font-bold text-brand-black leading-tight group-hover:text-brand-accent transition-colors truncate">
                             {simProject.title}
                           </h4>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
               
            </div>
          </div>
        </div>
      )}
    </section>
  );
};