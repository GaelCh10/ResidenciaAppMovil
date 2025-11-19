import { cursosMock } from "@/store/cursos.mock";
import { router } from "expo-router";
import React, { useState } from "react";
import { FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const CursosPantalla = () => {
  const [hover, setHover] = useState<number | null>(null);

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-primary text-3xl font-work-black text-center mb-4">
        Cursos
      </Text>

      <FlatList
        data={cursosMock}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item: nivel }) => (
          <View className="mb-5">
            <TouchableOpacity
              onPress={() => setHover(hover === nivel.id ? null : nivel.id)}
              className="bg-primary rounded-3xl py-3 px-5"
            >
              <Text className="text-white text-lg text-center font-work-black">
                {nivel.nombre}
              </Text>
            </TouchableOpacity>

            {hover === nivel.id && (
              <View className="mt-4 space-y-2">
                {nivel.categoria.map((cat) => (
                  <TouchableOpacity
                    key={cat.id}
                    onPress={() =>
                      router.push({
                        pathname: "/cursos/categoria/[id]",
                        params: { id: cat.id.toString() },
                      })
                    }
                    className="bg-white border border-primary rounded-2xl py-2 px-4"
                  >
                    <Text className="text-primary text-center font-work-regular">
                      {cat.nombre}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default CursosPantalla;
