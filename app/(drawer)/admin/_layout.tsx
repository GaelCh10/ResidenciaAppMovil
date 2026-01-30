import { Stack } from 'expo-router';

export default function AdminLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="admin/" />
      <Stack.Screen name="index" />
      <Stack.Screen name="diccionario/index" />
      <Stack.Screen name="diccionario/[id]" />
      <Stack.Screen name="cursos/index" />
      <Stack.Screen name="categorias/index" />
      <Stack.Screen name="niveles/index" />
      <Stack.Screen name="editor/[id]" />
    </Stack>
  );
}