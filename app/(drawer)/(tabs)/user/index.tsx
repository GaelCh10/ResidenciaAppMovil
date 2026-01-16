import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function UserProfile() {
  const router = useRouter();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({ completados: 0, promedio: 0 });

  // useFocusEffect hace que los datos se recarguen cada vez que entras a la pestaña
  useFocusEffect(
    useCallback(() => {
      cargarPerfil();
    }, [])
  );

  const cargarPerfil = async () => {
    try {
      setLoading(true);
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/auth/login');
        return;
      }

      // 1. Cargar Datos del Perfil
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .single();
      
      if (userError) throw userError;
      setProfile(userData);

      // 2. Calcular Estadísticas (Cursos completados)
      const { data: progressData, error: progressError } = await supabase
        .from('user_progress') // Asegúrate de que esta tabla exista o usa la que definimos antes
        .select('*')
        .eq('user_id', session.user.id)
        .eq('is_completed', true);

      if (!progressError && progressData) {
        setStats({
          completados: progressData.length,
          promedio: 0 // Aquí podrías calcular el promedio de calificaciones si quisieras
        });
      }

    } catch (e) {
      console.error("Error perfil:", e);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    Alert.alert(
      "Cerrar Sesión",
      "¿Estás seguro de que quieres salir?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Salir", 
          style: "destructive",
          onPress: async () => {
            await supabase.auth.signOut();
            router.replace('/auth/login');
          }
        }
      ]
    );
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center bg-secondary-200">
        <ActivityIndicator size="large" color="blue" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-200">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        
        {/* ENCABEZADO DE PERFIL */}
        <View className="items-center mb-8">
          <View className="relative">
            <Image
              source={{ uri: profile?.avatar_url || 'https://via.placeholder.com/150' }}
              className="w-32 h-32 rounded-full border-4 border-white shadow-sm"
            />
            <View className="absolute bottom-0 right-0 bg-primary p-2 rounded-full border-2 border-white">
               <Ionicons name="camera" size={20} color="white" />
            </View>
          </View>
          
          <Text className="text-2xl font-work-black text-primary mt-4">
            {profile?.full_name || 'Estudiante'}
          </Text>
          <Text className="text-gray-500 font-work-regular">
            {profile?.role === 'admin' ? 'Administrador' : 'Estudiante de LSM'}
          </Text>
        </View>

        {/* TARJETA DE ESTADÍSTICAS */}
        <View className="flex-row justify-between bg-white p-6 rounded-3xl shadow-sm mb-6">
          <View className="items-center flex-1 border-r border-gray-100">
            <Text className="text-3xl font-work-black text-primary">{stats.completados}</Text>
            <Text className="text-gray-400 text-xs uppercase tracking-wide text-center">Cursos Completados</Text>
          </View>
          <View className="items-center flex-1">
            <Ionicons name="trophy" size={32} color="#F59E0B" />
            <Text className="text-gray-400 text-xs uppercase tracking-wide mt-1 text-center">Nivel Actual</Text>
          </View>
        </View>

        {/* MENÚ DE OPCIONES */}
        <Text className="text-primary font-work-bold text-lg mb-3 ml-2">Cuenta</Text>
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm mb-6">
            
            {/* Opción 1: Mis Avances */}
            <TouchableOpacity 
              onPress={() => router.push('/(drawer)/avance')} // Ajusta ruta si es necesario
              className="flex-row items-center p-4 border-b border-gray-100"
            >
              <View className="bg-blue-100 p-2 rounded-xl mr-4">
                <Ionicons name="bar-chart" size={22} color="#2563EB" />
              </View>
              <Text className="flex-1 text-gray-700 font-work-medium text-lg">Mis Avances</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

             {/* Opción 2: Editar Perfil (Futuro) */}
            <TouchableOpacity className="flex-row items-center p-4 border-b border-gray-100">
              <View className="bg-purple-100 p-2 rounded-xl mr-4">
                <Ionicons name="person" size={22} color="#9333EA" />
              </View>
              <Text className="flex-1 text-gray-700 font-work-medium text-lg">Editar Datos</Text>
              <Ionicons name="chevron-forward" size={20} color="#ccc" />
            </TouchableOpacity>

            {/* Opción 3: PANEL ADMIN (Solo si es admin) */}
            {profile?.role === 'admin' && (
              <TouchableOpacity 
                onPress={() => router.push('/(drawer)/admin')}
                className="flex-row items-center p-4 bg-orange-50 border-b border-gray-100"
              >
                <View className="bg-orange-100 p-2 rounded-xl mr-4">
                  <Ionicons name="shield-checkmark" size={22} color="#EA580C" />
                </View>
                <View className="flex-1">
                    <Text className="text-orange-800 font-work-bold text-lg">Panel Administrador</Text>
                    <Text className="text-orange-600 text-xs">Gestionar cursos y diccionario</Text>
                </View>
                <Ionicons name="chevron-forward" size={20} color="#EA580C" />
              </TouchableOpacity>
            )}

        </View>

        {/* BOTÓN CERRAR SESIÓN */}
        <TouchableOpacity 
          onPress={handleLogout}
          className="flex-row items-center justify-center bg-red-50 p-4 rounded-3xl border border-red-100 mb-10"
        >
          <Ionicons name="log-out-outline" size={24} color="#EF4444" />
          <Text className="text-red-500 font-work-bold text-lg ml-2">Cerrar Sesión</Text>
        </TouchableOpacity>

        <Text className="text-center text-gray-300 text-xs">Versión 1.0.0</Text>

      </ScrollView>
    </SafeAreaView>
  );
}