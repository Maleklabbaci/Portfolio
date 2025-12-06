import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../types';
import { X, Save, Plus, Trash2, LayoutGrid, RectangleVertical, RectangleHorizontal, Square } from 'lucide-react';

interface ProjectFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (project: Project) => void;
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

  // Reset form when modal opens or initialData changes
  useEffect(() => {
    if (isOpen) {
      if (initialData) {
        // Deep copy to avoid mutating reference before save
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
      // Lock scroll when modal is open
      document.body.style.overflow = 'hidden';
    } else {
      // Restore scroll when closed
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Project);
    onClose();
  };

  // Handle click on the backdrop to close
  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
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
        onClick={(e) => e.stopPropagation()} // Stop propagation to prevent closing
      >
        <button 
          onClick={onClose} 
          className="absolute top-6 right-6 p-2 bg-gray-50 hover:bg-gray-100 rounded-full text-gray-400 hover:text-brand-black transition-all active:scale-95 z-10"
        >
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-3xl font-black text-brand-black mb-8 tracking-tight">
          {initialData ? 'Modifier le projet' : 'Nouveau projet'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-8">
          
          {/* Main Info */}
          <div className="space-y-4">
             <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Titre du projet</label>
                <input
                  type="text"
                  required
                  value={formData.title || ''}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  placeholder="Ex: Campagne Nike Summer"
                  className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-brand-black font-bold text-lg placeholder-gray-300 focus:ring-2 focus:ring-brand-accent transition-all"
                />
             </div>
             <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Client</label>
                <input
                  type="text"
                  value={formData.client || ''}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  placeholder="Ex: Nike"
                  className="w-full bg-gray-50 border-0 rounded-2xl px-5 py-4 text-brand-black font-medium focus:ring-2 focus:ring-brand-accent transition-all"
                />
             </div>
          </div>

          {/* Visual Category Selector */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Catégorie</label>
            <div className="flex flex-wrap gap-2">
              {Object.values(ProjectCategory).map((cat) => (
                <button
                  key={cat}
                  type="button"
                  onClick={() => setFormData({ ...formData, category: cat })}
                  className={`px-5 py-3 rounded-xl text-sm font-bold transition-all active:scale-95 border ${
                    formData.category === cat
                      ? 'bg-brand-black text-white border-brand-black shadow-lg shadow-gray-200'
                      : 'bg-white text-gray-500 border-gray-200 hover:border-gray-300'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          {/* Visual Size Selector */}
           <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-3">Format Grille</label>
            <div className="grid grid-cols-4 gap-4">
              {sizeOptions.map((opt) => {
                const Icon = opt.icon;
                const isSelected = formData.size === opt.id;
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setFormData({ ...formData, size: opt.id as any })}
                    className={`flex flex-col items-center gap-3 p-4 rounded-2xl border-2 transition-all active:scale-95 ${
                      isSelected 
                      ? 'border-brand-accent bg-blue-50/50' 
                      : 'border-gray-100 bg-white hover:border-gray-200'
                    }`}
                  >
                    <div className={`w-12 h-12 bg-white rounded-lg shadow-sm border border-gray-100 flex items-center justify-center ${isSelected ? 'text-brand-accent' : 'text-gray-400'}`}>
                        <Icon className="w-6 h-6" />
                    </div>
                    <span className={`text-xs font-bold ${isSelected ? 'text-brand-accent' : 'text-gray-400'}`}>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* URLs */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Image URL</label>
              <input
                type="url"
                required
                value={formData.imageUrl || ''}
                onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent"
              />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400 mb-2">Vidéo URL</label>
              <input
                type="url"
                value={formData.videoUrl || ''}
                onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                placeholder="https://..."
                className="w-full bg-gray-50 border-0 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-brand-accent"
              />
            </div>
          </div>

          {/* Metrics */}
          <div className="bg-gray-50 p-6 rounded-2xl border border-gray-100">
            <div className="flex justify-between items-center mb-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-gray-400">Résultats Clés</label>
              <button 
                type="button" 
                onClick={addMetric}
                className="px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-xs font-bold text-brand-black flex items-center gap-2 hover:bg-gray-50 active:scale-95 transition-all"
              >
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>
            
            <div className="space-y-3">
              {formData.metrics?.map((metric, idx) => (
                <div key={idx} className="flex gap-2 items-center animate-fade-in">
                  <input 
                    placeholder="Label (ex: ROAS)"
                    value={metric.label || ''}
                    onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                    className="flex-1 bg-white border-0 shadow-sm rounded-xl px-4 py-3 text-sm font-medium focus:ring-2 focus:ring-brand-accent"
                  />
                  <input 
                     placeholder="Valeur (ex: 4x)"
                     value={metric.value || ''}
                     onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                     className="flex-1 bg-white border-0 shadow-sm rounded-xl px-4 py-3 text-sm font-bold text-brand-accent focus:ring-2 focus:ring-brand-accent"
                  />
                  <button 
                    type="button"
                    onClick={() => removeMetric(idx)}
                    className="p-3 bg-white hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-xl shadow-sm transition-colors active:scale-95"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!formData.metrics || formData.metrics.length === 0) && (
                <div className="text-center py-4 border-2 border-dashed border-gray-200 rounded-xl">
                   <p className="text-xs text-gray-400 font-medium">Ajoutez des KPIs pour prouver la performance.</p>
                </div>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full bg-brand-black hover:bg-brand-accent text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl active:scale-95"
          >
            <Save className="w-5 h-5" />
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};