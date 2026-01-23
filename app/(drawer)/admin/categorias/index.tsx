import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal y Estado de Edición
  const [modalVisible, setModalVisible] = useState(false);
  // Usamos un objeto para manejar tanto creación como edición
  const [tempItem, setTempItem] = useState({ id: '', name: '', description: '', order_index: '0' });

  useFocusEffect(useCallback(() => { cargarCategorias(); }, []));

  const cargarCategorias = async () => {
    setLoading(true);
    // Ordenamos por order_index ascendente
    const { data } = await supabase.from('categories').select('*').order('order_index', { ascending: true });
    if (data) setCategories(data);
    setLoading(false);
  };

  const abrirModal = (item?: any) => {
    if (item) {
        // Modo Edición
        setTempItem({ 
            id: item.id, 
            name: item.name, 
            description: item.description || '', 
            order_index: item.order_index?.toString() || '0' 
        });
    } else {
        // Modo Creación
        setTempItem({ id: '', name: '', description: '', order_index: (categories.length + 1).toString() });
    }
    setModalVisible(true);
  };

  const guardarCategoria = async () => {
    if (!tempItem.name.trim()) return Alert.alert("Falta nombre");

    const payload = {
        name: tempItem.name,
        description: tempItem.description,
        order_index: parseInt(tempItem.order_index) || 0
    };

    let error;
    if (tempItem.id) {
        // Actualizar
        const res = await supabase.from('categories').update(payload).eq('id', tempItem.id);
        error = res.error;
    } else {
        // Insertar
        const res = await supabase.from('categories').insert(payload);
        error = res.error;
    }

    if (error) Alert.alert("Error", error.message);
    else { 
        setModalVisible(false); 
        cargarCategorias(); 
    }
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
            <View className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm">
              <TouchableOpacity 
                onPress={() => router.push({ pathname: '/(drawer)/admin/niveles', params: { cat_id: item.id, cat_name: item.name } })}
                className="flex-row items-center flex-1"
              >
                <View className="bg-purple-100 p-3 rounded-full mr-3"><Ionicons name="grid-outline" size={24} color="#7C3AED" /></View>
                <View>
                    <Text className="font-bold text-lg">{item.name}</Text>
                    <Text className="text-gray-400 text-xs">Orden: {item.order_index} • {item.description}</Text>
                </View>
              </TouchableOpacity>
              
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => abrirModal(item)} className="p-2 bg-blue-50 rounded-lg">
                    <Ionicons name="pencil" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => borrarCategoria(item.id)} className="p-2 bg-red-50 rounded-lg">
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
        />
      )}

      <TouchableOpacity onPress={() => abrirModal()} className="absolute bottom-8 right-6 bg-purple-600 w-16 h-16 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade" presentationStyle="overFullScreen">
        <View className="flex-1 bg-black/50 justify-center px-6">
            <View className="bg-white p-6 rounded-2xl">
                <Text className="text-xl font-bold mb-4">{tempItem.id ? 'Editar Categoría' : 'Nueva Categoría'}</Text>
                
                <Text className="text-xs text-gray-500 mb-1">Nombre</Text>
                <TextInput value={tempItem.name} onChangeText={t => setTempItem({...tempItem, name: t})} className="border border-gray-300 p-3 rounded-xl mb-3" />
                
                <Text className="text-xs text-gray-500 mb-1">Descripción</Text>
                <TextInput value={tempItem.description} onChangeText={t => setTempItem({...tempItem, description: t})} className="border border-gray-300 p-3 rounded-xl mb-3" />
                
                <Text className="text-xs text-gray-500 mb-1">Orden (Ej: 1, 2, 3...)</Text>
                <TextInput 
                    value={tempItem.order_index} 
                    onChangeText={t => setTempItem({...tempItem, order_index: t})} 
                    keyboardType="numeric"
                    className="border border-gray-300 p-3 rounded-xl mb-4 bg-gray-50" 
                />

                <TouchableOpacity onPress={guardarCategoria} className="bg-purple-600 p-4 rounded-xl"><Text className="text-white text-center font-bold">Guardar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-3 mt-2"><Text className="text-center text-gray-500">Cancelar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}