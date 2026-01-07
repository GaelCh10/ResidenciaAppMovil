import { View, Text, FlatList, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { juegosMock } from "@/store/juegos.mock";

const MemoramaCategorias = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const juego = juegosMock.find((j) => j.id === Number(id));

  if (!juego) return <Text>No se encontró el juego</Text>;

  return (
    <View className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-primary text-3xl font-work-black text-center mb-4">
        {juego.nombre}
      </Text>

      <FlatList
        data={juego.categorias}
        keyExtractor={(cat) => cat.id.toString()}
        contentContainerStyle={{ paddingBottom: 40 }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/juegos/memorama/[id]",
                params: { id: item.id.toString() },
              })
            }
            className="flex-row items-center bg-white rounded-2xl shadow-md p-3 mb-4 border border-primary"
          >
            <Image
              source={{ uri: item.imagen }}
              className="w-14 h-14 mr-3 rounded-lg"
            />
            <View className="flex-1">
              <Text className="text-primary text-xl font-work-black">
                {item.nombre}
              </Text>
              <Text className="text-gray-500 text-sm">{item.descripcion}</Text>
            </View>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default MemoramaCategorias;
