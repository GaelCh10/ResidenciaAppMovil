import { Stack } from 'expo-router';

export default function ForoLayout() {
  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="index" /> 
    </Stack>
  );
}