import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminPalabras() {
  const { id, nombre } = useLocalSearchParams(); // ID de la categoría
  const [entries, setEntries] = useState<any[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  
  // Formulario
  const [editingId, setEditingId] = useState<string | null>(null);
  const [word, setWord] = useState('');
  const [mediaUrl, setMediaUrl] = useState('');
  const [mediaType, setMediaType] = useState<'image' | 'video'>('image');

  useEffect(() => { cargarPalabras(); }, [id]);

  const cargarPalabras = async () => {
    const { data } = await supabase.from('dictionary_entries').select('*').eq('category_id', id).order('word');
    if(data) setEntries(data);
  };

  const guardarPalabra = async () => {
    if (!word.trim() || !mediaUrl.trim()) return Alert.alert("Error", "Llena los campos");
    
    const payload = { category_id: id, word, media_url: mediaUrl, media_type: mediaType };

    let error;
    if (editingId) {
       // UPDATE
       const { error: err } = await supabase.from('dictionary_entries').update(payload).eq('id', editingId);
       error = err;
    } else {
       // INSERT
       const { error: err } = await supabase.from('dictionary_entries').insert(payload);
       error = err;
    }

    if (error) Alert.alert("Error", error.message);
    else {
        cargarPalabras();
        cerrarModal();
    }
  };

  const borrarPalabra = async (entryId: string) => {
    Alert.alert("Borrar", "¿Seguro?", [
        { text: "Cancelar" },
        { text: "Sí, borrar", onPress: async () => {
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
          setMediaType(item.media_type);
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
    <View className="flex-1 bg-gray-100 p-4">
      <Stack.Screen options={{ title: `Editar: ${nombre}`, headerBackTitle: 'Atrás' }} />
      
      <FlatList 
        data={entries}
        keyExtractor={i => i.id}
        renderItem={({ item }) => (
            <View className="bg-white p-4 rounded-xl mb-2 flex-row justify-between items-center shadow-sm">
                <View className="flex-row items-center flex-1">
                    <Image source={{ uri: item.media_url }} className="w-10 h-10 rounded bg-gray-200 mr-3" />
                    <Text className="font-bold text-lg">{item.word}</Text>
                </View>
                <View className="flex-row">
                    <TouchableOpacity onPress={() => abrirModal(item)} className="p-2 mr-2 bg-blue-100 rounded-lg">
                        <Ionicons name="pencil" size={20} color="#2563EB" />
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => borrarPalabra(item.id)} className="p-2 bg-red-100 rounded-lg">
                        <Ionicons name="trash" size={20} color="#EF4444" />
                    </TouchableOpacity>
                </View>
            </View>
        )}
      />

      <TouchableOpacity onPress={() => abrirModal()} className="absolute bottom-10 right-6 bg-primary w-14 h-14 rounded-full justify-center items-center shadow-lg">
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* MODAL FORMULARIO */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-center px-4">
            <View className="bg-white p-6 rounded-2xl">
                <Text className="text-xl font-bold mb-4">{editingId ? 'Editar' : 'Nueva'} Palabra</Text>
                
                <TextInput placeholder="Palabra (Ej: Hola)" value={word} onChangeText={setWord} className="border p-3 rounded-lg mb-3" />
                <TextInput placeholder="URL de Imagen/Video" value={mediaUrl} onChangeText={setMediaUrl} className="border p-3 rounded-lg mb-3" />
                
                <View className="flex-row mb-4">
                    <TouchableOpacity onPress={() => setMediaType('image')} className={`flex-1 p-3 rounded-l-lg border ${mediaType==='image'?'bg-blue-100 border-blue-500':'bg-white'}`}>
                        <Text className="text-center">Imagen</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => setMediaType('video')} className={`flex-1 p-3 rounded-r-lg border ${mediaType==='video'?'bg-blue-100 border-blue-500':'bg-white'}`}>
                        <Text className="text-center">Video</Text>
                    </TouchableOpacity>
                </View>

                <TouchableOpacity onPress={guardarPalabra} className="bg-primary p-4 rounded-lg mb-2">
                    <Text className="text-white text-center font-bold">Guardar</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={cerrarModal}><Text className="text-center text-gray-500 mt-2">Cancelar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>
    </View>
  );
}