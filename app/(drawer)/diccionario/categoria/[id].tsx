import { EntradaDiccionario, obtenerPalabrasPorCategoria } from '@/src/services/diccionario';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { FlatList, Image, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListaPalabras() {
  const { id, nombre } = useLocalSearchParams();
  
  const [palabras, setPalabras] = useState<EntradaDiccionario[]>([]);
  const [filtro, setFiltro] = useState(''); // Para el buscador
  const [loading, setLoading] = useState(true);
  
  // Estado para el Modal de detalle (ver la seña)
  const [palabraSeleccionada, setPalabraSeleccionada] = useState<EntradaDiccionario | null>(null);

  useEffect(() => {
    if(id) cargarPalabras();
  }, [id]);

  const cargarPalabras = async () => {
    try {
      const data = await obtenerPalabrasPorCategoria(id.toString());
      setPalabras(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Filtrar palabras según lo que escriba el usuario
  const palabrasFiltradas = palabras.filter(p => 
    p.word.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      {/* Título dinámico según la categoría */}
      <Stack.Screen options={{ title: nombre as string || 'Palabras', headerBackTitle: 'Diccionario' }} />

      {/* Barra de Búsqueda */}
      <View className="bg-white rounded-2xl flex-row items-center px-4 py-3 mb-4 shadow-sm border border-gray-100 mt-2">
        <Ionicons name="search" size={20} color="gray" />
        <TextInput 
            placeholder="Buscar palabra..."
            className="flex-1 ml-2 font-work-regular text-lg text-primary"
            value={filtro}
            onChangeText={setFiltro}
        />
        {filtro.length > 0 && (
            <TouchableOpacity onPress={() => setFiltro('')}>
                <Ionicons name="close-circle" size={20} color="gray" />
            </TouchableOpacity>
        )}
      </View>

      <FlatList
        data={palabrasFiltradas}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white p-4 rounded-2xl mb-3 flex-row items-center justify-between border border-gray-100 shadow-sm"
            onPress={() => setPalabraSeleccionada(item)}
          >
            <Text className="text-lg font-work-bold text-primary">{item.word}</Text>
            <Ionicons name="eye-outline" size={24} color="#your_primary_color" />
          </TouchableOpacity>
        )}
        ListEmptyComponent={
            !loading ? <Text className="text-center text-gray-500 mt-10">No se encontraron palabras.</Text> : null
        }
      />

      {/* MODAL PARA VER LA SEÑA */}
      <Modal visible={palabraSeleccionada !== null} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
            <View className="bg-white w-full rounded-3xl p-4 items-center">
                
                {/* Header del Modal */}
                <View className="w-full flex-row justify-between items-center mb-4">
                    <Text className="text-2xl font-work-black text-primary">
                        {palabraSeleccionada?.word}
                    </Text>
                    <TouchableOpacity onPress={() => setPalabraSeleccionada(null)}>
                        <Ionicons name="close" size={30} color="#333" />
                    </TouchableOpacity>
                </View>

                {/* Contenido Multimedia */}
                <View className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden mb-4">
                    {palabraSeleccionada?.media_type === 'video' ? (
                        <Video
                            source={{ uri: palabraSeleccionada.media_url }}
                            style={{ width: '100%', height: '100%' }}
                            useNativeControls
                            resizeMode={ResizeMode.CONTAIN}
                            isLooping
                            shouldPlay // Reproducir automáticamente al abrir
                        />
                    ) : (
                        <Image 
                            source={{ uri: palabraSeleccionada?.media_url }}
                            className="w-full h-full"
                            resizeMode="contain"
                        />
                    )}
                </View>

                {/* Botón Cerrar */}
                <TouchableOpacity 
                    className="bg-primary w-full py-3 rounded-xl"
                    onPress={() => setPalabraSeleccionada(null)}
                >
                    <Text className="text-white text-center font-bold text-lg">Cerrar</Text>
                </TouchableOpacity>

            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}