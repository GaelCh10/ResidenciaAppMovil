import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, Alert, TextInput, Modal, ActivityIndicator } from 'react-native';
import { useRouter, Stack, useFocusEffect } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';

export default function AdminCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal
  const [modalVisible, setModalVisible] = useState(false);
  const [catName, setCatName] = useState('');
  const [catDesc, setCatDesc] = useState('');

  useFocusEffect(useCallback(() => { cargarCategorias(); }, []));

  const cargarCategorias = async () => {
    setLoading(true);
    const { data } = await supabase.from('categories').select('*').order('order_index');
    if (data) setCategories(data);
    setLoading(false);
  };

  const guardarCategoria = async () => {
    if (!catName.trim()) return;
    const { error } = await supabase.from('categories').insert({ name: catName, description: catDesc });
    if (error) Alert.alert("Error", error.message);
    else { setModalVisible(false); setCatName(''); setCatDesc(''); cargarCategorias(); }
  };

  const borrarCategoria = async (id: string) => {
    Alert.alert("Borrar", "Se borrarán todos los niveles y cursos dentro.", [
      { text: "Cancelar" },
      { text: "Borrar", style: 'destructive', onPress: async () => {
          await supabase.from('categories').delete().eq('id', id);
          cargarCategorias();
      }}
    ]);
  };

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Stack.Screen options={{ title: '1. Categorías', headerBackTitle: 'Inicio' }} />
      
      {loading ? <ActivityIndicator /> : (
        <FlatList
          data={categories}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              onPress={() => router.push({ pathname: '/(drawer)/admin/niveles', params: { cat_id: item.id, cat_name: item.name } })}
              className="bg-white p-5 rounded-xl mb-3 flex-row justify-between items-center shadow-sm"
            >
              <View className="flex-row items-center flex-1">
                <View className="bg-purple-100 p-3 rounded-full mr-3"><Ionicons name="grid-outline" size={24} color="#7C3AED" /></View>
                <View>
                    <Text className="font-bold text-lg">{item.name}</Text>
                    {item.description && <Text className="text-gray-400 text-xs">{item.description}</Text>}
                </View>
              </View>
              <TouchableOpacity onPress={() => borrarCategoria(item.id)} className="p-2 bg-red-50 rounded-lg">
                <Ionicons name="trash-outline" size={20} color="#EF4444" />
              </TouchableOpacity>
            </TouchableOpacity>
          )}
        />
      )}

      <TouchableOpacity onPress={() => setModalVisible(true)} className="absolute bottom-8 right-6 bg-primary w-16 h-16 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center px-6">
            <View className="bg-white p-6 rounded-2xl">
                <Text className="text-xl font-bold mb-4">Nueva Categoría</Text>
                <TextInput placeholder="Nombre (Ej: General)" value={catName} onChangeText={setCatName} className="border border-gray-300 p-3 rounded-xl mb-3" />
                <TextInput placeholder="Descripción (Opcional)" value={catDesc} onChangeText={setCatDesc} className="border border-gray-300 p-3 rounded-xl mb-4" />
                <TouchableOpacity onPress={guardarCategoria} className="bg-primary p-4 rounded-xl"><Text className="text-white text-center font-bold">Guardar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-3 mt-2"><Text className="text-center text-gray-500">Cancelar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}