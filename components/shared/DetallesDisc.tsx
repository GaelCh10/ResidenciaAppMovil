import React from "react";
import { Image, Text, View } from "react-native";

interface Props {
  img: string;
  palabra: string;
}

const DetallesDic: React.FC<Props> = ({ img, palabra }) => {
  return (
    <View className="flex-row items-center bg-white border-l-4 border-primary rounded-2xl p-3 mb-3 mx-2 shadow-sm">
      <Image
        source={{ uri: img }}
        resizeMode="contain"
        className="w-24 h-24 rounded-lg mr-3"
      />
      <View className="flex-1 items-center">
        <Text className="font-work-black text-lg text-primary">{palabra}</Text>
        <Text className="font-work-regular text-base text-gray-700">{palabra}</Text>
      </View>
    </View>
  );
};

export default DetallesDic;
