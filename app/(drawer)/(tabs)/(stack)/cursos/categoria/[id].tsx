import SmartMedia from '@/components/shared/SmartMedia';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React from 'react';
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useCursosOffline } from '@/src/hooks/useOfflineData';

export default function ListaCursosPorNivel() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const { data: cursos, loading } = useCursosOffline(id ? id.toString() : '');

  if (loading) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#your_primary_color" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
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
              router.push({
                pathname: "/cursos/curso/tema/[id]",
                params: { id: item.id }
              });
            }}
          >
            <View className="w-20 h-20 rounded-2xl bg-gray-200 overflow-hidden mr-3">
              <SmartMedia
                uri={item.cover_image_url}
                type="image"
                resizeMode="cover"
                className="w-full h-full"
              />
            </View>

            <View className="flex-1 ml-4">
              <Text className="text-primary text-lg font-work-bold mb-1">
                {item.title}
              </Text>
              <Text className="text-gray-500 text-xs font-work-regular" numberOfLines={2}>
                {item.description}
              </Text>
              <View className="mt-2 bg-secondary-100 self-start px-2 py-1 rounded-lg">
                <Text className="text-primary text-xs font-bold">Comenzar</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#333" />
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}