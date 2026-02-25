import { CategoriaDiccionario, obtenerCategoriasDiccionario } from '@/src/services/diccionario';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function SelectorCategoriaJuego() {
  const router = useRouter();
  const { tituloJuego, rutaJuego } = useLocalSearchParams(); 

  const [categorias, setCategorias] = useState<CategoriaDiccionario[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarCategorias();
  }, []);

  const cargarCategorias = async () => {
    try {
      let data = await obtenerCategoriasDiccionario();
      const juegosSinAbecedario = ["Formar Palabras", "Escribir Seña", "Ordenar Palabra", "Sopa de Letras"];
      
      if (tituloJuego && juegosSinAbecedario.includes(tituloJuego as string)) {
        data = data.filter(cat => cat.name.toLowerCase() !== 'abecedario');
      }

      setCategorias(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <View className="flex-1 bg-secondary-200 justify-center items-center"><ActivityIndicator size="large" color="#2563EB" /></View>;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between mb-4 mt-2">
        <TouchableOpacity onPress={() => router.back()} className="bg-white p-3 rounded-full shadow-sm">
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text className="text-xl font-work-black text-primary">Temas</Text>
        <View style={{width: 48}} /> 
      </View>

      <View className="bg-white p-4 rounded-2xl mb-6 flex-row items-center shadow-sm border border-gray-100">
        <View className="bg-blue-100 p-2 rounded-full mr-3">
            <Ionicons name="game-controller-outline" size={20} color="#2563EB" />
        </View>
        <Text className="text-gray-600 font-work-medium flex-1 text-sm">
            Vas a jugar <Text className="font-bold text-primary">{tituloJuego}</Text>.{"\n"}
            Elige un vocabulario para comenzar.
        </Text>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: 'space-between' }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.7}
            className="bg-white w-[48%] rounded-3xl p-4 mb-4 shadow-sm items-center border-b-4 border-gray-100"
            onPress={() => {
              router.push({
                pathname: `${rutaJuego}/[id]` as any, 
                params: { id: item.id }
              });
            }}
          >
            <View className="w-20 h-20 mb-3 bg-gray-50 rounded-full p-2 items-center justify-center">
                <Image source={{ uri: item.image_url || 'https://via.placeholder.com/100' }} className="w-full h-full" resizeMode="contain" />
            </View>
            <Text className="text-primary font-work-bold text-center text-lg leading-5">{item.name}</Text>
            <View className="bg-blue-50 px-3 py-1 rounded-full mt-2">
                <Text className="text-blue-500 text-[10px] font-bold">JUGAR</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}