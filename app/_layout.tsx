import { supabase } from '@/src/lib/supabase';
import { initDB } from '@/src/services/db';
import { sincronizarDatos } from '@/src/services/sync';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "./global.css"; 


SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [dbReady, setDbReady] = useState(false);
  const [session, setSession] = useState<any>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);
  
  const segments = useSegments();
  const router = useRouter();
  const [fontsLoaded, error] = useFonts({
    'TitilliumWeb-Black': require('../assets/fonts/TitilliumWeb-Black.ttf'),
    'TitilliumWeb-Light': require('../assets/fonts/TitilliumWeb-Light.ttf'),
    'TitilliumWeb-Regular': require('../assets/fonts/TitilliumWeb-Regular.ttf'),
    'LsmVulpy': require('../assets/fonts/LsmVulpy-Regular.ttf'),
  });

  useEffect(() => {
    async function prepare() {
      try {
        console.log("Iniciando base de datos local...");
        await initDB();
        setDbReady(true);

        console.log("Iniciando sincronización en segundo plano...");
        sincronizarDatos(); 
      } catch (e) {
        console.warn("Error iniciando DB:", e);
      }
    }
    prepare();
  }, []);

  //  Autenticación (Supabase)
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

  // Protección de Rutas (Redirección)
  useEffect(() => {
    if (!isSessionChecked || !dbReady || !fontsLoaded) return;

    const inAuthGroup = segments[0] === 'auth';
  //login   
    if (session && inAuthGroup) {
      router.replace('/(drawer)/(tabs)/home'); 
    } else if (!session && !inAuthGroup) {
      router.replace('/auth/login');
    }
  }, [session, segments, isSessionChecked, dbReady, fontsLoaded]);

  useEffect(() => {
    if (fontsLoaded && dbReady && isSessionChecked) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, dbReady, isSessionChecked]);

  if (!fontsLoaded || !isSessionChecked || !dbReady) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="#2563EB" />
        <Text style={{ marginTop: 20, color: 'gray' }}>Iniciando aplicación...</Text>
      </View>
    );
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}