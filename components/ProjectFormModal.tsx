

import React, { useState, useEffect } from 'react';
import { Project, ProjectCategory } from '../types';
import { processGoogleDriveLink } from '../context/AdminContext';
import { X, Save, LayoutGrid, RectangleVertical, RectangleHorizontal, Square, Loader2, Image as ImageIcon, Video, AlertCircle, CheckCircle2, Ratio } from 'lucide-react';

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
  const [isValidating, setIsValidating] = useState(false);
  const [previewMedia, setPreviewMedia] = useState<{type: 'image' | 'video' | null, url: string | null}>({ type: null, url: null });
  const [isMediaLoading, setIsMediaLoading] = useState(false);
  const [mediaError, setMediaError] = useState<string | null>(null);

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
      setIsValidating(false);
      setMediaError(null);
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [initialData, isOpen]);

  // Debounced Preview Update
  useEffect(() => {
    setMediaError(null);
    
    // Clear current preview immediately to avoid stale data
    setPreviewMedia({ type: null, url: null });
    
    // Add small delay to avoid rapid updates while typing
    const timer = setTimeout(() => {
        const img = processGoogleDriveLink(formData.imageUrl) || formData.imageUrl;
        const vid = processGoogleDriveLink(formData.videoUrl) || formData.videoUrl;

        if (img) {
          setPreviewMedia({ type: 'image', url: img });
          setIsMediaLoading(true);
        } else if (vid) {
          setPreviewMedia({ type: 'video', url: vid });
          setIsMediaLoading(true); 
        } else {
          setPreviewMedia({ type: null, url: null });
          setIsMediaLoading(false);
        }
    }, 500);

    return () => clearTimeout(timer);
  }, [formData.imageUrl, formData.videoUrl]);

  if (!isOpen) return null;

  // --- VALIDATION LOGIC ---
  const validateMediaLink = async (url: string, type: 'image' | 'video'): Promise<boolean> => {
    if (!url) return true; // Empty is fine

    // 1. Check Google Drive Format (Enhanced regex to handle processed links)
    if (url.includes('drive.google.com')) {
       const driveMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.google\.com\/uc\?.*id=)([a-zA-Z0-9_-]+)/);
       return !!driveMatch;
    }

    // 2. Check YouTube Format
    if (url.includes('youtube.com') || url.includes('youtu.be')) {
       const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
       return !!ytMatch;
    }

    // 3. Direct Image Validation with Timeout
    if (type === 'image') {
      return new Promise((resolve) => {
        const img = new Image();
        const timer = setTimeout(() => { img.src = ""; resolve(false); }, 5000);
        img.onload = () => { clearTimeout(timer); resolve(true); };
        img.onerror = () => { clearTimeout(timer); resolve(false); };
        img.src = url;
      });
    }

    return true;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.imageUrl && !formData.videoUrl) {
      alert("⚠️ Attention : Vous devez ajouter au moins une Image OU une Vidéo.");
      return;
    }
    
    setIsValidating(true);
    
    const imgUrlToTest = formData.imageUrl ? (processGoogleDriveLink(formData.imageUrl) || formData.imageUrl) : null;
    const vidUrlToTest = formData.videoUrl ? (processGoogleDriveLink(formData.videoUrl) || formData.videoUrl) : null;

    const [validImg, validVid] = await Promise.all([
        imgUrlToTest ? validateMediaLink(imgUrlToTest, 'image') : Promise.resolve(true),
        vidUrlToTest ? validateMediaLink(vidUrlToTest, 'video') : Promise.resolve(true)
    ]);

    let errorMessage = null;
    // We are more lenient with Google Drive images now, as we treat them as iframes
    const isDriveImage = imgUrlToTest && imgUrlToTest.includes('drive.google.com');
    if (!validImg && !isDriveImage) errorMessage = "L'URL de l'image semble invalide, inaccessible ou privée.";
    else if (!validVid) errorMessage = "Le format du lien vidéo (Drive/YouTube) semble incorrect.";

    setIsValidating(false);

    if (errorMessage) {
      setMediaError(errorMessage);
      if(!confirm(`${errorMessage}\n\nVoulez-vous quand même forcer l'enregistrement ?`)) {
        return;
      }
    }

    setIsSaving(true);
    try {
      await onSave(formData as Project);
      onClose();
    } catch (e) {
      setIsSaving(false);
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget && !isSaving) {
      onClose();
    }
  };

  const handleMediaError = () => {
    setIsMediaLoading(false);
    const isIframe = previewMedia.url && (previewMedia.url.includes('drive.google.com') || previewMedia.url.includes('youtube') || previewMedia.url.includes('youtu.be'));
    if (!isIframe) {
      setMediaError("Impossible de charger le média. Vérifiez le lien (accès public requis).");
    }
  };

  const sizeOptions = [
    { id: 'normal', label: 'Carré (1:1)', icon: Square, class: 'aspect-square' },
    { id: 'tall', label: 'Vertical (9:16)', icon: RectangleVertical, class: 'aspect-[9/16]' },
    { id: 'portrait', label: 'Portrait (3:4)', icon: Ratio, class: 'aspect-[3/4]' },
    { id: 'wide', label: 'Horizontal (16:9)', icon: RectangleHorizontal, class: 'aspect-video' },
    { id: 'large', label: 'Large (2x2)', icon: LayoutGrid, class: 'aspect-square' },
  ];

  const getEmbedUrl = (url: string) => {
    const driveMatch = url.match(/(?:drive\.google\.com\/(?:file\/d\/|open\?id=)|drive\.google\.com\/uc\?.*id=)([a-zA-Z0-9_-]+)/);
    if (driveMatch) return `https://drive.google.com/file/d/${driveMatch[1]}/preview`;
    
    const ytMatch = url.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/);
    if (ytMatch) return `https://www.youtube.com/embed/${ytMatch[1]}?autoplay=1&mute=1&loop=1`;
    
    return null;
  };

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
                    {isMediaLoading && !mediaError && (
                      <div className="absolute inset-0 flex items-center justify-center bg-gray-100 z-10 transition-opacity duration-300">
                        <Loader2 className="w-8 h-8 text-brand-accent animate-spin" />
                      </div>
                    )}
                    
                    {mediaError ? (
                      <div className="text-center p-4 text-red-500 animate-fade-in px-6">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p className="text-xs font-bold leading-tight">{mediaError}</p>
                      </div>
                    ) : (
                      // SMART PREVIEW LOGIC: Check for Embeddable FIRST (Images OR Videos)
                      getEmbedUrl(previewMedia.url) ? (
                        <iframe
                          src={getEmbedUrl(previewMedia.url)!}
                          className="w-full h-full border-0"
                          onLoad={() => setIsMediaLoading(false)}
                          title="Preview"
                        />
                      ) : previewMedia.type === 'image' ? (
                       <img 
                        src={previewMedia.url} 
                        alt="Preview" 
                        onLoad={() => setIsMediaLoading(false)}
                        onError={handleMediaError}
                        className={`w-full h-full object-cover transition-all duration-500 ${isMediaLoading ? 'opacity-0 scale-105 blur-sm' : 'opacity-100 scale-100 blur-0'}`}
                      />
                    ) : (
                        <video 
                          src={previewMedia.url} 
                          muted 
                          loop 
                          autoPlay
                          playsInline
                          onLoadedData={() => setIsMediaLoading(false)}
                          onError={handleMediaError}
                          className="w-full h-full object-cover"
                        />
                      )
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
                disabled={isSaving || isValidating}
                className={`w-full text-white font-black text-lg py-5 rounded-2xl flex items-center justify-center gap-3 transition-all shadow-xl hover:shadow-2xl active:scale-95 disabled:opacity-80 disabled:cursor-not-allowed mt-auto ${
                  mediaError && !isSaving && !isValidating ? 'bg-red-500 hover:bg-red-600' : 'bg-brand-black hover:bg-brand-accent'
                }`}
              >
                {isValidating ? (
                   <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Vérification...
                  </>
                ) : isSaving ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sauvegarde...
                  </>
                ) : (
                  <>
                    <Save className="w-5 h-5" />
                    {mediaError ? 'Forcer' : 'Enregistrer'}
                  </>
                )}
              </button>
          </div>
        </div>
      </div>
    </div>
  );
};