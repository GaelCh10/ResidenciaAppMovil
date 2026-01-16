import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import React, { useState } from 'react';
import { ActivityIndicator, Image, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TraductorScreen() {
  const [texto, setTexto] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [buscado, setBuscado] = useState(false);

  // Función de búsqueda
  const buscarSeña = async () => {
    if (!texto.trim()) return;
    Keyboard.dismiss();
    setLoading(true);
    setBuscado(true);
    setResultado(null);

    try {
      // Normalizamos texto para ignorar acentos/mayúsculas en la búsqueda
      // Nota: Para búsquedas complejas en SQL se usa 'ilike' o Full Text Search
      const { data, error } = await supabase
        .from('dictionary_entries')
        .select('*')
        .ilike('word', `%${texto.trim()}%`) // Busca coincidencias parciales
        .limit(1)
        .single(); // Trae el mejor resultado

      if (error && error.code !== 'PGRST116') throw error; // PGRST116 es "no found"
      setResultado(data);
    } catch (error) {
      console.log("No encontrado o error", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-primary text-3xl font-work-black text-center mb-6">
        Traductor LSM
      </Text>

      {/* Caja de Entrada */}
      <View className="bg-white rounded-3xl p-4 shadow-sm mb-6">
        <Text className="text-gray-500 mb-2 font-work-regular">
            Presiona el micrófono de tu teclado o escribe:
        </Text>
        <View className="flex-row items-center border-b border-gray-200 pb-2">
            <TextInput
                className="flex-1 text-2xl font-work-bold text-primary"
                placeholder="Ej: Hola, Casa..."
                value={texto}
                onChangeText={setTexto}
                onSubmitEditing={buscarSeña}
            />
            <TouchableOpacity onPress={buscarSeña} className="bg-primary p-3 rounded-full">
                <Ionicons name="search" size={24} color="white" />
            </TouchableOpacity>
        </View>
      </View>

      {/* Resultado */}
      {loading ? (
        <ActivityIndicator size="large" color="#your_primary" />
      ) : resultado ? (
        <View className="bg-white rounded-3xl overflow-hidden shadow-lg items-center">
            <View className="w-full h-64 bg-gray-100">
                {resultado.media_type === 'video' ? (
                    <Video
                        source={{ uri: resultado.media_url }}
                        style={{ width: '100%', height: '100%' }}
                        resizeMode={ResizeMode.CONTAIN}
                        shouldPlay isLooping isMuted
                    />
                ) : (
                    <Image source={{ uri: resultado.media_url }} className="w-full h-full" resizeMode="contain" />
                )}
            </View>
            <View className="p-6 items-center">
                <Text className="text-gray-400 text-sm uppercase tracking-widest mb-1">Traducción</Text>
                <Text className="text-4xl font-work-black text-primary">{resultado.word}</Text>
                {/* Aquí podrías agregar el texto en LSM Vulpy también */}
                <Text style={{ fontFamily: 'LsmVulpy' }} className="text-6xl text-secondary-500 mt-2">
                    {resultado.word.toLowerCase()}
                </Text>
            </View>
        </View>
      ) : buscado ? (
        <View className="items-center mt-10">
            <Ionicons name="search-outline" size={60} color="#ccc" />
            <Text className="text-gray-400 text-center mt-4">
                No encontramos una seña exacta para "{texto}".{"\n"}Intenta con sinónimos.
            </Text>
        </View>
      ) : (
        <View className="items-center mt-10 opacity-50">
            <Ionicons name="mic-outline" size={80} color="#ccc" />
            <Text className="text-gray-400">Tu voz se convertirá en señas</Text>
        </View>
      )}
    </SafeAreaView>
  );
}