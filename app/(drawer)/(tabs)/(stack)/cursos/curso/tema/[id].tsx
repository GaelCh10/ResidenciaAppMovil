import { cursosMock } from "@/store/cursos.mock";
import { useLocalSearchParams } from "expo-router";
import { Image, Text, View } from "react-native";

const TemaDetallePantalla = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const temaId = Number(id);

  const curso = cursosMock[0].categoria[0].cursos[0];
  const tema = curso.temas.find((t) => t.id === temaId);

  if (!tema) return <Text>Tema no encontrado</Text>;

  return (
    <View className="flex-1 p-4 bg-secondary-200 items-center">
      <Text className="text-3xl text-primary font-work-black mb-4">
        {tema.titulo}
      </Text>

      <Image
        source={{ uri: tema.imagen_url }}
        className="w-64 h-64 rounded-xl mb-6"
      />

      <Text className="text-gray-700 text-center text-lg px-4">
        Aquí puedes agregar la explicación completa del tema…
      </Text>
    </View>
  );
};

export default TemaDetallePantalla;
