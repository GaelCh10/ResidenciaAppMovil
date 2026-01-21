import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { supabase } from '@/src/lib/supabase';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';

export default function AdminPanel() {
  const router = useRouter();
  const [isAdmin, setIsAdmin] = useState(false);
  const [loadingCheck, setLoadingCheck] = useState(true);

  // Estados del Formulario (Categoría Diccionario)
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [sending, setSending] = useState(false);

  useEffect(() => {
    checkUserRole();
  }, []);

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (data?.role === 'admin') {
      setIsAdmin(true);
    } else {
      Alert.alert("Acceso Denegado", "No tienes permisos de administrador.");
      router.back();
    }
    setLoadingCheck(false);
  };

  const agregarCategoriaDiccionario = async () => {
    if (!catName.trim()) return Alert.alert("Error", "Pon un nombre");
    setSending(true);

    try {
      const { error } = await supabase
        .from('dictionary_categories')
        .insert({
          name: catName,
          image_url: catImage || null // Opcional
        });

      if (error) throw error;
      
      Alert.alert("Éxito", "Categoría agregada");
      setCatName('');
      setCatImage('');
    } catch (e: any) {
      Alert.alert("Error", e.message);
    } finally {
      setSending(false);
    }
  };

  if (loadingCheck) return <ActivityIndicator size="large" className="mt-20" />;
  if (!isAdmin) return null;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <View className="flex-row items-center mb-6 mt-4">
        <TouchableOpacity onPress={() => router.back()} className="mr-4">
           <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text className="text-2xl font-work-black text-primary">Panel Admin</Text>
      </View>

      <ScrollView>
        {/* TARJETA: AGREGAR CATEGORÍA DICCIONARIO */}
        <View className="bg-white p-6 rounded-3xl shadow-sm mb-6">
          <View className="flex-row items-center mb-4">
            <View className="bg-blue-100 p-3 rounded-full mr-3">
                <Ionicons name="library-outline" size={24} color="#2563EB" />
            </View>
            <Text className="text-lg font-bold text-gray-800">Nueva Categoría Diccionario</Text>
          </View>

          <Text className="text-gray-500 mb-1">Nombre de la Categoría</Text>
          <TextInput 
            value={catName}
            onChangeText={setCatName}
            placeholder="Ej: Comida, Transportes..."
            className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-4"
          />

          <Text className="text-gray-500 mb-1">URL de Imagen (Opcional)</Text>
          <TextInput 
            value={catImage}
            onChangeText={setCatImage}
            placeholder="https://..."
            className="bg-gray-50 p-3 rounded-xl border border-gray-200 mb-6"
          />

          <TouchableOpacity 
            onPress={agregarCategoriaDiccionario}
            disabled={sending}
            className="bg-primary py-3 rounded-xl items-center"
          >
            {sending ? <ActivityIndicator color="white"/> : <Text className="text-white font-bold">Guardar Categoría</Text>}
          </TouchableOpacity>
        </View>

        {/* AQUÍ PODRÍAS DUPLICAR LA TARJETA PARA AGREGAR CURSOS */}
        <View className="bg-white p-6 rounded-3xl shadow-sm mb-6 opacity-50">
            <Text className="text-center text-gray-400">Próximamente: Agregar Cursos</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}