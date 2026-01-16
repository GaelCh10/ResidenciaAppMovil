import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Definimos los juegos disponibles manualmente
const JUEGOS_DISPONIBLES = [
  {
    id: 'memorama',
    nombre: 'Memorama',
    descripcion: 'Encuentra los pares de seña y palabra.',
    icono: 'grid', // Nombre de icono de Ionicons
    color: 'bg-purple-500',
    ruta: '/juegos/memorama' // Ruta base del juego
  },
  {
    id: 'formar',
    nombre: 'Formar Palabras',
    descripcion: 'Une las letras en LSM para crear la palabra.',
    icono: 'construct',
    color: 'bg-blue-500',
    ruta: '/juegos/formar'
  },
  {
    id: 'escribir',
    nombre: 'Escribir Seña',
    descripcion: 'Mira la seña y escribe qué significa.',
    icono: 'pencil',
    color: 'bg-green-500',
    ruta: '/juegos/escribir'
  },
  {
    id: 'ordenar',
    nombre: 'Ordenar Palabra',
    descripcion: 'Ordena las letras para descubrir el mensaje.',
    icono: 'swap-horizontal',
    color: 'bg-orange-500',
    ruta: '/juegos/ordenar'
  },
  {
    id: 'sopa',
    nombre: 'Sopa de Letras',
    descripcion: 'Busca las palabras ocultas en LSM.',
    icono: 'search',
    color: 'bg-red-500',
    ruta: '/juegos/sopa'
  },

  {
    id: 'pares',
    nombre: 'Pares de Señas',
    descripcion: 'Busca el par de cada palabra en LSM.',
    icono: 'swap-horizontal-outline',
    color: 'bg-red-500',
    ruta: '/juegos/pares'
  },
];





export default function MenuJuegos() {
  const router = useRouter();

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-primary text-3xl font-work-black text-center mb-2">
        Zona de Juegos
      </Text>
      <Text className="text-gray-500 text-center mb-6 font-work-regular">
        Aprende divirtiéndote
      </Text>

      <FlatList
        data={JUEGOS_DISPONIBLES}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            className={`w-full rounded-3xl p-5 mb-4 shadow-sm flex-row items-center bg-white border-b-4 border-gray-100`}
            onPress={() => {
              // ALERTA: Aquí está la magia.
              // En lugar de ir directo al juego, vamos al SELECTOR DE CATEGORÍAS
              // y le pasamos qué juego queremos jugar y a dónde ir después.
              router.push({
                pathname: "/juegos/categorias",
                params: { 
                    tituloJuego: item.nombre,
                    rutaJuego: item.ruta 
                }
              });
            }}
          >
            {/* Círculo con Icono */}
            <View className={`w-16 h-16 rounded-2xl ${item.color} justify-center items-center mr-4 shadow-md`}>
              <Ionicons name={item.icono as any} size={32} color="white" />
            </View>

            {/* Textos */}
            <View className="flex-1">
              <Text className="text-xl font-work-bold text-primary mb-1">
                {item.nombre}
              </Text>
              <Text className="text-xs text-gray-500 font-work-regular leading-4">
                {item.descripcion}
              </Text>
            </View>

            <Ionicons name="chevron-forward" size={24} color="#CBD5E1" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}