import { Stack } from 'expo-router';

export default function JuegosLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      {/* Esto agrupa todos los juegos bajo una sola ruta.
        El Tab Bar solo verá este Layout y no los archivos internos.
      */}
      <Stack.Screen name="index" /> 
      {/* Las demás rutas (memorama, sopa, etc.) se manejan automáticamente aquí dentro */}
    </Stack>
  );
}