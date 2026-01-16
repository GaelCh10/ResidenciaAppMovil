import { Curso, obtenerCursosPorNivel } from '@/src/services/cursos';
import { Ionicons } from '@expo/vector-icons'; // Iconos para estética
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, Image, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ListaCursosPorNivel() {
  const { id } = useLocalSearchParams(); // Este "id" es el level_id que enviaste desde la pantalla anterior
  const router = useRouter();
  
  const [cursos, setCursos] = useState<Curso[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (id) {
      cargarCursos();
    }
  }, [id]);

  const cargarCursos = async () => {
    try {
      // Convertimos id a string por seguridad, ya que searchParams puede ser array
      const data = await obtenerCursosPorNivel(id.toString());
      setCursos(data);
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
      {/* Configuración del Header nativo para que diga "Cursos" o volver atrás */}
      <Stack.Screen options={{ title: 'Cursos Disponibles', headerBackTitle: 'Volver' }} />

      <Text className="text-primary text-2xl font-work-black mb-6 mt-2">
        Selecciona un Curso
      </Text>

      <FlatList
        data={cursos}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 20 }}
        ListEmptyComponent={
          <Text className="text-center text-gray-500 mt-10 font-work-regular">
            No hay cursos en este nivel todavía.
          </Text>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white rounded-3xl p-4 mb-4 shadow-sm border border-gray-100 flex-row items-center"
            onPress={() => {
              // AQUÍ NAVEGAMOS AL DETALLE DEL CURSO (LECCIONES)
              // Asumo que tu ruta es /cursos/curso/tema/[id] o similar
              // Ajusta esta ruta a donde quieras ir después
              router.push({
                pathname: "/cursos/curso/tema/[id]", 
                params: { id: item.id } 
              });
            }}
          >
            {/* Imagen del Curso */}
            <Image
              source={{ uri: item.cover_image_url || 'https://via.placeholder.com/100' }}
              className="w-20 h-20 rounded-2xl bg-gray-200"
              resizeMode="cover"
            />

            {/* Texto del Curso */}
            <View className="flex-1 ml-4">
              <Text className="text-primary text-lg font-work-bold mb-1">
                {item.title}
              </Text>
              <Text 
                className="text-gray-500 text-xs font-work-regular" 
                numberOfLines={2}
              >
                {item.description}
              </Text>
              
              {/* Barra de progreso simulada o etiqueta */}
              <View className="mt-2 bg-secondary-100 self-start px-2 py-1 rounded-lg">
                <Text className="text-primary text-xs font-bold">Comenzar</Text>
              </View>
            </View>

            {/* Icono de flecha */}
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}