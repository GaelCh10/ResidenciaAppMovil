import { Leccion, obtenerLeccionesPorCurso } from '@/src/services/cursos';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av'; // Importamos el video
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useRef, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function VisorLeccion() {
  const { id } = useLocalSearchParams(); // ID del Curso
  const router = useRouter();
  const videoRef = useRef(null);

  const [lecciones, setLecciones] = useState<Leccion[]>([]);
  const [indiceActual, setIndiceActual] = useState(0); // Controla en qué página estamos (0, 1, 2...)
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarLecciones();
  }, [id]);

  const cargarLecciones = async () => {
    try {
      const data = await obtenerLeccionesPorCurso(id.toString());
      setLecciones(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Lógica para avanzar
  const siguienteLeccion = () => {
    if (indiceActual < lecciones.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      // Si ya no hay más lecciones, vamos a la evaluación (o al resumen)
      // Ajusta la ruta a donde tengas tu pantalla de evaluación
      router.push({
        pathname: "/cursos/curso/evaluacion/[id]",
        params: { id: id.toString() } // Pasamos el ID del curso
      });
    }
  };

  // Lógica para retroceder
  const anteriorLeccion = () => {
    if (indiceActual > 0) {
      setIndiceActual(indiceActual - 1);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#your_primary_color" />
      </View>
    );
  }

  if (lecciones.length === 0) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center p-4">
        <Text className="text-primary font-work-bold text-lg text-center">
          Este curso aún no tiene contenido.
        </Text>
        <TouchableOpacity onPress={() => router.back()} className="mt-4">
          <Text className="text-blue-500">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const leccionActual = lecciones[indiceActual];
  const esUltima = indiceActual === lecciones.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200">
      <Stack.Screen options={{ title: leccionActual.title || 'Lección', headerBackTitle: 'Cursos' }} />

      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        
        {/* 1. SECCIÓN MULTIMEDIA (VIDEO O IMAGEN) */}
        <View className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-200 h-64 justify-center items-center mb-6 relative">
          {leccionActual.type === 'video' && leccionActual.content_url ? (
            <Video
              ref={videoRef}
              source={{ uri: leccionActual.content_url }}
              style={{ width: '100%', height: '100%' }}
              useNativeControls
              resizeMode={ResizeMode.CONTAIN}
              isLooping
            />
          ) : leccionActual.content_url ? (
            <Image
              source={{ uri: leccionActual.content_url }}
              className="w-full h-full"
              resizeMode="contain"
            />
          ) : (
            <Text className="text-gray-400">Sin multimedia</Text>
          )}
        </View>

        {/* 2. SECCIÓN DE TEXTOS */}
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 items-center">
          
          {/* Texto en Español */}
          <Text className="text-gray-500 font-work-regular text-sm mb-1">ESPAÑOL</Text>
          <Text className="text-primary text-3xl font-work-black text-center mb-6">
            {leccionActual.spanish_text}
          </Text>

          {/* Divisor */}
          <View className="h-[1px] w-full bg-gray-200 mb-6" />

          {/* Texto en LSM (Fuente Especial) */}
          <Text className="text-gray-500 font-work-regular text-sm mb-1">GLOSA / DELETREO</Text>
          {/* Aquí aplicamos la fuente lsmvulpy. Si no carga, se verá normal */}
          <Text 
            className="text-secondary-500 text-4xl text-center" 
            style={{ fontFamily: 'LsmVulpy' }} 
          >
            {leccionActual.lsm_text_code}
          </Text>
        </View>

      </ScrollView>

      {/* 3. BARRA DE NAVEGACIÓN INFERIOR */}
      <View className="flex-row justify-between items-center p-6 bg-white border-t border-gray-100 rounded-t-3xl">
        
        {/* Botón Anterior */}
        <TouchableOpacity 
          onPress={anteriorLeccion} 
          disabled={indiceActual === 0}
          className={`flex-row items-center p-3 ${indiceActual === 0 ? 'opacity-30' : 'opacity-100'}`}
        >
          <Ionicons name="arrow-back-circle" size={40} color="#333" />
        </TouchableOpacity>

        {/* Indicador de página (Ej: 1 / 5) */}
        <Text className="font-work-bold text-gray-500 text-lg">
          {indiceActual + 1} / {lecciones.length}
        </Text>

        {/* Botón Siguiente / Finalizar */}
        <TouchableOpacity 
          onPress={siguienteLeccion}
          className="flex-row items-center bg-primary px-5 py-3 rounded-2xl shadow-sm"
        >
          <Text className="text-white font-work-bold text-lg mr-2">
            {esUltima ? 'Evaluación' : 'Siguiente'}
          </Text>
          <Ionicons 
            name={esUltima ? "checkmark-circle" : "arrow-forward"} 
            size={24} 
            color="white" 
          />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}