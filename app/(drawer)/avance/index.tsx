import { useAvanceUsuario } from "@/src/hooks/useOfflineData";
import { supabase } from "@/src/lib/supabase";
import { Ionicons } from "@expo/vector-icons"; // Icono Menu
import { DrawerActions } from "@react-navigation/native"; // Acción Drawer
import { Stack, useFocusEffect, useNavigation } from "expo-router";
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AvanceScreen() {
  const [userId, setUserId] = useState<string | null>(null);
  const navigation = useNavigation();

  useFocusEffect(
    useCallback(() => {
      const getUser = async () => {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) setUserId(user.id);
      };
      getUser();
    }, []),
  );

  const { estadisticas, resumenGeneral, loading, recargar } = useAvanceUsuario(userId || "");

  useFocusEffect(
    useCallback(() => {
      if (userId) {
        console.log("Recargando avance visual...");
        recargar();
      }
    }, [userId]),
  );

  if (loading || !userId) {
    return (
      <View className="flex-1 justify-center items-center bg-secondary-200">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text className="text-gray-400 mt-4">Calculando progreso...</Text>
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-2">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row justify-between items-center mb-6 mt-2">
        <View>
            <Text className="text-3xl font-black text-secondary">Mi Progreso</Text>
            <Text className="text-gray-500 text-sm">Tus logros hasta hoy</Text>
        </View>
        <TouchableOpacity 
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} 
            className="bg-white p-3 rounded-full shadow-sm"
        >
            <Ionicons name="menu" size={24} color="#0b1973" />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        <View className="bg-blueone rounded-3xl p-6 mb-6 shadow-lg flex-row justify-between items-center">
          <View>
            <Text className="text-white text-lg font-work-regular opacity-80">
              Cursos Completados
            </Text>
            <Text className="text-white text-4xl font-work-black">
              {resumenGeneral.completados}{" "}
              <Text className="text-xl">/ {resumenGeneral.totalCursos}</Text>
            </Text>
          </View>
          <View className="items-center bg-white/20 p-4 rounded-2xl">
            <Text className="text-white font-bold text-2xl">
              {resumenGeneral.promedio || 0}/10
            </Text>
            <Text className="text-white text-xs">Promedio</Text>
          </View>
        </View>

        <Text className="text-secondary text-xl font-work-bold mb-4">
          Detalle por Categoría
        </Text>

        {estadisticas.length === 0 && (
          <Text className="text-center text-gray-400 mt-4">
            No se encontró información de cursos.
          </Text>
        )}

        {estadisticas.map((cat) => (
          <View key={cat.id} className="bg-white rounded-2xl p-4 mb-4 shadow-sm">
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-work-black text-gray-800">
                {cat.name}
              </Text>
              <View className={`px-2 py-1 rounded-lg ${cat.porcentaje === 10 ? "bg-green-100" : "bg-gray-100"}`}>
                <Text className={`font-bold ${cat.porcentaje === 10 ? "text-green-700" : "text-gray-500"}`}>
                  {cat.porcentaje}%
                </Text>
              </View>
            </View>

            <View className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: `${cat.porcentaje}%` }}
              />
            </View>
            {cat.niveles.map((nivel: any) => (
              <View key={nivel.id} className="mt-2 border-t border-gray-100 pt-2">
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 font-work-bold">
                    {nivel.name}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {nivel.completados}/{nivel.totalCursos} Cursos
                  </Text>
                </View>

                <View className="mt-2 flex-row flex-wrap gap-2">
                  {nivel.cursos.map((curso: any) => (
                    <View
                      key={curso.id}
                      className={`w-3 h-3 rounded-full ${curso.completado ? "bg-green-500" : "bg-gray-200"}`}
                    />
                  ))}
                </View>
              </View>
            ))}
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}