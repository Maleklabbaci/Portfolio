import { createClient } from '@supabase/supabase-js';

// Fonction utilitaire ultra-robuste pour récupérer les variables d'environnement
const getEnv = (key: string, defaultValue: string): string => {
  // 1. Essai via process.env (Node / Webpack / standard)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}

  // 2. Essai via import.meta.env (Vite) - note: syntaxe adaptée pour éviter erreur TS si target < ES2020
  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env[key]) {
       // @ts-ignore
       return import.meta.env[key] as string;
    }
  } catch (e) {}
  
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