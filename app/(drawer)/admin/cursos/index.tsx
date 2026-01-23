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
  
  const [modalVisible, setModalVisible] = useState(false);
  // Estado unificado
  const [tempItem, setTempItem] = useState({ id: '', title: '', description: '', cover_image_url: '', order_index: '0' });

  useFocusEffect(useCallback(() => { if(level_id) cargarCursos(); }, [level_id]));

  const cargarCursos = async () => {
    setLoading(true);
    const { data } = await supabase.from('courses').select('*').eq('level_id', level_id).order('order_index', { ascending: true });
    if (data) setCourses(data);
    setLoading(false);
  };

  const abrirModal = (item?: any) => {
      if (item) {
          setTempItem({
              id: item.id,
              title: item.title,
              description: item.description || '',
              cover_image_url: item.cover_image_url || '',
              order_index: item.order_index?.toString() || '0'
          });
      } else {
          setTempItem({ id: '', title: '', description: '', cover_image_url: '', order_index: (courses.length + 1).toString() });
      }
      setModalVisible(true);
  };

  const guardarCurso = async () => {
    if (!tempItem.title.trim()) return;

    const payload = { 
        level_id, 
        title: tempItem.title, 
        description: tempItem.description, 
        cover_image_url: tempItem.cover_image_url,
        order_index: parseInt(tempItem.order_index) || 0
    };

    if (tempItem.id) {
        // Actualizar
        const { error } = await supabase.from('courses').update(payload).eq('id', tempItem.id);
        if (error) Alert.alert("Error", error.message);
        else { setModalVisible(false); cargarCursos(); }
    } else {
        // Insertar (y redirigir a editar contenido)
        const { data, error } = await supabase.from('courses').insert(payload).select().single();
        if (error) Alert.alert("Error", error.message);
        else {
            setModalVisible(false);
            router.push({ pathname: '/(drawer)/admin/editor/[id]', params: { id: data.id } });
        }
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
            <View className="bg-white p-4 rounded-xl mb-3 flex-row items-center shadow-sm border border-gray-100">
              <TouchableOpacity 
                onPress={() => router.push({ pathname: '/(drawer)/admin/editor/[id]', params: { id: item.id } })}
                className="flex-row items-center flex-1"
              >
                <View className="w-12 h-12 bg-orange-100 rounded-lg mr-3 items-center justify-center overflow-hidden">
                   {item.cover_image_url ? <Image source={{uri:item.cover_image_url}} className="w-full h-full"/> : <Ionicons name="book" size={24} color="#EA580C" />}
                </View>
                <View className="flex-1 mr-2">
                  <Text className="font-bold text-gray-800">{item.title}</Text>
                  <Text className="text-xs text-gray-400" numberOfLines={1}>Orden: {item.order_index} • {item.description}</Text>
                </View>
              </TouchableOpacity>
              
              <View className="flex-row gap-1">
                 <TouchableOpacity onPress={() => abrirModal(item)} className="p-2 bg-blue-50 rounded-lg">
                    <Ionicons name="pencil" size={20} color="#2563EB" />
                 </TouchableOpacity>
                 <TouchableOpacity onPress={() => borrarCurso(item.id)} className="p-2 bg-red-50 rounded-lg">
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                 </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No hay cursos en este nivel</Text>}
        />
      )}

      <TouchableOpacity onPress={() => abrirModal()} className="absolute bottom-8 right-6 bg-orange-500 w-16 h-16 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center px-6">
            <View className="bg-white p-6 rounded-2xl">
                <Text className="text-xl font-bold mb-4">{tempItem.id ? 'Editar Curso' : 'Nuevo Curso'}</Text>
                
                <Text className="label">Título</Text>
                <TextInput value={tempItem.title} onChangeText={t => setTempItem({...tempItem, title: t})} className="input mb-2" />
                
                <Text className="label">Descripción</Text>
                <TextInput value={tempItem.description} onChangeText={t => setTempItem({...tempItem, description: t})} className="input mb-2" />
                
                <Text className="label">URL Portada</Text>
                <TextInput value={tempItem.cover_image_url} onChangeText={t => setTempItem({...tempItem, cover_image_url: t})} className="input mb-2" autoCapitalize='none' />
                
                <Text className="label">Orden</Text>
                <TextInput value={tempItem.order_index} onChangeText={t => setTempItem({...tempItem, order_index: t})} keyboardType="numeric" className="input mb-4 bg-gray-50" />

                <TouchableOpacity onPress={guardarCurso} className="bg-orange-500 p-4 rounded-xl"><Text className="text-white text-center font-bold">Guardar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-3 mt-2"><Text className="text-center text-gray-500">Cancelar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}