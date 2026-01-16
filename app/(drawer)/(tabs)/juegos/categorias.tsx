import { CategoriaDiccionario, obtenerCategoriasDiccionario } from '@/src/services/diccionario';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectorCategoriaJuego() {
  const router = useRouter();
  // Recibimos qué juego estamos jugando (ej: "Memorama") y su ruta base (ej: "/juegos/memorama")
  const { tituloJuego, rutaJuego } = useLocalSearchParams(); 

  const [categorias, setCategorias] = useState<CategoriaDiccionario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      // Reutilizamos el servicio del diccionario ¡Eficiencia pura!
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
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ title: 'Selecciona Tema', headerBackTitle: 'Juegos' }} />

      <Text className="text-primary text-xl font-work-bold text-center my-4">
        ¿Qué tema quieres jugar en {tituloJuego}?
      </Text>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white w-[48%] rounded-3xl p-4 mb-4 shadow-sm items-center border border-gray-100"
            onPress={() => {
              // AQUÍ REDIRIGIMOS AL JUEGO ESPECÍFICO
              // Construimos la ruta: /juegos/memorama/[id]
              router.push({
                pathname: `${rutaJuego}/[id]` as any, 
                params: { id: item.id }
              });
            }}
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