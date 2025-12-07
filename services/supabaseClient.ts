import { createClient } from '@supabase/supabase-js';

// ------------------------------------------------------------------
// CONFIGURATION SUPABASE
// ------------------------------------------------------------------
// Les clés ont été intégrées directement suite à votre demande.
// ------------------------------------------------------------------

const MANUALLY_ENTERED_URL = 'https://rzklodzcuxfetbhstnbg.supabase.co'; 
const MANUALLY_ENTERED_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJ6a2xvZHpjdXhmZXRiaHN0bmJnIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjUwMjE2MjUsImV4cCI6MjA4MDU5NzYyNX0.xhDnlz0164Q60Uf4djT6e5BRGrng4e3Wdq_lQh9W6fs';

// Fonction utilitaire pour récupérer les variables (Process, Vite ou Manuel)
const getEnv = (key: string, manualValue: string): string => {
  // Priorité 1 : Valeur entrée manuellement dans ce fichier
  if (manualValue && !manualValue.includes('REMPLACER_PAR_VOTRE')) {
    return manualValue;
  }
  
  // Priorité 2 : Variables d'environnement (Vercel, Netlify, .env)
  try {
    if (typeof process !== 'undefined' && process.env && process.env[key]) {
      return process.env[key] as string;
    }
  } catch (e) {}

  try {
    // @ts-ignore
    if (import.meta && import.meta.env && import.meta.env[key]) {
       // @ts-ignore
       return import.meta.env[key] as string;
    }
  } catch (e) {}
  
  return '';
};

const SUPABASE_URL = getEnv('SUPABASE_URL', MANUALLY_ENTERED_URL);
const SUPABASE_ANON_KEY = getEnv('SUPABASE_ANON_KEY', MANUALLY_ENTERED_KEY);

// Vérification de la configuration
export const isSupabaseConfigured = 
  SUPABASE_URL !== '' && 
  SUPABASE_ANON_KEY !== '' &&
  !SUPABASE_URL.includes('REMPLACER') &&
  !SUPABASE_URL.includes('votre-projet');

// Création du client
export const supabase = createClient(
  isSupabaseConfigured ? SUPABASE_URL : 'https://placeholder.supabase.co',
  isSupabaseConfigured ? SUPABASE_ANON_KEY : 'placeholder-key'
);