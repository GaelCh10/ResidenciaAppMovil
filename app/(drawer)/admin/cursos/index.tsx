import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminCourses() {
  const router = useRouter();
  const { level_id, level_name } = useLocalSearchParams();
  const [courses, setCourses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal Curso
  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState('');
  const [desc, setDesc] = useState('');
  const [cover, setCover] = useState('');

  useFocusEffect(useCallback(() => { if(level_id) cargarCursos(); }, [level_id]));

  const cargarCursos = async () => {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').eq('level_id', level_id).order('order_index');
    if (data) setCourses(data);
    setLoading(false);
  };

  const guardarCurso = async () => {
    if (!title.trim()) return;
    const { data, error } = await supabase.from('courses').insert({ level_id, title, description: desc, cover_image_url: cover }).select().single();
    if (error) Alert.alert("Error", error.message);
    else {
        setModalVisible(false);
        // Redirigir directo al editor para llenar lecciones
        router.push({ pathname: '/(drawer)/admin/editor/[id]', params: { id: data.id } });
    }
  };

  const borrarCurso = async (id: string) => {
    Alert.alert("Borrar", "Se borrará todo el contenido del curso.", [
        { text: "Cancelar" },
        { text: "Borrar", style: 'destructive', onPress: async () => { await supabase.from('courses').delete().eq('id', id); cargarCursos(); }}
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Stack.Screen options={{ title: `3. Cursos (${level_name})`, headerBackTitle: 'Niveles' }} />
      
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={courses}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/(drawer)/admin/editor/[id]', params: { id: item.id } })}
              className="bg-white p-4 rounded-xl mb-3 flex-row items-center shadow-sm border border-gray-100"
            >
              <View className="w-12 h-12 bg-orange-100 rounded-lg mr-3 items-center justify-center overflow-hidden">
                 {item.cover_image_url ? <Image source={{uri:item.cover_image_url}} className="w-full h-full"/> : <Ionicons name="book" size={24} color="#EA580C" />}
              </View>
              <View className="flex-1">
                <Text className="font-bold text-gray-800">{item.title}</Text>
                <Text className="text-xs text-gray-400" numberOfLines={1}>{item.description}</Text>
              </View>
              <TouchableOpacity onPress={() => borrarCurso(item.id)} className="p-2 bg-red-50 rounded-lg"><Ionicons name="trash-outline" size={20} color="#EF4444" /></TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No hay cursos en este nivel</Text>}
        />
      )}

      <TouchableOpacity onPress={() => setModalVisible(true)} className="absolute bottom-8 right-6 bg-orange-500 w-16 h-16 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center px-6">
            <View className="bg-white p-6 rounded-2xl">
                <Text className="text-xl font-bold mb-4">Nuevo Curso</Text>
                <TextInput placeholder="Título (Ej: Saludos)" value={title} onChangeText={setTitle} className="border p-3 rounded-lg mb-2" />
                <TextInput placeholder="Descripción" value={desc} onChangeText={setDesc} className="border p-3 rounded-lg mb-2" />
                <TextInput placeholder="URL Imagen Portada" value={cover} onChangeText={setCover} className="border p-3 rounded-lg mb-4" />
                <TouchableOpacity onPress={guardarCurso} className="bg-orange-500 p-4 rounded-xl"><Text className="text-white text-center font-bold">Crear y Editar Contenido</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-3 mt-2"><Text className="text-center text-gray-500">Cancelar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}