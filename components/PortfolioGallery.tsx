import React, { useState, useEffect, useRef } from 'react';
import { Project, ProjectCategory } from '../types';
import { useAdmin } from '../context/AdminContext';
import { ProjectFormModal } from './ProjectFormModal';
import { Maximize2, Edit2, Trash2, Plus, X, ArrowRight, AlertCircle } from 'lucide-react';

// --- SMART VIDEO PLAYER ---
// ... (Code inchangé pour SmartVideoPlayer)
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
      setIsVisible(entry.isIntersecting);
    }, { 
      threshold: 0.1,
      rootMargin: '200px'
    }); 
    
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

  const shouldRender = isVisible || !autoPlay; 

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
            loading="lazy"
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
            loading="lazy"
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
            className={`w-full h-full ${controls ? 'object-contain' : 'object-cover'}`}
            muted
            loop={!controls}
            autoPlay={autoPlay}
            controls={controls}
            playsInline
            preload="metadata"
            onError={() => setHasError(true)}
          />
       )}
    </div>
  );
};

// --- LAZY HOVER PREVIEW ---
// ... (Code inchangé pour LazyHoverPreview)
const LazyHoverPreview: React.FC<{ src: string; isHovered: boolean; isParentVisible: boolean }> = ({ src, isHovered, isParentVisible }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    setIsMobile(window.innerWidth < 768);
  }, []);

  useEffect(() => {
    if (isMobile) return; 

    if (isHovered && isParentVisible && videoRef.current) {
        const playPromise = videoRef.current.play();
        if (playPromise !== undefined) {
            playPromise.catch(() => {});
        }
    } else if (videoRef.current) {
        videoRef.current.pause();
        videoRef.current.currentTime = 0;
    }
  }, [isHovered, isParentVisible, isMobile]);

  if (isMobile) return null;

  const driveMatch = src.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.google\.com\/uc\?.*id=)([a-zA-Z0-9_-]+)/);
  const ytMatch = src.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);

  if (driveMatch) {
    if (!isHovered) return null;
    return (
        <div className="absolute inset-0 z-20 bg-black animate-fade-in">
           <iframe
            src={`https://drive.google.com/file/d/${driveMatch[1]}/preview`}
            className="w-full h-full border-0"
            allow="autoplay"
            title="Drive Preview"
          />
        </div>
    );
  }
  
  if (ytMatch) {
    if (!isHovered) return null;
    return (
         <div className="absolute inset-0 z-20 bg-black animate-fade-in">
           <iframe
            src={`https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&controls=0&modestbranding=1`}
            className="w-full h-full border-0"
            allow="autoplay"
            title="YT Preview"
          />
        </div>
    );
  }

  return (
    <video
        ref={videoRef}
        src={isHovered ? src : ""} // Only set src when hovered to prevent network requests
        className={`absolute inset-0 w-full h-full object-cover z-20 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}
        muted
        loop
        playsInline
        preload="none" 
    />
  );
};


// --- PROJECT CARD COMPONENT ---
// ... (Code inchangé pour ProjectCard sauf potentiellement les tailles de texte)
const ProjectCard: React.FC<{ 
    project: Project; 
    isAdmin: boolean; 
    onEdit: (p: Project) => void; 
    onDelete: (id: string) => void; 
    onClick: (p: Project) => void; 
}> = ({ project, isAdmin, onEdit, onDelete, onClick }) => {
    const [isHovered, setIsHovered] = useState(false);
    const [isVisible, setIsVisible] = useState(false);
    const cardRef = useRef<HTMLDivElement>(null);
    const [imageLoaded, setImageLoaded] = useState(false);
    const [isDriveImage, setIsDriveImage] = useState(false);

    useEffect(() => {
        if (!('IntersectionObserver' in window)) {
            setIsVisible(true);
            return;
        }
        const observer = new IntersectionObserver(([entry]) => {
            setIsVisible(entry.isIntersecting);
        }, { threshold: 0.1 });

        if (cardRef.current) observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (project.imageUrl && project.imageUrl.includes('drive.google.com')) {
            setIsDriveImage(true);
        }
    }, [project.imageUrl]);

    const getGridClass = (size?: string, category?: ProjectCategory) => {
        if (category === ProjectCategory.REELS) return 'row-span-4'; // Mobile 4 rows (130px each)
        if (size === 'tall') return 'row-span-4';
        if (size === 'portrait') return 'row-span-3'; // 3:4 aspect
        if (size === 'wide') return 'col-span-1 row-span-2 md:col-span-2 md:row-span-2';
        if (size === 'large') return 'col-span-1 row-span-2 md:col-span-2 md:row-span-2';
        return 'row-span-2'; // Normal square
    };

    return (
        <div 
            ref={cardRef}
            className={`group relative rounded-3xl overflow-hidden bg-gray-100 cursor-none ${getGridClass(project.size, project.category)} hover:scale-[1.02] transition-transform duration-500 ease-out`}
            onMouseEnter={() => setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
            onClick={() => onClick(project)}
        >
            {/* Media Content */}
            {isVisible && (
                <>
                    {/* Main Visual */}
                    {project.imageUrl && !isDriveImage ? (
                        <div className="w-full h-full relative">
                            {/* Blur Placeholder */}
                            <div className={`absolute inset-0 bg-gray-200 transition-opacity duration-700 ${imageLoaded ? 'opacity-0' : 'opacity-100'}`} />
                            <img 
                                src={project.imageUrl} 
                                alt={project.title}
                                loading="lazy"
                                decoding="async"
                                onLoad={() => setImageLoaded(true)}
                                className={`w-full h-full object-cover transition-all duration-700 ${imageLoaded ? 'opacity-100 blur-0 scale-100' : 'opacity-0 blur-xl scale-105'}`}
                            />
                        </div>
                    ) : (
                         /* Fallback Video Loop or Drive Image Iframe */
                         <SmartVideoPlayer 
                            src={project.imageUrl && isDriveImage ? `https://drive.google.com/file/d/${project.imageUrl.match(/id=([a-zA-Z0-9_-]+)/)?.[1] || ''}/preview` : (project.videoUrl || '')}
                            className="w-full h-full object-cover"
                            autoPlay={true}
                         />
                    )}

                    {/* Hover Video Preview (Only if videoUrl exists and NOT Drive Image) */}
                    {project.videoUrl && !isDriveImage && (
                        <LazyHoverPreview src={project.videoUrl} isHovered={isHovered} isParentVisible={isVisible} />
                    )}
                </>
            )}

            {/* Overlay */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-4 md:p-6">
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <span className="inline-block px-2 py-1 bg-brand-accent text-white text-[9px] md:text-[10px] font-bold uppercase tracking-wider rounded-md mb-2">
                        {project.category}
                    </span>
                    <h3 className="text-white font-bold text-sm md:text-lg leading-tight">{project.title}</h3>
                    {project.client && <p className="text-gray-300 text-xs md:text-sm mt-1">{project.client}</p>}
                </div>
            </div>

            {/* Admin Controls */}
            {isAdmin && (
                <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity z-30" onClick={e => e.stopPropagation()}>
                    <button onClick={() => onEdit(project)} className="p-2 bg-white/90 rounded-full hover:bg-white text-brand-black transition-colors shadow-sm">
                        <Edit2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                    <button onClick={() => onDelete(project.id)} className="p-2 bg-white/90 rounded-full hover:bg-red-50 text-red-500 transition-colors shadow-sm">
                        <Trash2 className="w-3 h-3 md:w-4 md:h-4" />
                    </button>
                </div>
            )}
        </div>
    );
};

