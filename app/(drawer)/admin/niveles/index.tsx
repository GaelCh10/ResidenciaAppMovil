import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminLevels() {
  const router = useRouter();
  const { cat_id, cat_name } = useLocalSearchParams();
  const [levels, setLevels] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  const [modalVisible, setModalVisible] = useState(false);
  const [tempItem, setTempItem] = useState({ id: '', name: '', order_index: '0' });

  useFocusEffect(useCallback(() => { if(cat_id) cargarNiveles(); }, [cat_id]));

  const cargarNiveles = async () => {
    setLoading(true);
    const { data } = await supabase.from('levels').select('*').eq('category_id', cat_id).order('order_index', { ascending: true });
    if (data) setLevels(data);
    setLoading(false);
  };

  const abrirModal = (item?: any) => {
    if (item) {
        setTempItem({ id: item.id, name: item.name, order_index: item.order_index?.toString() || '0' });
    } else {
        setTempItem({ id: '', name: '', order_index: (levels.length + 1).toString() });
    }
    setModalVisible(true);
  };

  const guardarNivel = async () => {
    if (!tempItem.name.trim()) return;
    
    const payload = { category_id: cat_id, name: tempItem.name, order_index: parseInt(tempItem.order_index) || 0 };

    let error;
    if (tempItem.id) {
        const res = await supabase.from('levels').update(payload).eq('id', tempItem.id);
        error = res.error;
    } else {
        const res = await supabase.from('levels').insert(payload);
        error = res.error;
    }

    if (error) Alert.alert("Error", error.message);
    else { setModalVisible(false); cargarNiveles(); }
  };

  const borrarNivel = async (id: string) => {
    Alert.alert("Borrar", "Se borrarán todos los cursos de este nivel.", [
        { text: "Cancelar" },
        { 
            text: "Borrar", 
            style: 'destructive', 
            onPress: async () => { 
                setLoading(true);
                const { error } = await supabase.from('levels').delete().eq('id', id);
                
                if (error) {
                    console.error("Error borrando nivel:", error);
                    Alert.alert("Error", "No se pudo borrar el nivel.");
                } else {
                    cargarNiveles();
                }
                setLoading(false);
            }
        }
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
            <View className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm">
              <TouchableOpacity 
                onPress={() => router.push({ pathname: '/(drawer)/admin/cursos', params: { level_id: item.id, level_name: item.name } })}
                className="flex-row items-center flex-1"
              >
                <View className="bg-blue-100 p-3 rounded-full mr-3"><Ionicons name="layers-outline" size={24} color="#2563EB" /></View>
                <View>
                    <Text className="font-bold text-lg">{item.name}</Text>
                    <Text className="text-xs text-gray-400">Orden: {item.order_index}</Text>
                </View>
              </TouchableOpacity>
              
              <View className="flex-row gap-2">
                <TouchableOpacity onPress={() => abrirModal(item)} className="p-2 bg-blue-50 rounded-lg">
                    <Ionicons name="pencil" size={20} color="#2563EB" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => borrarNivel(item.id)} className="p-2 bg-red-50 rounded-lg">
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </View>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No hay niveles aún</Text>}
        />
      )}

      <TouchableOpacity onPress={() => abrirModal()} className="absolute bottom-8 right-6 bg-blue-600 w-16 h-16 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center px-6">
            <View className="bg-white p-6 rounded-2xl">
                <Text className="text-xl font-bold mb-4">{tempItem.id ? 'Editar Nivel' : 'Nuevo Nivel'}</Text>
                <Text className="text-xs text-gray-500 mb-1">Nombre</Text>
                <TextInput value={tempItem.name} onChangeText={t => setTempItem({...tempItem, name: t})} className="border border-gray-300 p-3 rounded-xl mb-3" />
                <Text className="text-xs text-gray-500 mb-1">Orden</Text>
                <TextInput value={tempItem.order_index} onChangeText={t => setTempItem({...tempItem, order_index: t})} keyboardType="numeric" className="border border-gray-300 p-3 rounded-xl mb-4 bg-gray-50" />
                <TouchableOpacity onPress={guardarNivel} className="bg-blue-600 p-4 rounded-xl"><Text className="text-white text-center font-bold">Guardar</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-3 mt-2"><Text className="text-center text-gray-500">Cancelar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}