import SmartMedia from '@/components/shared/SmartMedia';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
// IMPORTANTE: Hook offline
import { useLeccionesOffline } from '@/src/hooks/useOfflineData';

export default function VisorLeccion() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Usamos el Hook
  const { data: lecciones, loading } = useLeccionesOffline(id ? id.toString() : '');
  
  const [indiceActual, setIndiceActual] = useState(0);

  // Lógica para avanzar
  const siguienteLeccion = () => {
    if (indiceActual < lecciones.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      router.push({
        pathname: "/cursos/curso/evaluacion/[id]",
        params: { id: id.toString() }
      });
    }
  };

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
        {/* MULTIMEDIA */}
        <View className="h-64 w-full bg-black rounded-xl overflow-hidden mb-6">
          {leccionActual.content_url ? (
            <SmartMedia
              uri={leccionActual.content_url}
              type={leccionActual.type}
              resizeMode="contain"
              useNativeControls={true}
              isLooping={false}
            />
          ) : (
            <View className="flex-1 justify-center items-center">
              <Text className="text-gray-400">Sin multimedia</Text>
            </View>
          )}
        </View>

        {/* TEXTOS */}
        <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 items-center">
          <Text className="text-gray-500 font-work-regular text-sm mb-1">ESPAÑOL</Text>
          <Text className="text-primary text-3xl font-work-black text-center mb-6">
            {leccionActual.spanish_text}
          </Text>

          <View className="h-[1px] w-full bg-gray-200 mb-6" />

          <Text className="text-gray-500 font-work-regular text-sm mb-1">GLOSA / DELETREO</Text>
          <Text
            className="text-secondary-500 text-4xl text-center"
            style={{ fontFamily: 'LsmVulpy' }}
          >
            {leccionActual.lsm_text_code}
          </Text>
        </View>
      </ScrollView>

      {/* CONTROLES */}
      <View className="flex-row justify-between items-center p-6 bg-white border-t border-gray-100 rounded-t-3xl">
        <TouchableOpacity
          onPress={anteriorLeccion}
          disabled={indiceActual === 0}
          className={`flex-row items-center p-3 ${indiceActual === 0 ? 'opacity-30' : 'opacity-100'}`}
        >
          <Ionicons name="arrow-back-circle" size={40} color="#333" />
        </TouchableOpacity>

        <Text className="font-work-bold text-gray-500 text-lg">
          {indiceActual + 1} / {lecciones.length}
        </Text>

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