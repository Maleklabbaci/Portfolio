import { createClient } from '@supabase/supabase-js';

// ⚠️ REMPLACEZ CES VALEURS PAR CELLES DE VOTRE DASHBOARD SUPABASE
// Allez dans Project Settings > API
const SUPABASE_URL = process.env.SUPABASE_URL || 'https://votre-projet.supabase.co';
const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || 'votre-cle-publique-anon';

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);
