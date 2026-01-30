import { supabase } from '@/src/lib/supabase';
import { initDB } from '@/src/services/db';
import { sincronizarDatos } from '@/src/services/sync';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "./global.css"; // <--- IMPORTANTE: Estilos globales

// Evita que la pantalla de carga se quite automáticamente hasta que todo esté listo
SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();

  // 1. Carga de Fuentes
  const [fontsLoaded, error] = useFonts({
    'TitilliumWeb-Black': require('../assets/fonts/TitilliumWeb-Black.ttf'),
    'TitilliumWeb-Light': require('../assets/fonts/TitilliumWeb-Light.ttf'),
    'TitilliumWeb-Regular': require('../assets/fonts/TitilliumWeb-Regular.ttf'),
    'LsmVulpy': require('../assets/fonts/LsmVulpy-Regular.ttf'),
  });

  // 2. Inicialización: Base de Datos + Sincronización
  useEffect(() => {
    async function prepare() {
      try {
        console.log("♻️ Iniciando base de datos local...");
        await initDB(); // Esperamos a que la DB se cree
        setDbReady(true);
        
        // Iniciamos sincronización en segundo plano (sin await para no bloquear la UI)
        console.log("☁️ Iniciando sincronización en segundo plano...");
        sincronizarDatos(); 
      } catch (e) {
        console.warn("Error iniciando DB:", e);
      }
    }
    prepare();
  }, []);

  // 3. Autenticación (Supabase)
  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setIsSessionChecked(true);
    }).catch(() => setIsSessionChecked(true));

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 4. Protección de Rutas (Redirección)
  useEffect(() => {
    if (!isSessionChecked || !dbReady || !fontsLoaded) return;

    const inAuthGroup = segments[0] === 'auth';
    
    if (session && inAuthGroup) {
      // Usuario logueado tratando de entrar a login -> Mandar a Home
      router.replace('/(drawer)/(tabs)/home'); 
    } else if (!session && !inAuthGroup) {
      // Usuario no logueado tratando de entrar a la app -> Mandar a Login
      router.replace('/auth/login');
    }
  }, [session, segments, isSessionChecked, dbReady, fontsLoaded]);

  // 5. Ocultar Splash Screen cuando todo esté listo
  useEffect(() => {
    if (fontsLoaded && dbReady && isSessionChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady, isSessionChecked]);

  // Renderizado de carga si falta algo crítico
  if (!fontsLoaded || !isSessionChecked || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 20, color: 'gray' }}>Iniciando aplicación...</Text>
      </View>
    );
  }

  // App lista
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}