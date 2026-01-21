import React, { useState } from 'react'; // Eliminamos useEffect manual
import { View, Text, FlatList, TouchableOpacity, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import SmartImage from '@/components/shared/SmartImage';

// IMPORTANTE: Hook Offline
import { useDiccionarioCategoriasOffline } from '@/src/hooks/useOfflineData';

export default function DiccionarioHome() {
  const router = useRouter();
  
  // EL HOOK HACE EL TRABAJO DURO (Carga DB local + Sincronización)
  const { data: categorias, loading } = useDiccionarioCategoriasOffline();

  if (loading) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-primary text-3xl font-work-black text-center mb-6">
        Diccionario LSM
      </Text>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        numColumns={2} 
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white w-[48%] rounded-3xl p-4 mb-4 shadow-sm items-center border border-gray-100"
            onPress={() => router.push({
                pathname: '/diccionario/categoria/[id]',
                params: { id: item.id, nombre: item.name }
            })}
          >
            <SmartImage 
                uri={item.image_url}
                className="w-20 h-20 mb-3 rounded-lg"
                resizeMode="contain"
            />
            <Text className="text-primary font-work-bold text-center text-lg">
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}