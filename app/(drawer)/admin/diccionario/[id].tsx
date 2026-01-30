import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminWords() {
  const { id, nombre } = useLocalSearchParams(); // Recibimos ID de la categoría seleccionada
  const [entries, setEntries] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Estados del formulario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  useEffect(() => { 
      if(id) cargarPalabras(); 
  }, [id]);

  const cargarPalabras = async () => {
    setLoading(true);
    const { data } = await supabase
        .from('dictionary_entries')
        .select('*')
        .eq('category_id', id)
        .order('word');
    if(data) setEntries(data);
    setLoading(false);
  };

  const guardarPalabra = async () => {
    if (!word.trim() || !mediaUrl.trim()) return Alert.alert("Falta información", "Nombre y URL son obligatorios");
    
    // Payload para enviar a Supabase
    const payload = { 
        category_id: id, 
        word: word.trim(), 
        media_url: mediaUrl.trim(), 
        media_type: mediaType 
    };

    let error;
    if (editingId) {
       // UPDATE
       const res = await supabase.from('dictionary_entries').update(payload).eq('id', editingId);
       error = res.error;
    } else {
       // INSERT
       const res = await supabase.from('dictionary_entries').insert(payload);
       error = res.error;
    }

    if (error) Alert.alert("Error", error.message);
    else {
        cerrarModal();
        cargarPalabras();
    }
  };

  const borrarPalabra = async (entryId: string) => {
    Alert.alert("Borrar Palabra", "¿Estás seguro?", [
        { text: "Cancelar" },
        { text: "Sí, borrar", style: 'destructive', onPress: async () => {
            await supabase.from('dictionary_entries').delete().eq('id', entryId);
            cargarPalabras();
        }}
    ]);
  };

  const abrirModal = (item?: any) => {
      if (item) {
          setEditingId(item.id);
          setWord(item.word);
          setMediaUrl(item.media_url);
          setMediaType(item.media_type || 'image');
      } else {
          setEditingId(null);
          setWord('');
          setMediaUrl('');
          setMediaType('image');
      }
      setModalVisible(true);
  };

  const cerrarModal = () => setModalVisible(false);

  return (
    <View className="flex-1 bg-gray-50 p-4">
      {/* Título Dinámico según la categoría elegida */}
      <Stack.Screen options={{ title: nombre ? `Palabras: ${nombre}` : 'Palabras', headerBackTitle: 'Categorías' }} />
      
      {loading ? <ActivityIndicator className="mt-10" /> : (
        <FlatList 
            data={entries}
            keyExtractor={i => i.id}
            renderItem={({ item }) => (
                <View className="bg-white p-3 rounded-xl mb-2 flex-row justify-between items-center shadow-sm border border-gray-100">
                    <View className="flex-row items-center flex-1">
                        {/* Preview pequeño de la imagen/video */}
                        <View className="w-12 h-12 bg-gray-100 rounded-lg mr-3 overflow-hidden border border-gray-200 justify-center items-center">
                            {item.media_type === 'video' ? 
                                <Ionicons name="videocam" size={20} color="gray"/> :
                                <Image source={{ uri: item.media_url }} className="w-full h-full" resizeMode="cover" />
                            }
                        </View>
                        <View>
                            <Text className="font-bold text-lg text-gray-800">{item.word}</Text>
                            <Text className="text-xs text-gray-400 capitalize">{item.media_type}</Text>
                        </View>
                    </View>
                    
                    <View className="flex-row gap-2">
                        <TouchableOpacity onPress={() => abrirModal(item)} className="p-2 bg-blue-50 rounded-lg">
                            <Ionicons name="pencil" size={20} color="#2563EB" />
                        </TouchableOpacity>
                        <TouchableOpacity onPress={() => borrarPalabra(item.id)} className="p-2 bg-red-50 rounded-lg">
                            <Ionicons name="trash-outline" size={20} color="#EF4444" />
                        </TouchableOpacity>
                    </View>
                </View>
            )}
            ListEmptyComponent={<Text className="text-center text-gray-400 mt-10">No hay palabras en esta categoría.</Text>}
        />
      )}

      {/* FAB Agregar */}
      <TouchableOpacity onPress={() => abrirModal()} className="absolute bottom-10 right-6 bg-primary w-14 h-14 rounded-full justify-center items-center shadow-lg">
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* MODAL FORMULARIO */}
      <Modal visible={modalVisible} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-white p-6">
            <Text className="text-2xl font-bold mb-6 text-center text-gray-800">{editingId ? 'Editar' : 'Nueva'} Palabra</Text>
            
            <Text className="label">Palabra</Text>
            <TextInput placeholder="Ej: Hola" value={word} onChangeText={setWord} className="input mb-4" />
            
            <Text className="label">URL Multimedia</Text>
            <TextInput placeholder="https://..." value={mediaUrl} onChangeText={setMediaUrl} className="input mb-4" autoCapitalize="none" />
            
            <Text className="label mb-2">Tipo de Archivo</Text>
            <View className="flex-row mb-8 bg-gray-100 p-1 rounded-xl">
                <TouchableOpacity 
                    onPress={() => setMediaType('image')} 
                    className={`flex-1 p-3 rounded-lg ${mediaType==='image'?'bg-white shadow-sm':'bg-transparent'}`}
                >
                    <Text className={`text-center font-bold ${mediaType==='image'?'text-blue-600':'text-gray-500'}`}>Imagen</Text>
                </TouchableOpacity>
                <TouchableOpacity 
                    onPress={() => setMediaType('video')} 
                    className={`flex-1 p-3 rounded-lg ${mediaType==='video'?'bg-white shadow-sm':'bg-transparent'}`}
                >
                    <Text className={`text-center font-bold ${mediaType==='video'?'text-blue-600':'text-gray-500'}`}>Video</Text>
                </TouchableOpacity>
            </View>

            <TouchableOpacity onPress={guardarPalabra} className="bg-primary p-4 rounded-xl mb-3 shadow-md">
                <Text className="text-white text-center font-bold text-lg">Guardar</Text>
            </TouchableOpacity>
            
            <TouchableOpacity onPress={cerrarModal} className="p-3">
                <Text className="text-center text-gray-500 font-bold">Cancelar</Text>
            </TouchableOpacity>
        </View>
      </Modal>
    </View>
  );
}