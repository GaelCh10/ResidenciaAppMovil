
import AsyncStorage from '@react-native-async-storage/async-storage';
import { createClient } from '@supabase/supabase-js';
import { Platform } from 'react-native';
import 'react-native-url-polyfill/auto';
// RECUERDA: Reemplaza esto con tus credenciales reales de Supabase
const SUPABASE_URL = 'https://mqloxtnhyefawnoiwpeu.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1xbG94dG5oeWVmYXdub2l3cGV1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgxOTk2NDcsImV4cCI6MjA4Mzc3NTY0N30.9wQiiysydKPjrjliNDChkGlXpOEKpSlgOfKU0VjvVfU';

// --- SOLUCIÓN AL ERROR DE WINDOW ---
// Creamos un adaptador personalizado que verifica el entorno
const ExpoStorageAdapter = {
  getItem: (key: string) => {
    // Si estamos en el servidor o web sin window, no hacemos nada
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve(null);
    }
    return AsyncStorage.getItem(key);
  },
  setItem: (key: string, value: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.setItem(key, value);
  },
  removeItem: (key: string) => {
    if (Platform.OS === 'web' && typeof window === 'undefined') {
      return Promise.resolve();
    }
    return AsyncStorage.removeItem(key);
  },
};

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    // Usamos nuestro adaptador seguro en lugar de AsyncStorage directo
    storage: ExpoStorageAdapter,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});