import { createClient } from '@supabase/supabase-js';

// Fonction utilitaire pour récupérer les variables d'environnement en toute sécurité
const getEnv = (key: string, defaultValue: string): string => {
  try {
    // Vérification explicite de process.env pour éviter les crashs si non défini
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {
    // Ignore error
  }
  return defaultValue;
};

const DEFAULT_URL = 'https://votre-projet.supabase.co';
const DEFAULT_KEY = 'votre-cle-publique-anon';

const SUPABASE_URL = getEnv('SUPABASE_URL', DEFAULT_URL);
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', DEFAULT_KEY);

// On détecte si l'utilisateur a configuré ses clés ou si on est encore sur les valeurs par défaut
export const isSupabaseConfigured = 
  SUPABASE_URL !== DEFAULT_URL && 
  SUPABASE_ANON_KEY !== DEFAULT_KEY &&
  !SUPABASE_URL.includes('votre-projet');

// On exporte le client, mais on l'utilisera uniquement si isSupabaseConfigured est true
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);