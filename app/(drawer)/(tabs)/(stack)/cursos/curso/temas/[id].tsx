import { View, Text, Image, TouchableOpacity, FlatList } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { cursosMock } from "@/store/cursos.mock";



const ListaTemasPantalla = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const curso = cursosMock[0].categoria[0].cursos.find(
    (c) => c.id === Number(id)
  );

  if (!curso) return <Text>No se encontró el curso</Text>;

  return (
    <View className="flex-1 bg-secondary-200 p-4">
      <Text className="text-primary text-3xl font-work-black text-center mb-4">
        Temas del curso
      </Text>

      <FlatList
        data={curso.temas}
        keyExtractor={(t) => t.id.toString()}
        numColumns={2}
        columnWrapperStyle={{ justifyContent: "space-around" }}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/cursos/curso/tema/[id]",
                params: { id: item.id.toString() },
              })
            }
            className="bg-white rounded-xl border border-primary p-3 mb-4 items-center w-[45%]"
          >
            <Image
              source={{ uri: item.imagen_url }}
              className="w-28 h-28 rounded-md mb-2"
            />
            <Text className="text-primary font-work-black text-center">
              {item.titulo}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
};

export default ListaTemasPantalla;
