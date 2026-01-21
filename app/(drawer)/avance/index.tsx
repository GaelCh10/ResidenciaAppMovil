import { useAvanceUsuario } from "@/src/hooks/useOfflineData";
import { supabase } from "@/src/lib/supabase"; // <--- Para obtener el usuario real
import { Stack, useFocusEffect } from "expo-router"; // <--- IMPORTANTE: useFocusEffect
import React, { useCallback, useState } from "react";
import { ActivityIndicator, ScrollView, Text, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function AvanceScreen() {
  const [userId, setUserId] = useState<string | null>(null);

  // 1. OBTENER EL ID REAL DEL USUARIO AL MONTAR
  useFocusEffect(
    useCallback(() => {
      const getUser = async () => {
        const {
          data: { user },
        } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
        }
      };
      getUser();
    }, []),
  );

  // 2. USAR EL HOOK CON EL ID REAL
  // Pasamos userId (puede ser null al principio, el hook debe manejarlo)
  const { estadisticas, resumenGeneral, loading, recargar } = useAvanceUsuario(
    userId || "",
  );

  // 3. RECARGAR DATOS CADA VEZ QUE LA PANTALLA GANA EL FOCO
  useFocusEffect(
    useCallback(() => {
      if (userId) {
        console.log("🔄 Recargando avance visual...");
        recargar();
      }
    }, [userId]), // Se ejecuta cuando tenemos userId o cuando volvemos a la pantalla
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
    <SafeAreaView className="flex-1 bg-secondary-200">
      <Stack.Screen
        options={{ title: "Mi Progreso", headerBackTitle: "Perfil" }}
      />

      <ScrollView contentContainerStyle={{ padding: 16 }}>
        {/* TARJETA RESUMEN GENERAL */}
        <View className="bg-primary rounded-3xl p-6 mb-6 shadow-lg flex-row justify-between items-center">
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

        <Text className="text-primary text-xl font-work-bold mb-4">
          Detalle por Categoría
        </Text>

        {estadisticas.length === 0 && (
          <Text className="text-center text-gray-400 mt-4">
            No se encontró información de cursos.
          </Text>
        )}

        {estadisticas.map((cat) => (
          <View
            key={cat.id}
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm"
          >
            {/* CABECERA */}
            <View className="flex-row justify-between items-center mb-2">
              <Text className="text-lg font-work-black text-gray-800">
                {cat.name}
              </Text>
              <View
                className={`px-2 py-1 rounded-lg ${cat.porcentaje === 100 ? "bg-green-100" : "bg-gray-100"}`}
              >
                <Text
                  className={`font-bold ${cat.porcentaje === 100 ? "text-green-700" : "text-gray-500"}`}
                >
                  {cat.porcentaje}%
                </Text>
              </View>
            </View>

            {/* BARRA */}
            <View className="h-2 bg-gray-100 rounded-full mb-4 overflow-hidden">
              <View
                className="h-full bg-primary"
                style={{ width: `${cat.porcentaje}%` }}
              />
            </View>

            {/* NIVELES */}
            {cat.niveles.map((nivel: any) => (
              <View
                key={nivel.id}
                className="mt-2 border-t border-gray-100 pt-2"
              >
                <View className="flex-row justify-between items-center">
                  <Text className="text-gray-600 font-work-bold">
                    {nivel.name}
                  </Text>
                  <Text className="text-xs text-gray-400">
                    {nivel.completados}/{nivel.totalCursos} Cursos
                  </Text>
                </View>

                {/* Indicadores visuales de cursos */}
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
