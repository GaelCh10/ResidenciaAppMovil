import Busqueda from "@/components/shared/Busqueda";
import React from "react";
import { SafeAreaView, Text, View } from "react-native";


const DiccionarioPantalla: React.FC = () => {
  return (
    <SafeAreaView className="flex-1 bg-secondary-200">
      <View className="flex-1 items-center">
        <Text className="text-primary font-work-black text-4xl mt-4 mb-2">
          Diccionario
        </Text>
        <Busqueda />
      </View>
    </SafeAreaView>
  );
};

export default DiccionarioPantalla;
