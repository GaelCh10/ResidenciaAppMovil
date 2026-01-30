import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useFocusEffect, useRouter } from 'expo-router';
import React, { useCallback, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminDictionaryCategories() {
  const router = useRouter();
  const [categories, setCategories] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  // Modal para Crear/Editar
  const [modalVisible, setModalVisible] = useState(false);
  const [catName, setCatName] = useState('');
  const [catImage, setCatImage] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);

  // Verificar Admin y Cargar Datos al enfocar la pantalla
  useFocusEffect(
    useCallback(() => {
      checkUserRole();
    }, [])
  );

  const checkUserRole = async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) return;

    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (data?.role === 'admin') {
      setIsAdmin(true);
      cargarCategorias();
    } else {
      Alert.alert("Acceso Denegado", "No tienes permisos.");
      router.back();
    }
  };

  const cargarCategorias = async () => {
    setLoading(true);
    // Ordenamos alfabéticamente
    const { data } = await supabase.from('dictionary_categories').select('*').order('name');
    if (data) setCategories(data);
    setLoading(false);
  };

  const abrirModal = (item?: any) => {
    if (item) {
        setEditingId(item.id);
        setCatName(item.name);
        setCatImage(item.image_url || '');
    } else {
        setEditingId(null);
        setCatName('');
        setCatImage('');
    }
    setModalVisible(true);
  };

  const guardarCategoria = async () => {
    if (!catName.trim()) return Alert.alert("Error", "El nombre es obligatorio");
    
    const payload = { name: catName, image_url: catImage || null };
    let error;

    if (editingId) {
        const res = await supabase.from('dictionary_categories').update(payload).eq('id', editingId);
        error = res.error;
    } else {
        const res = await supabase.from('dictionary_categories').insert(payload);
        error = res.error;
    }

    if (error) Alert.alert("Error", error.message);
    else {
        setModalVisible(false);
        cargarCategorias();
    }
  };

  const borrarCategoria = async (id: string) => {
    Alert.alert("Borrar Categoría", "Se borrarán todas las palabras que contenga.", [
      { text: "Cancelar" },
      { text: "Borrar", style: 'destructive', onPress: async () => {
          await supabase.from('dictionary_categories').delete().eq('id', id);
          cargarCategorias();
      }}
    ]);
  };

  if (!isAdmin) return <View className="flex-1 justify-center"><ActivityIndicator /></View>;

  return (
    <View className="flex-1 bg-gray-50 p-4">
      <Stack.Screen options={{ title: 'Diccionario', headerBackTitle: 'Admin' }} />
      
      {loading ? <ActivityIndicator size="large" className="mt-10"/> : (
        <FlatList
          data={categories}
          keyExtractor={i => i.id}
          renderItem={({ item }) => (
            <TouchableOpacity 
              // --- NAVEGACIÓN A LAS PALABRAS ---
              onPress={() => router.push({ 
                  pathname: '/(drawer)/admin/diccionario/[id]', 
                  params: { id: item.id, nombre: item.name } 
              })}
              className="bg-white p-4 rounded-xl mb-3 flex-row justify-between items-center shadow-sm"
            >
              <View className="flex-row items-center flex-1">
                <View className="w-12 h-12 bg-blue-100 rounded-full mr-3 items-center justify-center overflow-hidden border border-blue-200">
                    {item.image_url ? 
                        <Image source={{uri: item.image_url}} className="w-full h-full" /> : 
                        <Ionicons name="book-outline" size={24} color="#2563EB" />
                    }
                </View>
                <Text className="font-bold text-lg text-gray-800">{item.name}</Text>
              </View>

              <View className="flex-row">
                <TouchableOpacity onPress={() => abrirModal(item)} className="p-2 mr-2 bg-gray-100 rounded-lg">
                    <Ionicons name="pencil" size={20} color="#4B5563" />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => borrarCategoria(item.id)} className="p-2 bg-red-50 rounded-lg">
                    <Ionicons name="trash-outline" size={20} color="#EF4444" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          )}
          ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No hay categorías. Crea una.</Text>}
        />
      )}

      {/* FAB Agregar */}
      <TouchableOpacity onPress={() => abrirModal()} className="absolute bottom-8 right-6 bg-primary w-16 h-16 rounded-full items-center justify-center shadow-lg">
        <Ionicons name="add" size={32} color="white" />
      </TouchableOpacity>

      {/* Modal */}
      <Modal visible={modalVisible} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center px-6">
            <View className="bg-white p-6 rounded-2xl">
                <Text className="text-xl font-bold mb-4">{editingId ? 'Editar' : 'Nueva'} Categoría</Text>
                
                <Text className="text-gray-500 mb-1">Nombre</Text>
                <TextInput value={catName} onChangeText={setCatName} className="border border-gray-300 p-3 rounded-xl mb-3" placeholder="Ej: Saludos" />
                
                <Text className="text-gray-500 mb-1">URL Imagen (Opcional)</Text>
                <TextInput value={catImage} onChangeText={setCatImage} className="border border-gray-300 p-3 rounded-xl mb-6" placeholder="https://..." />
                
                <TouchableOpacity onPress={guardarCategoria} className="bg-primary p-4 rounded-xl mb-2">
                    <Text className="text-white text-center font-bold">Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => setModalVisible(false)} className="p-3">
                    <Text className="text-center text-gray-500">Cancelar</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
} 