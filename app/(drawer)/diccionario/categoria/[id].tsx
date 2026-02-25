import SmartMedia from '@/components/shared/SmartMedia';
import { useDiccionarioPalabrasOffline } from '@/src/hooks/useOfflineData';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, FlatList, Modal, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface EntradaDiccionario {
  id: string;
  word: string;
  media_url?: string;
  media_type?: string;
}

export default function ListaPalabras() {
  const { id, nombre } = useLocalSearchParams();
  const { data: palabras, loading } = useDiccionarioPalabrasOffline(id ? id.toString() : '');
  const [filtro, setFiltro] = useState('');
  const [palabraSeleccionada, setPalabraSeleccionada] = useState<EntradaDiccionario | null>(null);

  const palabrasFiltradas = palabras.filter((p: any) =>
    p.word.toLowerCase().includes(filtro.toLowerCase())
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ title: nombre as string || 'Palabras', headerBackTitle: 'Diccionario' }} />

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

      {loading ? (
        <ActivityIndicator size="large" color="#2563EB" className="mt-10"/>
      ) : (
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
                <Ionicons name="eye-outline" size={24} color="#2563EB" />
            </TouchableOpacity>
            )}
            ListEmptyComponent={
            <Text className="text-center text-gray-500 mt-10">No se encontraron palabras.</Text>
            }
        />
      )}

      <Modal visible={palabraSeleccionada !== null} animationType="fade" transparent={true}>
        <View className="flex-1 bg-black/80 justify-center items-center px-4">
          <View className="bg-white w-full rounded-3xl p-4 items-center">

            <View className="w-full flex-row justify-between items-center mb-4">
              <Text className="text-2xl font-work-black text-primary">
                Palabra en español: {palabraSeleccionada?.word}
              </Text>

              <TouchableOpacity onPress={() => setPalabraSeleccionada(null)}>
                <Ionicons name="close" size={30} color="#333" />
              </TouchableOpacity>
            </View>
             <View className="w-full flex-row  mb-2"> 
            <Text className="text-xl  text-secondary font-work-black flex-row w-1/4" >
            Deletreo: 
            </Text>
              <Text className="text-xl  text-gray-700 flex-row " 
              style={{ fontFamily: 'LsmVulpy',                 
                       letterSpacing: 12,
                       fontSize: 22,
                       
              }}>
                {palabraSeleccionada?.word}
              </Text>


              </View>
            <View className="w-full h-64 bg-gray-100 rounded-2xl overflow-hidden mb-6">
              <SmartMedia
                uri={palabraSeleccionada?.media_url}
                type={palabraSeleccionada?.media_type}
                resizeMode="contain"
                useNativeControls={true}
                autoPlay={true}
                isLooping={true}
              />
            </View>

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