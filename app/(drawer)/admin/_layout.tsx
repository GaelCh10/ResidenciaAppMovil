import { Stack } from 'expo-router';
import React from 'react';

export default function AdminLayout() {
  return (
    <Stack 
      screenOptions={{ 
        headerShown: false, 
        animation: 'slide_from_right'
      }}
    >
      <Stack.Screen name="index" />
      <Stack.Screen name="categorias/index" />
      <Stack.Screen name="niveles/index" />
      <Stack.Screen name="cursos/index" />
      <Stack.Screen name="editor/[id]" />
      <Stack.Screen name="diccionario/index" />
      <Stack.Screen name="diccionario/[id]" />
    </Stack>
  );
}