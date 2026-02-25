import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';


const JUEGOS_DISPONIBLES = [
  {
    id: 'memorama',
    nombre: 'Memorama',
    descripcion: 'Encuentra los pares de seña y palabra.',
    imagen: require('@/assets/images/memorama.png'), 
    color: 'bg-purple-50', 
    ruta: '/juegos/memorama' 
  },
  {
    id: 'formar',
    nombre: 'Formar Palabras',
    descripcion: 'Une las letras en LSM para crear la palabra.',
    imagen: require('@/assets/images/buscar.jpg'),
    color: 'bg-blue-50',
    ruta: '/juegos/formar'
  },
  {
    id: 'escribir',
    nombre: 'Escribir Seña',
    descripcion: 'Mira la seña y escribe qué significa.',
    imagen: require('@/assets/images/escribeS.png'),
    color: 'bg-green-50',
    ruta: '/juegos/escribir'
  },
  {
    id: 'ordenar',
    nombre: 'Ordenar Palabra',
    descripcion: 'Ordena las letras para descubrir el mensaje.',
    imagen: require('@/assets/images/ordenar.png'),
    color: 'bg-orange-50',
    ruta: '/juegos/ordenar'
  },
  {
    id: 'sopa',
    nombre: 'Sopa de Letras',
    descripcion: 'Busca las palabras ocultas en LSM.',
    imagen: require('@/assets/images/sopa.webp'),
    color: 'bg-red-50',
    ruta: '/juegos/sopa'
  },
  {
    id: 'pares',
    nombre: 'Pares de Señas',
    descripcion: 'Busca el par de cada palabra en LSM.',
    imagen: require('@/assets/images/pares.png'),
    color: 'bg-pink-50',
    ruta: '/juegos/pares'
  },
];

export default function MenuJuegos() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-secondary text-4xl font-work-black text-center mb-2">
        Juegos
      </Text>
      <Text className="text-gray-500 text-center mb-6 font-work-regular">
        Aprende divirtiéndote
      </Text>

      <FlatList
        data={JUEGOS_DISPONIBLES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            activeOpacity={0.8}
            className={`w-full rounded-3xl p-4 mb-4 shadow-sm flex-row items-center bg-blueone border-b-4 border-gray-100`}
            onPress={() => {
              router.push({
                pathname: "/juegos/categorias",
                params: { 
                    tituloJuego: item.nombre,
                    rutaJuego: item.ruta 
                }
              });
            }}
          >
            <View className={`w-16 h-16 rounded-2xl ${item.color} mr-4 overflow-hidden shadow-sm items-center justify-center p-1`}>
              <Image 
                source={item.imagen} 
                style={{ width: '100%', height: '100%' }}
                resizeMode="contain" 
              />
            </View>

            <View className="flex-1">
              <Text className="text-xl font-work-bold text-white mb-1">
                {item.nombre}
              </Text>
              <Text className="text-xs text-white font-work-regular leading-4 opacity-90">
                {item.descripcion}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" className="ml-2" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}