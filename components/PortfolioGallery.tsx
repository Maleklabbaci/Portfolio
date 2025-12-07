import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../types';
import { useAdmin } from '../context/AdminContext';
import { ProjectFormModal } from './ProjectFormModal';
import { Play, Maximize2, Instagram, TrendingUp, Edit2, Trash2, Plus, X, ArrowRight } from 'lucide-react';

export const PortfolioGallery: React.FC = () => {
  const { projects, isAdmin, deleteProject, updateProject, addProject } = useAdmin();
  const [filter, setFilter] = useState<string>('ALL');
  
  // State for modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  
  // Viewer Modal State
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

  // Manage body scroll when viewer is open
  useEffect(() => {
    if (viewingProject) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    return () => { document.body.style.overflow = 'unset'; };
  }, [viewingProject]);

  const filteredProjects = filter === 'ALL' 
    ? projects 
    : projects.filter(p => p.category === filter);

  const categories = ['ALL', ...Object.values(ProjectCategory)];

  // Helper to determine grid classes based on size
  const getGridClass = (size?: string) => {
    switch(size) {
      case 'tall': return 'row-span-2 col-span-1'; // Portrait / Reels
      case 'wide': return 'col-span-1 md:col-span-2 row-span-1'; // Landscape Video
      case 'large': return 'col-span-2 row-span-2'; // Featured
      default: return 'col-span-1 row-span-1'; // Square / Standard
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

  const handleSaveProject = (project: Project) => {
    if (editingProject) {
      updateProject(project);
    } else {
      addProject({ ...project, id: Date.now().toString() });
    }
  };

  const handleMouseEnter = async (e: React.MouseEvent<HTMLDivElement>, hasVideo: boolean) => {
    if (hasVideo) {
      const video = e.currentTarget.querySelector('video');
      if (video) {
        try {
          // If video previously errored, don't try to play
          if (video.error) return;

          video.currentTime = 0;
          await video.play();
        } catch (err) {
          // Ignore AbortError which happens when mouse leaves quickly
          // Also ignore NotSupportedError which happens if source is missing/bad
          const errorName = (err as Error).name;
          if (errorName !== 'AbortError' && errorName !== 'NotSupportedError') {
            console.warn("Video preview playback prevented:", errorName);
          }
        }
      }
    }
  };

  const handleMouseLeave = (e: React.MouseEvent<HTMLDivElement>, hasVideo: boolean) => {
    if (hasVideo) {
      const video = e.currentTarget.querySelector('video');
      if (video) {
        try {
          video.pause();
        } catch (e) {
          // Ignore pause errors
        }
      }
    }
  };

  // Find similar projects for the viewer
  const similarProjects = viewingProject 
    ? projects
        .filter(p => p.category === viewingProject.category && p.id !== viewingProject.id)
        .slice(0, 2) 
    : [];

  return (
    <section id="work" className="py-24 bg-brand-light min-h-screen relative">
      <div className="container mx-auto px-4">
        
        {/* Navigation Filters & Admin Controls - Centered Layout */}
        <div className="sticky top-24 z-30 mb-16">
          <div className="relative flex justify-center items-center">
            {/* Filters Centered */}
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

            {/* Admin Button - Absolute Right on Desktop, Stacked on Mobile */}
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
          
          {/* Mobile Admin Button */}
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

        {/* Masonry/Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 auto-rows-[350px]">
          {filteredProjects.map((project) => {
            const isVideoProject = (project.category === ProjectCategory.REELS || project.category === ProjectCategory.VIDEO) && !!project.videoUrl;

            return (
              <div
                key={project.id}
                onClick={() => handleProjectClick(project)}
                onMouseEnter={(e) => handleMouseEnter(e, isVideoProject)}
                onMouseLeave={(e) => handleMouseLeave(e, isVideoProject)}
                className={`group relative rounded-3xl overflow-hidden bg-white shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 cursor-pointer transition-all duration-500 active:scale-[0.98] ${getGridClass(project.size)}`}
              >
                {/* Background Image */}
                <img
                  src={project.imageUrl}
                  alt={project.title}
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110 z-0 relative"
                />

                {/* Video Preview Layer (Lazy loaded) */}
                {isVideoProject && (
                  <video
                    src={project.videoUrl}
                    muted
                    loop
                    playsInline
                    preload="none"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                    }}
                    className="absolute inset-0 w-full h-full object-cover opacity-0 group-hover:opacity-100 transition-opacity duration-500 z-10 pointer-events-none"
                  />
                )}
                
                {/* Admin Overlay Controls (Highest Z-index) */}
                {isAdmin && (
                  <div className="absolute top-3 right-3 z-40 flex gap-2">
                    <button 
                      onClick={(e) => handleEditClick(project, e)}
                      className="p-3 bg-white/90 hover:bg-brand-accent rounded-full text-brand-black hover:text-white backdrop-blur-sm transition-colors shadow-lg active:scale-90"
                      title="Modifier"
                    >
                      <Edit2 className="w-4 h-4" />
                    </button>
                    <button 
                      onClick={(e) => handleDeleteClick(project.id, e)}
                      className="p-3 bg-white/90 hover:bg-red-500 rounded-full text-brand-black hover:text-white backdrop-blur-sm transition-colors shadow-lg active:scale-90"
                      title="Supprimer"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                )}

                {/* Content Overlay (High Z-index) */}
                <div className="absolute inset-0 z-20 bg-gradient-to-t from-brand-black/90 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-8 pointer-events-none">
                  
                  <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                    <div className="flex items-center gap-2 mb-3">
                       <span className="text-white text-[10px] font-bold uppercase tracking-wider bg-brand-accent px-3 py-1 rounded-full shadow-lg">
                         {project.category}
                       </span>
                    </div>
                    
                    <h3 className="text-2xl font-black text-white leading-tight mb-1 drop-shadow-md">{project.title}</h3>
                    <p className="text-gray-300 font-medium text-sm mb-4 drop-shadow-sm">{project.client}</p>

                    {/* Metrics Display */}
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

                  {/* Icons based on category */}
                  <div className="absolute top-6 left-6 opacity-0 group-hover:opacity-100 transition-all duration-300 transform -translate-y-4 group-hover:translate-y-0">
                     <div className="w-12 h-12 bg-white/10 backdrop-blur-md border border-white/20 rounded-full flex items-center justify-center">
                       {project.category === ProjectCategory.REELS && <Instagram className="text-white w-6 h-6" />}
                       {project.category === ProjectCategory.VIDEO && <Play className="text-white w-6 h-6 fill-white" />}
                       {project.category === ProjectCategory.ADS && <TrendingUp className="text-white w-6 h-6" />}
                       {(project.category === ProjectCategory.PHOTO || project.category === ProjectCategory.DESIGN) && <Maximize2 className="text-white w-6 h-6" />}
                     </div>
                  </div>

                </div>
              </div>
            );
          })}
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
              {(viewingProject.category === ProjectCategory.REELS || viewingProject.category === ProjectCategory.VIDEO) && viewingProject.videoUrl ? (
                <video 
                  src={viewingProject.videoUrl} 
                  controls 
                  autoPlay 
                  className={`max-h-[85vh] w-full ${viewingProject.category === ProjectCategory.REELS ? 'object-contain max-w-sm mx-auto' : 'object-contain'}`}
                />
              ) : (
                 <img 
                  src={viewingProject.imageUrl} 
                  alt={viewingProject.title} 
                  loading="lazy"
                  decoding="async"
                  className="w-full h-full max-h-[85vh] object-contain"
                />
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
                     <div className="grid grid-cols-2 gap-3">
                       {similarProjects.map((simProject) => (
                         <div 
                           key={simProject.id} 
                           onClick={() => setViewingProject(simProject)}
                           className="group cursor-pointer"
                         >
                           <div className="aspect-[4/3] rounded-xl overflow-hidden mb-2 relative bg-gray-100">
                             <img 
                               src={simProject.imageUrl} 
                               alt={simProject.title}
                               loading="lazy"
                               decoding="async"
                               className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                             />
                             <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors" />
                           </div>
                           <h4 className="text-sm font-bold text-brand-black leading-tight group-hover:text-brand-accent transition-colors">
                             {simProject.title}
                           </h4>
                         </div>
                       ))}
                     </div>
                   </div>
                 )}
               </div>
               
               <div className="mt-8 pt-6 border-t border-gray-100">
                  <a href="#contact" onClick={() => setViewingProject(null)} className="flex items-center justify-center w-full bg-brand-black text-white font-bold py-4 rounded-xl hover:bg-brand-accent transition-all group">
                    <span>Démarrer un projet</span>
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
               </div>
            </div>
          </div>
        </div>
      )}
    </section>
  );
};