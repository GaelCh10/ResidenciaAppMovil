import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, Image, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { obtenerCategoriasDiccionario, CategoriaDiccionario } from '@/src/services/diccionario';

export default function DiccionarioHome() {
  const router = useRouter();
  const [categorias, setCategorias] = useState<CategoriaDiccionario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      const data = await obtenerCategoriasDiccionario();
      setCategorias(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#your_primary_color" />
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
        numColumns={2} // Diseño en rejilla (2 columnas)
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white w-[48%] rounded-3xl p-4 mb-4 shadow-sm items-center border border-gray-100"
            onPress={() => router.push({
                pathname: '/diccionario/categoria/[id]',
                params: { id: item.id, nombre: item.name } // Pasamos nombre para el título
            })}
          >
            <Image 
                source={{ uri: item.image_url || 'https://via.placeholder.com/100' }}
                className="w-20 h-20 mb-3"
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