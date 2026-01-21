import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter, Stack, useFocusEffect, useLocalSearchParams } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AdminLevels() {
  const router = useRouter();
  const { cat_id, cat_name } = useLocalSearchParams(); // Recibimos ID de categoría
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  const [name, setName] = useState('');

  useFocusEffect(useCallback(() => { if(cat_id) cargarNiveles(); }, [cat_id]));

  const cargarNiveles = async () => {
    setLoading(true);
    const { data } = await supabase.from('levels').select('*').eq('category_id', cat_id).order('order_index');
    if (data) setLevels(data);
    setLoading(false);
  };

  const guardarNivel = async () => {
    if (!name.trim()) return;
    const { error } = await supabase.from('levels').insert({ category_id: cat_id, name });
    if (error) Alert.alert("Error", error.message);
    else { setModalVisible(false); setName(''); cargarNiveles(); }
  };

  const borrarNivel = async (id: string) => {
    Alert.alert("Borrar", "Se borrarán los cursos de este nivel.", [
        { text: "Cancelar" },
        { text: "Borrar", style: 'destructive', onPress: async () => { await supabase.from('levels').delete().eq('id', id); cargarNiveles(); }}
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Stack.Screen options={{ title: `2. Niveles de ${cat_name}`, headerBackTitle: 'Categorías' }} />
      
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={levels}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/(drawer)/admin/cursos', params: { level_id: item.id, level_name: item.name } })}
              className="bg-white p-5 rounded-xl mb-3 flex-row justify-between items-center shadow-sm"
            >
              <View className="flex-row items-center">
                <View className="bg-blue-100 p-3 rounded-full mr-3"><Ionicons name="layers-outline" size={24} color="#2563EB" /></View>
                <Text className="font-bold text-lg">{item.name}</Text>
              </View>
              <TouchableOpacity onPress={() => borrarNivel(item.id)} className="p-2 bg-red-50 rounded-lg"><Ionicons name="trash-outline" size={20} color="#EF4444" /></TouchableOpacity>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No hay niveles aún</Text>}
        />
      )}

      <TouchableOpacity onPress={() => setModalVisible(true)} className="absolute bottom-8 right-6 bg-primary w-16 h-16 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center px-6">
            <View className="bg-white p-6 rounded-2xl">
                <Text className="text-xl font-bold mb-4">Nuevo Nivel</Text>
                <TextInput placeholder="Ej: Básico 1" value={name} onChangeText={setName} className="border border-gray-300 p-3 rounded-xl mb-4" />
                <TouchableOpacity onPress={guardarNivel} className="bg-primary p-4 rounded-xl"><Text className="text-white text-center font-bold">Guardar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-3 mt-2"><Text className="text-center text-gray-500">Cancelar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}