import SmartMedia from '@/components/shared/SmartMedia';
import { useLeccionesOffline } from '@/src/hooks/useOfflineData';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useState } from 'react';
import { ActivityIndicator, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function VisorLeccion() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: lecciones, loading } = useLeccionesOffline(id ? id.toString() : '');
  const [indiceActual, setIndiceActual] = useState(0);

  const siguienteLeccion = () => {
    if (indiceActual < lecciones.length - 1) {
      setIndiceActual(indiceActual + 1);
    } else {
      router.push({ pathname: "/cursos/curso/evaluacion/[id]", params: { id: id.toString() } });
    }
  };

  const anteriorLeccion = () => {
    if (indiceActual > 0) setIndiceActual(indiceActual - 1);
  };

  if (loading) return <View className="flex-1 bg-secondary-200 justify-center items-center"><ActivityIndicator size="large" color="#2563EB" /></View>;
  if (lecciones.length === 0) return <View className="flex-1 bg-secondary-200 justify-center items-center p-4"><Text>Sin contenido.</Text></View>;

  const leccionActual = lecciones[indiceActual];
  const esUltima = indiceActual === lecciones.length - 1;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200">
      <Stack.Screen options={{ title: leccionActual.title || 'Lección', headerBackTitle: 'Cursos' }} />
      <ScrollView contentContainerStyle={{ flexGrow: 1, padding: 20 }}>
        
        <View className="h-64 w-full bg-black rounded-3xl overflow-hidden mb-6 shadow-lg border-4 border-white">
          {leccionActual.content_url ? (
            <SmartMedia
              uri={leccionActual.content_url}
              type={leccionActual.type}
              resizeMode="contain"
              useNativeControls={true}
              isLooping={true}
            />
          ) : (
            <View className="flex-1 justify-center items-center"><Text className="text-gray-400">Sin video de seña</Text></View>
          )}
        </View>

        <View className="bg-white rounded-3xl p-6 shadow-sm mb-6 relative overflow-hidden">         
          <View className="items-center">
            {leccionActual.image_url && (
               <View className="w-32 h-32 mb-4 rounded-full bg-gray-50 border-4 border-secondary-100 items-center justify-center overflow-hidden shadow-sm">
                  <Image 
                      source={{ uri: leccionActual.image_url }} 
                      className="w-full h-full" 
                      resizeMode="cover"
                  />
               </View>
            )}

            <Text className="text-gray-400 font-work-bold text-xs tracking-widest mb-1">Palabra en español</Text>
            <Text className="text-primary text-4xl font-work-black text-center mb-6 capitalize">
              {leccionActual.spanish_text}
            </Text>

            <View className="h-[1px] w-full bg-gray-100 mb-6" />

            <Text className="text-gray-400 font-work-bold text-xs tracking-widest mb-1">Deletreo</Text>
            <Text className="text-secondary-500 text-5xl text-center" 
              style={{ fontFamily: 'LsmVulpy', 
                       letterSpacing: 12,
              }}>
              {leccionActual.lsm_text_code}
            </Text>
          </View>
        </View>
      </ScrollView>

      <View className="flex-row justify-between items-center p-6 bg-white border-t border-gray-100 rounded-t-3xl shadow-[0_-10px_20px_rgba(0,0,0,0.05)]">
        <TouchableOpacity onPress={anteriorLeccion} disabled={indiceActual === 0} className={`flex-row items-center p-3 ${indiceActual === 0 ? 'opacity-30' : 'opacity-100'}`}>
          <Ionicons name="arrow-back-circle" size={44} color="#64748B" />
        </TouchableOpacity>

        <Text className="font-work-bold text-gray-400 text-lg">
          {indiceActual + 1} / {lecciones.length}
        </Text>

        <TouchableOpacity onPress={siguienteLeccion} className="flex-row items-center bg-primary px-6 py-4 rounded-2xl shadow-lg shadow-blue-200">
          <Text className="text-white font-work-bold text-lg mr-2">{esUltima ? 'Evaluación' : 'Siguiente'}</Text>
          <Ionicons name={esUltima ? "checkmark-circle" : "arrow-forward"} size={24} color="white" />
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}