// utils/supabase.js
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import 'react-native-url-polyfill/auto';

// Remplace par tes propres URL et clé API publique (trouvées dans Supabase Dashboard > Settings > API)
const supabaseUrl = 'https://mvasonttzgeonfserhoa.supabase.co'; // Exemple : https://xyz.supabase.co
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im12YXNvbnR0emdlb25mc2VyaG9hIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTE1MzkwNzQsImV4cCI6MjA2NzExNTA3NH0.aOMiVF6pWAMBcmxNyNzk2fUMZxnTqyin_TydSOMhfGo'; // Clé publique "anon"

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    storage: AsyncStorage, // Stockage des sessions pour React Native
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false, // Pas nécessaire pour React Native
  },
});