export const PortfolioGallery: React.FC = () => {
  const { projects, isAdmin, addProject, updateProject, deleteProject } = useAdmin();
  const [filter, setFilter] = useState<ProjectCategory | 'ALL'>('ALL');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  
  // Viewer State
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);

  const filteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const handleEdit = (project: Project) => {
    setEditingProject(project);
    setIsModalOpen(true);
  };

  const handleDelete = async (id: string) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      await deleteProject(id);
    }
  };

  const handleSave = async (project: Project) => {
    if (editingProject) {
      await updateProject(project);
    } else {
      await addProject(project);
    }
    setIsModalOpen(false);
    setEditingProject(undefined);
  };

  const getAspectRatioClass = (size?: string) => {
      if (size === 'tall' || size === 'portrait') return 'aspect-[9/16]';
      if (size === 'wide') return 'aspect-video';
      return 'aspect-square';
  };

  return (
    <section id="work" className="py-12 md:py-24 bg-white">
      <div className="container mx-auto px-4">
        
        {/* Filters - Centered & Compact */}
        <div className="relative flex justify-center mb-12 md:mb-16">
            <div className="flex flex-wrap justify-center gap-2 bg-gray-50 p-1.5 md:p-2 rounded-full border border-gray-100 overflow-x-auto max-w-full no-scrollbar">
            <button
                onClick={() => setFilter('ALL')}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                filter === 'ALL' ? 'bg-brand-black text-white shadow-md' : 'text-gray-500 hover:text-brand-black hover:bg-gray-200'
                }`}
            >
                TOUT
            </button>
            {Object.values(ProjectCategory).map((cat) => (
                <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`px-4 py-2 rounded-full text-[10px] md:text-xs font-bold transition-all whitespace-nowrap ${
                    filter === cat ? 'bg-brand-black text-white shadow-md' : 'text-gray-500 hover:text-brand-black hover:bg-gray-200'
                }`}
                >
                {cat.toUpperCase()}
                </button>
            ))}
            </div>

             {/* Admin Add Button - Absolute Right on Desktop */}
            {isAdmin && (
                <div className="absolute right-0 top-1/2 -translate-y-1/2 hidden md:block">
                     <button 
                        onClick={() => { setEditingProject(undefined); setIsModalOpen(true); }}
                        className="flex items-center gap-2 bg-brand-accent text-white px-5 py-2.5 rounded-full text-xs font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        NOUVEAU
                    </button>
                </div>
            )}
        </div>
        
        {/* Mobile Admin Button */}
        {isAdmin && (
            <div className="md:hidden flex justify-center mb-8">
                 <button 
                    onClick={() => { setEditingProject(undefined); setIsModalOpen(true); }}
                    className="flex items-center gap-2 bg-brand-accent text-white px-6 py-3 rounded-full text-xs font-bold hover:bg-blue-700 transition-all shadow-lg active:scale-95"
                >
                    <Plus className="w-4 h-4" />
                    AJOUTER UN PROJET
                </button>
            </div>
        )}

        {/* Gallery Grid - Mobile rows are smaller (130px) */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6 auto-rows-[130px] md:auto-rows-[180px]">
          {filteredProjects.map((project) => (
            <ProjectCard 
                key={project.id} 
                project={project} 
                isAdmin={isAdmin} 
                onEdit={handleEdit} 
                onDelete={handleDelete}
                onClick={setSelectedProject}
            />
          ))}
        </div>
      </div>

      {/* Project Form Modal */}
      <ProjectFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={handleSave}
        initialData={editingProject}
      />

      {/* Project Viewer Modal (Lightbox) */}
      {selectedProject && (
        <div className="fixed inset-0 z-[60] bg-white/95 backdrop-blur-md flex items-center justify-center p-0 md:p-8 animate-fade-in overflow-y-auto">
             <button 
                onClick={() => setSelectedProject(null)}
                className="fixed top-4 right-4 md:top-8 md:right-8 p-3 bg-gray-100 hover:bg-gray-200 rounded-full text-brand-black transition-colors z-50 shadow-sm"
            >
                <X className="w-5 h-5 md:w-6 md:h-6" />
            </button>

            <div className="w-full max-w-6xl bg-white md:rounded-[2rem] shadow-2xl overflow-hidden flex flex-col md:flex-row min-h-screen md:min-h-[85vh] border border-gray-100">
                
                {/* Media Section - Takes 60% width on Desktop */}
                <div className="w-full md:w-[60%] bg-black flex items-center justify-center relative group">
                     {selectedProject.videoUrl || (selectedProject.imageUrl && selectedProject.imageUrl.includes('drive.google.com')) ? (
                        <SmartVideoPlayer 
                            src={selectedProject.videoUrl || `https://drive.google.com/file/d/${selectedProject.imageUrl!.match(/id=([a-zA-Z0-9_-]+)/)?.[1] || ''}/preview`}
                            className="w-full h-full absolute inset-0"
                            autoPlay={true}
                            controls={true}
                        />
                     ) : (
                        <img 
                            src={selectedProject.imageUrl} 
                            alt={selectedProject.title} 
                            className="w-full h-full object-contain"
                            loading="lazy"
                        />
                     )}
                </div>

                {/* Details Section - Takes 40% width */}
                <div className="w-full md:w-[40%] p-8 md:p-12 flex flex-col overflow-y-auto bg-white">
                    <div className="mb-auto">
                        <div className="flex items-center gap-3 mb-4 md:mb-6">
                            <span className="px-3 py-1 bg-blue-50 text-brand-accent text-[10px] md:text-xs font-bold uppercase tracking-wider rounded-md">
                                {selectedProject.category}
                            </span>
                            {selectedProject.client && (
                                <span className="text-gray-400 text-[10px] md:text-xs font-bold uppercase tracking-wider">
                                    Client: {selectedProject.client}
                                </span>
                            )}
                        </div>
                        
                        <h2 className="text-2xl md:text-4xl font-black text-brand-black mb-4 md:mb-6 leading-tight">
                            {selectedProject.title}
                        </h2>
                        
                        {selectedProject.description && (
                            <p className="text-sm md:text-base text-gray-500 leading-relaxed mb-8">
                                {selectedProject.description}
                            </p>
                        )}

                        {/* Metrics Grid */}
                        {selectedProject.metrics && selectedProject.metrics.length > 0 && (
                            <div className="grid grid-cols-2 gap-4 mb-8">
                                {selectedProject.metrics.map((metric, idx) => (
                                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                                        <p className="text-xl md:text-2xl font-black text-brand-black">{metric.value}</p>
                                        <p className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">{metric.label}</p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Similar Projects Suggestion */}
                    <div className="mt-8 pt-8 border-t border-gray-100">
                        <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-4">Projets Similaires</p>
                        <div className="grid grid-cols-2 gap-4">
                            {projects
                                .filter(p => p.category === selectedProject.category && p.id !== selectedProject.id)
                                .slice(0, 2)
                                .map(sim => (
                                    <div 
                                        key={sim.id} 
                                        onClick={() => setSelectedProject(sim)}
                                        className={`bg-gray-100 rounded-xl overflow-hidden cursor-pointer hover:opacity-80 transition-opacity ${getAspectRatioClass(sim.size)}`}
                                    >
                                         <div className="w-full h-full relative">
                                             <div className="absolute inset-0 bg-gray-200" />
                                             {sim.imageUrl && !sim.imageUrl.includes('drive.google.com') ? (
                                                <img src={sim.imageUrl} alt={sim.title} className="w-full h-full object-cover" loading="lazy" />
                                             ) : (
                                                <SmartVideoPlayer src={sim.videoUrl || `https://drive.google.com/file/d/${sim.imageUrl?.match(/id=([a-zA-Z0-9_-]+)/)?.[1] || ''}/preview`} className="w-full h-full object-cover" />
                                             )}
                                         </div>
                                    </div>
                                ))
                            }
                        </div>
                    </div>

                    <div className="mt-8 flex gap-4">
                        <a href="#contact" onClick={() => setSelectedProject(null)} className="flex-1 bg-brand-black text-white py-4 rounded-xl text-xs md:text-sm font-bold text-center hover:bg-brand-accent transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2">
                            Discuter du projet <ArrowRight className="w-4 h-4" />
                        </a>
                    </div>
                </div>
            </div>
        </div>
      )}
    </section>
  );
};