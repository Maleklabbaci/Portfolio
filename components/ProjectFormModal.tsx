
import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../types';
import { processGoogleDriveLink } from '../context/AdminContext';
import { X, Save, Plus, Trash2, LayoutGrid, RectangleVertical, RectangleHorizontal, Square, Loader2, Image as ImageIcon, Video } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => Promise<void>;
  initialData?: Project;
}

export const ProjectFormModal: React.FC<ProjectFormModalProps> = ({ isOpen, onClose, onSave, initialData }) => {
  const [formData, setFormData] = useState<Partial<Project>>({
    title: '',
    client: '',
    imageUrl: '',
    videoUrl: '',
    category: ProjectCategory.VIDEO,
    size: 'normal',
    metrics: []
  });

  const [isSaving, setIsSaving] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{type: 'image' | 'video' | null, url: string | null}>({ type: null, url: null });
  const [isMediaLoading, setIsMediaLoading] = useState(false);

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        setFormData(JSON.parse(JSON.stringify(initialData)));
      } else {
        setFormData({
          id: Date.now().toString(),
          title: '',
          client: '',
          imageUrl: '',
          videoUrl: '',
          category: ProjectCategory.VIDEO,
          size: 'normal',
          metrics: []
        });
      }
      setIsSaving(false);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [initialData, isOpen]);

  // Update preview when URLs change
  useEffect(() => {
    const img = processGoogleDriveLink(formData.imageUrl) || formData.imageUrl;
    const vid = processGoogleDriveLink(formData.videoUrl) || formData.videoUrl;

    if (img) {
      setPreviewMedia({ type: 'image', url: img });
      setIsMediaLoading(true);
    } else if (vid) {
      setPreviewMedia({ type: 'video', url: vid });
      setIsMediaLoading(true); // Video loading is trickier, but we can assume logic
    } else {
      setPreviewMedia({ type: null, url: null });
      setIsMediaLoading(false);
    }
  }, [formData.imageUrl, formData.videoUrl]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl && !formData.videoUrl) {
      alert("⚠️ Attention : Vous devez ajouter au moins une Image OU une Vidéo.");
      return;
    }

    setIsSaving(true);
    try {
      await onSave(formData as Project);
      onClose();
    } catch (e) {
      // Error is handled in context, but we stop loading here
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  const addMetric = () => {
    const newMetrics = [...(formData.metrics || []), { label: '', value: '' }];
    setFormData({ ...formData, metrics: newMetrics });
  };

  const removeMetric = (index: number) => {
    const newMetrics = [...(formData.metrics || [])];
    newMetrics.splice(index, 1);
    setFormData({ ...formData, metrics: newMetrics });
  };

  const updateMetric = (index: number, field: 'label' | 'value', text: string) => {
    const newMetrics = [...(formData.metrics || [])];
    newMetrics[index] = { ...newMetrics[index], [field]: text };
    setFormData({ ...formData, metrics: newMetrics });
  };

  const sizeOptions = [
    { id: 'normal', label: 'Carré', icon: Square, class: 'aspect-square' },
    { id: 'tall', label: 'Vertical', icon: RectangleVertical, class: 'aspect-[9/16]' },
    { id: 'wide', label: 'Horizontal', icon: RectangleHorizontal, class: 'aspect-video' },
    { id: 'large', label: 'Large', icon: LayoutGrid, class: 'aspect-square' },
  ];

  return (
    <div 
      className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-brand-light/90 backdrop-blur-sm overflow-y-auto"
      onClick={handleBackdropClick}
    >
      <div 
        className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl p-8 relative my-8 animate-fade-in border border-gray-100"
        onClick={(e) => e.stopPropagation()}
      >
        <button 
          onClick={onClose} 
          disabled={isSaving}
          className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-brand-black transition-all active:scale-95 z-10 disabled:opacity-50"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black text-brand-black mb-8 tracking-tight">
          {initialData ? 'Modifier' : 'Nouveau projet'}
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Left Column: Form */}
          <div className="md:col-span-2 space-y-8">
             <form id="project-form" onSubmit={handleSubmit} className="space-y-6">
                
                {/* Main Info */}
                <div className="space-y-4">
                  <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Titre</label>
                      <input
                        type="text"
                        required
                        value={formData.title || ''}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-brand-black font-bold focus:ring-2 focus:ring-brand-accent transition-all"
                        placeholder="Titre du projet"
                      />
                  </div>
                </div>

                {/* URLs */}
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-accent mb-2 flex items-center gap-2">
                      <ImageIcon className="w-4 h-4" /> Image URL
                    </label>
                    <input
                      type="url"
                      value={formData.imageUrl || ''}
                      onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                      placeholder="Lien direct ou Google Drive"
                      className="w-full bg-blue-50/30 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-brand-accent mb-2 flex items-center gap-2">
                      <Video className="w-4 h-4" /> Vidéo URL
                    </label>
                    <input
                      type="url"
                      value={formData.videoUrl || ''}
                      onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                      placeholder="Lien direct ou Google Drive"
                      className="w-full bg-blue-50/30 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent"
                    />
                  </div>
                </div>

                {/* Category & Size */}
                <div className="grid grid-cols-2 gap-4">
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Catégorie</label>
                      <select 
                        value={formData.category} 
                        onChange={(e) => setFormData({...formData, category: e.target.value as any})}
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold"
                      >
                        {Object.values(ProjectCategory).map(cat => (
                          <option key={cat} value={cat}>{cat}</option>
                        ))}
                      </select>
                   </div>
                   <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Format</label>
                      <select 
                        value={formData.size} 
                        onChange={(e) => setFormData({...formData, size: e.target.value as any})}
                        className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm font-bold"
                      >
                        {sizeOptions.map(opt => (
                          <option key={opt.id} value={opt.id}>{opt.label}</option>
                        ))}
                      </select>
                   </div>
                </div>

             </form>
          </div>

          {/* Right Column: Preview & Save */}
          <div className="md:col-span-1 flex flex-col gap-4">
             {/* Media Preview Card */}
             <div className="bg-gray-100 rounded-2xl aspect-[9/16] md:aspect-square overflow-hidden relative shadow-inner flex items-center justify-center border border-gray-200">
                {previewMedia.url ? (
                  <>
                    {isMediaLoading && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10">
                        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                      </div>
                    )}
                    {previewMedia.type === 'image' ? (
                       <img 
                        src={previewMedia.url} 
                        alt="Preview" 
                        onLoad={() => setIsMediaLoading(false)}
                        onError={() => setIsMediaLoading(false)}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <video 
                        src={previewMedia.url} 
                        muted 
                        loop 
                        autoPlay
                        playsInline
                        onLoadedData={() => setIsMediaLoading(false)}
                        className="w-full h-full object-cover"
                      />
                    )}
                  </>
                ) : (
                  <div className="text-center p-4">
                    <div className="w-12 h-12 bg-white rounded-full flex items-center justify-center mx-auto mb-2 text-gray-300">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <p className="text-xs text-gray-400 font-medium">Aperçu du média</p>
                  </div>
                )}
             </div>
             
             <button
                type="submit"
                form="project-form"
                disabled={isSaving}
                className="w-full bg-brand-black hover:bg-brand-accent text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed mt-auto"
              >
                {isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    Enregistrer
                  </>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};
