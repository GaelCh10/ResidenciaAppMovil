import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function RestablecerPassword() {
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const actualizarPassword = async () => {
    if (password.length < 6) return Alert.alert("Error", "Mínimo 6 caracteres.");
    
    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({ password: password });
      if (error) throw error;

      Alert.alert("¡Éxito!", "Contraseña actualizada correctamente.", [
        { text: "Entrar", onPress: () => router.replace('/(drawer)/(tabs)/(stack)/cursos') }
      ]);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white px-6 justify-center">
      <View className="items-center mb-8">
        <Ionicons name="key" size={50} color="#2563EB" />
        <Text className="text-2xl font-bold text-gray-800 mt-4">Nueva Contraseña</Text>
        <Text className="text-gray-500 text-center mt-2">Crea una contraseña segura para tu cuenta.</Text>
      </View>

      <TextInput
        value={password}
        onChangeText={setPassword}
        placeholder="Nueva contraseña"
        secureTextEntry
        className="bg-gray-100 p-4 rounded-xl border border-gray-200 mb-6"
      />

      <TouchableOpacity 
        onPress={actualizarPassword}
        disabled={loading}
        className="bg-primary w-full py-4 rounded-xl items-center"
      >
        {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold">Guardar</Text>}
      </TouchableOpacity>
    </SafeAreaView>
  );
}