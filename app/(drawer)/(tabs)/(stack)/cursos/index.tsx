import { router } from "expo-router";
import React, { useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// IMPORTANTE: Usamos el hook offline
import { useCategoriasOffline } from "@/src/hooks/useOfflineData";

const CursosPantalla = () => {
  // EL HOOK HACE TODO EL TRABAJO (Carga, Loading y Sincronización)
  const { data: categorias, loading } = useCategoriasOffline();
  
  const [hover, setHover] = useState<string | null>(null);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#your_primary_color" />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-primary text-3xl font-work-black text-center mb-4">
        Cursos
      </Text>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={({ item: categoria }) => (
          <View className="mb-5">
            <TouchableOpacity
              onPress={() => setHover(hover === categoria.id ? null : categoria.id)}
              className="bg-primary rounded-3xl py-3 px-5"
            >
              <Text className="text-white text-lg text-center font-work-black">
                {categoria.name}
              </Text>
            </TouchableOpacity>

            {hover === categoria.id && (
              <View className="mt-4 space-y-2">
                {categoria.levels && categoria.levels.length > 0 ? (
                  categoria.levels.map((nivel: any) => (
                    <TouchableOpacity
                      key={nivel.id}
                      onPress={() =>
                        router.push({
                          pathname: "/cursos/categoria/[id]",
                          params: { id: nivel.id },
                        })
                      }
                      className="bg-white border border-primary rounded-2xl py-2 px-4 mb-2"
                    >
                      <Text className="text-primary text-center font-work-regular">
                        {nivel.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-primary text-center font-work-regular italic">
                    Próximamente
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default CursosPantalla;