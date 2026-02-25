import SmartImage from "@/components/shared/SmartImage";
import { Ionicons } from "@expo/vector-icons";
import { DrawerActions } from "@react-navigation/native";
import { useNavigation, useRouter } from "expo-router";
import React from "react";
import {
  ActivityIndicator,
  FlatList,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { useDiccionarioCategoriasOffline } from "@/src/hooks/useOfflineData";

export default function DiccionarioHome() {
  const router = useRouter();
  const navigation = useNavigation();
  const { data: categorias, loading } = useDiccionarioCategoriasOffline();

  if (loading) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-2">
      <View className="flex-row justify-between items-center mb-6 mt-2">
        <View>
            <Text className="text-3xl font-black text-secondary">Diccionario</Text>
            <Text className="text-gray-500 text-sm">Vocabulario en LSM</Text>
        </View>
        <TouchableOpacity 
            onPress={() => navigation.dispatch(DrawerActions.toggleDrawer())} 
            className="bg-white p-3 rounded-full shadow-sm"
        >
            <Ionicons name="menu" size={24} color="#0b1973" />
        </TouchableOpacity>
      </View>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-between" }}
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <TouchableOpacity
            className="bg-white w-[48%] rounded-3xl p-4 mb-4 shadow-sm items-center border border-gray-100"
            onPress={() =>
              router.push({
                pathname: "/diccionario/categoria/[id]",
                params: { id: item.id, nombre: item.name },
              })
            }
          >
            <SmartImage
              uri={item.image_url}
              className="w-20 h-20 mb-3 rounded-lg"
              resizeMode="contain"
            />
            <Text className="text-secondary font-work-bold text-center text-lg">
              {item.name}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}