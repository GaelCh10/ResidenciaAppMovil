import { juegosMock } from "@/store/juegos.mock";
import { router } from "expo-router";
import { FlatList, Image, Text, TouchableOpacity, View } from "react-native";

const JuegosPantalla = () => {
  return (
    <View className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-primary text-4xl font-work-black text-center mb-4">
        Juegos Didácticos
      </Text>

      <FlatList
        data={juegosMock}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/juegos/memorama/[id]", //tentativa
                params: { id: item.id.toString() },
              })
            }
            className="flex-row items-center bg-white rounded-2xl shadow-md p-3 mb-4 border border-primary"
          >
            <Image
              source={{ uri: item.imagen }}
              className="w-16 h-16 mr-4 rounded-xl"
            />
            <Text className="text-primary text-2xl font-work-black">
              {item.nombre}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default JuegosPantalla;
