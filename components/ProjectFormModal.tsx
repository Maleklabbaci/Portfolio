import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../types';
import { X, Save, Plus, Trash2 } from 'lucide-react';

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

  useEffect(() => {
    if (initialData) {
      setFormData(JSON.parse(JSON.stringify(initialData))); // Deep copy to avoid mutating prop
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
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(formData as Project);
    onClose();
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

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="bg-gray-900 border border-gray-700 w-full max-w-lg rounded-2xl shadow-2xl p-6 relative my-8">
        <button onClick={onClose} className="absolute top-4 right-4 text-gray-400 hover:text-white">
          <X className="w-6 h-6" />
        </button>

        <h2 className="text-2xl font-bold text-white mb-6">
          {initialData ? 'Modifier le projet' : 'Nouveau Projet'}
        </h2>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Titre</label>
            <input
              type="text"
              required
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Client</label>
                <input
                  type="text"
                  value={formData.client}
                  onChange={(e) => setFormData({ ...formData, client: e.target.value })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                />
             </div>
             <div>
                <label className="block text-sm font-medium text-gray-400 mb-1">Catégorie</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value as ProjectCategory })}
                  className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
                >
                  {Object.values(ProjectCategory).map((cat) => (
                    <option key={cat} value={cat}>{cat}</option>
                  ))}
                </select>
             </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">URL Image (Couverture)</label>
            <input
              type="url"
              required
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">URL Vidéo (Optionnel - pour lecteur)</label>
            <input
              type="url"
              value={formData.videoUrl || ''}
              onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
              placeholder="https://..."
              className="w-full bg-gray-800 border border-gray-700 rounded-lg px-4 py-2 text-white focus:border-brand-accent focus:outline-none"
            />
          </div>

           <div>
            <label className="block text-sm font-medium text-gray-400 mb-1">Taille Grille</label>
            <div className="flex gap-2">
              {['normal', 'wide', 'tall', 'large'].map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setFormData({ ...formData, size: size as any })}
                  className={`px-3 py-1 rounded text-sm border ${
                    formData.size === size 
                    ? 'bg-brand-accent border-brand-accent text-white' 
                    : 'bg-transparent border-gray-700 text-gray-400 hover:border-gray-500'
                  }`}
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Metrics Section */}
          <div className="border-t border-gray-700 pt-4 mt-4">
            <div className="flex justify-between items-center mb-2">
              <label className="block text-sm font-medium text-gray-400">Métriques / Résultats</label>
              <button 
                type="button" 
                onClick={addMetric}
                className="text-xs flex items-center gap-1 text-brand-accent hover:text-white"
              >
                <Plus className="w-3 h-3" /> Ajouter
              </button>
            </div>
            
            <div className="space-y-2">
              {formData.metrics?.map((metric, idx) => (
                <div key={idx} className="flex gap-2">
                  <input 
                    placeholder="Label (ex: Vues)"
                    value={metric.label}
                    onChange={(e) => updateMetric(idx, 'label', e.target.value)}
                    className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none"
                  />
                  <input 
                     placeholder="Valeur (ex: 1.2M)"
                     value={metric.value}
                     onChange={(e) => updateMetric(idx, 'value', e.target.value)}
                     className="flex-1 bg-gray-800 border border-gray-700 rounded px-2 py-1 text-sm text-white focus:outline-none"
                  />
                  <button 
                    type="button"
                    onClick={() => removeMetric(idx)}
                    className="p-1 text-gray-500 hover:text-red-500"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              ))}
              {(!formData.metrics || formData.metrics.length === 0) && (
                <p className="text-xs text-gray-600 italic">Aucune métrique ajoutée.</p>
              )}
            </div>
          </div>

          <button
            type="submit"
            className="w-full mt-6 bg-brand-accent hover:bg-indigo-600 text-white font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
          >
            <Save className="w-5 h-5" />
            Enregistrer
          </button>
        </form>
      </div>
    </div>
  );
};