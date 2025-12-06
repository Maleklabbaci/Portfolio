
export enum ProjectCategory {
  REELS = 'Reels & TikTok',
  VIDEO = 'Vidéo 16:9',
  PHOTO = 'Photographie',
  DESIGN = 'Design',
  ADS = 'Résultats Ads'
}

export interface Project {
  id: string;
  title: string;
  category: ProjectCategory;
  imageUrl: string;
  client?: string;
  description?: string;
  metrics?: { label: string; value: string }[];
  videoUrl?: string; // Optional for playing videos/reels
  size?: 'normal' | 'tall' | 'wide' | 'large'; // For grid layout
}

export interface AdMetric {
  name: string;
  roas: number;
  spend: number;
  revenue: number;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  timestamp: number;
}
