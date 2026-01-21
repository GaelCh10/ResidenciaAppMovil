import { supabase } from '@/src/lib/supabase';
import { initDB } from '@/src/services/db';
import { sincronizarDatos } from '@/src/services/sync';
import { useFonts } from 'expo-font';
import { Slot, SplashScreen, useRouter, useSegments } from 'expo-router';
import { useEffect, useState } from 'react';
import { ActivityIndicator, Text, View } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import "./global.css";

// Evita que la pantalla de carga se quite automáticamente
SplashScreen.preventAutoHideAsync();

console.log("[Global] _layout.tsx ha sido cargado en memoria.");

const RootLayout = () => {
  console.log("🔄 [Render] RootLayout iniciándose...");




  // 1. Carga de Fuentes
  const [fontsLoaded, error] = useFonts({
    'TitilliumWeb-Black': require('../assets/fonts/TitilliumWeb-Black.ttf'),
    'TitilliumWeb-Light': require('../assets/fonts/TitilliumWeb-Light.ttf'),
    'TitilliumWeb-Regular': require('../assets/fonts/TitilliumWeb-Regular.ttf'),
    'LsmVulpy': require('../assets/fonts/LsmVulpy-Regular.ttf'),
  });



  // 1. Inicialización de Base de Datos OFFLINE y Sincronización
  useEffect(() => {
    const prepararApp = async () => {
      await initDB(); // 1. Crea tablas locales
      sincronizarDatos(); // 2. Intenta bajar datos nuevos de internet
    };
    prepararApp();
  }, []);


  // 2. Estado de Sesión
  const [session, setSession] = useState<any>(null);
  const [isSessionChecked, setIsSessionChecked] = useState(false);

  const segments = useSegments();
  const router = useRouter();

  // DEBUG: Monitorear Fuentes
  useEffect(() => {
    console.log(`[Fuentes] Loaded: ${fontsLoaded}, Error: ${error}`);
    if (error) console.error("❌ [Fuentes] Error fatal cargando fuentes:", error);
    if (fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error]);

  // DEBUG: Monitorear Sesión
  useEffect(() => {
    console.log("[Auth] Iniciando verificación de sesión...");

    supabase.auth.getSession().then(({ data: { session } }) => {
      console.log("[Auth] Sesión obtenida:", session ? "Usuario Activo" : "Sin Usuario");
      setSession(session);
      setIsSessionChecked(true);
    }).catch(err => {
      console.error("[Auth] Error obteniendo sesión:", err);
      setIsSessionChecked(true); // Marcamos como revisado aunque falle para no bloquear
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      console.log(`[Auth] Cambio de estado: ${_event}`);
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  // DEBUG: Lógica de Redirección (Aquí suele estar el problema)
  useEffect(() => {
    if (!isSessionChecked || !fontsLoaded) {
      console.log(" [Nav] Esperando a que carguen fuentes o sesión...");
      return;
    }

    const inAuthGroup = segments[0] === 'auth';
    console.log(`[Nav] Segmentos actuales: ${JSON.stringify(segments)}`);
    console.log(`[Nav] ¿Está en grupo Auth?: ${inAuthGroup}`);
    console.log(`[Nav] ¿Tiene sesión?: ${!!session}`);

    if (session && inAuthGroup) {
      console.log("[Nav] Redirigiendo a HOME (Usuario logueado intentando ver login)");
      router.replace('/(drawer)/(tabs)/home'); // <--- VERIFICA QUE ESTA RUTA EXISTA
    } else if (!session && !inAuthGroup) {
      console.log(" [Nav] Redirigiendo a LOGIN (Usuario sin sesión intentando ver app)");
      router.replace('/auth/login');
    } else {
      console.log(" [Nav] Permitiendo navegación actual.");
    }
  }, [session, segments, isSessionChecked, fontsLoaded]);

  // Renderizado Condicional
  if (!fontsLoaded || !isSessionChecked) {
    console.log("[UI] Mostrando pantalla de carga...");
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'white' }}>
        <ActivityIndicator size="large" color="blue" />
        <Text style={{ marginTop: 20 }}>Cargando recursos...</Text>
      </View>
    );
  }

  console.log("[UI] Renderizando Slot principal (App cargada)");
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Slot />
    </GestureHandlerRootView>
  );
}

export default RootLayout;