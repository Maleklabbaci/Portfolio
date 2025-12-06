import React, { useState } from 'react';
import { Project, ProjectCategory } from '../types';
import { useAdmin } from '../context/AdminContext';
import { ProjectFormModal } from './ProjectFormModal';
import { Play, Maximize2, Instagram, TrendingUp, Edit2, Trash2, Plus, X } from 'lucide-react';

export const PortfolioGallery: React.FC = () => {
  const { projects, isAdmin, deleteProject, updateProject, addProject } = useAdmin();
  const [filter, setFilter] = useState<string>('ALL');
  
  // State for modals
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingProject, setEditingProject] = useState<Project | undefined>(undefined);
  
  // Viewer Modal State
  const [viewingProject, setViewingProject] = useState<Project | null>(null);

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

  return (
    <section id="work" className="py-10 bg-brand-dark min-h-screen relative">
      <div className="container mx-auto px-4">
        
        {/* Navigation Filters & Admin Controls */}
        <div className="sticky top-20 z-30 bg-brand-dark/95 backdrop-blur py-4 mb-8 border-b border-gray-800 flex flex-wrap items-center justify-between gap-4">
          <div className="flex overflow-x-auto gap-2 no-scrollbar">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setFilter(cat)}
                className={`whitespace-nowrap px-5 py-2 rounded-lg text-sm font-bold uppercase tracking-wider transition-all duration-300 ${
                  filter === cat
                    ? 'bg-white text-black'
                    : 'text-gray-500 hover:text-white hover:bg-white/10'
                }`}
              >
                {cat === 'ALL' ? 'Tout' : cat}
              </button>
            ))}
          </div>

          {isAdmin && (
            <button 
              onClick={handleAddNew}
              className="flex items-center gap-2 bg-brand-accent hover:bg-indigo-600 text-white px-4 py-2 rounded-lg font-bold transition-colors"
            >
              <Plus className="w-5 h-5" />
              Nouveau Projet
            </button>
          )}
        </div>

        {/* Masonry/Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 auto-rows-[300px]">
          {filteredProjects.map((project) => (
            <div
              key={project.id}
              onClick={() => handleProjectClick(project)}
              className={`group relative rounded-none overflow-hidden bg-gray-900 cursor-pointer ${getGridClass(project.size)}`}
            >
              <img
                src={project.imageUrl}
                alt={project.title}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 opacity-80 group-hover:opacity-100"
              />
              
              {/* Admin Overlay Controls */}
              {isAdmin && (
                <div className="absolute top-2 right-2 z-20 flex gap-2">
                  <button 
                    onClick={(e) => handleEditClick(project, e)}
                    className="p-2 bg-black/50 hover:bg-brand-accent rounded-full text-white backdrop-blur-sm transition-colors"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => handleDeleteClick(project.id, e)}
                    className="p-2 bg-black/50 hover:bg-red-500 rounded-full text-white backdrop-blur-sm transition-colors"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              )}

              {/* Overlay Content */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-end p-6 pointer-events-none">
                
                <div className="transform translate-y-4 group-hover:translate-y-0 transition-transform duration-300">
                  <div className="flex items-center gap-2 mb-2">
                     <span className="text-brand-accent text-xs font-bold uppercase tracking-wider bg-brand-accent/10 px-2 py-1 rounded">
                       {project.category}
                     </span>
                  </div>
                  
                  <h3 className="text-xl font-bold text-white leading-tight mb-1">{project.title}</h3>
                  <p className="text-gray-400 text-sm mb-3">{project.client}</p>

                  {/* Metrics Display */}
                  {project.metrics && (
                    <div className="flex flex-wrap gap-2 mt-2">
                      {project.metrics.map((m, idx) => (
                        <div key={idx} className="bg-white/10 border border-white/10 px-2 py-1 rounded text-xs text-white backdrop-blur-md">
                          <span className="opacity-70 mr-1">{m.label}:</span>
                          <span className="font-bold text-green-400">{m.value}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Icons based on category */}
                <div className="absolute top-4 right-4 translate-x-4 opacity-0 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300">
                   {project.category === ProjectCategory.REELS && <Instagram className="text-white w-6 h-6" />}
                   {project.category === ProjectCategory.VIDEO && <Play className="text-white w-6 h-6 fill-white" />}
                   {project.category === ProjectCategory.ADS && <TrendingUp className="text-green-400 w-6 h-6" />}
                   {(project.category === ProjectCategory.PHOTO || project.category === ProjectCategory.DESIGN) && <Maximize2 className="text-white w-6 h-6" />}
                </div>

              </div>
            </div>
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
        <div className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4" onClick={() => setViewingProject(null)}>
          <button 
            className="absolute top-4 right-4 text-white/50 hover:text-white transition-colors z-[110]"
            onClick={() => setViewingProject(null)}
          >
            <X className="w-8 h-8" />
          </button>

          <div 
            className="max-w-6xl w-full max-h-[90vh] flex flex-col md:flex-row bg-gray-900 rounded-xl overflow-hidden shadow-2xl" 
            onClick={(e) => e.stopPropagation()}
          >
            {/* Media Area */}
            <div className="flex-1 bg-black flex items-center justify-center relative min-h-[400px]">
              {(viewingProject.category === ProjectCategory.REELS || viewingProject.category === ProjectCategory.VIDEO) && viewingProject.videoUrl ? (
                <video 
                  src={viewingProject.videoUrl} 
                  controls 
                  autoPlay 
                  className={`max-h-[80vh] w-full ${viewingProject.category === ProjectCategory.REELS ? 'object-contain max-w-sm mx-auto' : 'object-contain'}`}
                />
              ) : (
                 <img 
                  src={viewingProject.imageUrl} 
                  alt={viewingProject.title} 
                  className="w-full h-full max-h-[80vh] object-contain"
                />
              )}
            </div>

            {/* Info Area */}
            <div className="w-full md:w-[350px] p-8 border-l border-gray-800 flex flex-col justify-center bg-brand-dark">
               <span className="text-brand-accent text-xs font-bold uppercase tracking-wider mb-2">
                 {viewingProject.category}
               </span>
               <h2 className="text-3xl font-bold text-white mb-2">{viewingProject.title}</h2>
               <p className="text-gray-400 mb-6">{viewingProject.client}</p>

               {viewingProject.description && (
                 <p className="text-gray-300 text-sm leading-relaxed mb-6">
                   {viewingProject.description}
                 </p>
               )}

               {viewingProject.metrics && viewingProject.metrics.length > 0 && (
                 <div className="space-y-3">
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-gray-800 pb-2">Résultats</h3>
                   {viewingProject.metrics.map((m, idx) => (
                     <div key={idx} className="flex justify-between items-center">
                       <span className="text-gray-500 text-sm">{m.label}</span>
                       <span className="text-green-400 font-bold font-mono">{m.value}</span>
                     </div>
                   ))}
                 </div>
               )}
            </div>
          </div>
        </div>
      )}
    </section>
  );
};