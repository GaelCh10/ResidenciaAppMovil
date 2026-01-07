import { View, Text, TouchableOpacity, FlatList } from "react-native";
import { router } from "expo-router";

const crucigramas = [
  { id: "muebles", nombre: "Muebles" },
  { id: "familia", nombre: "Familia" },
  { id: "deportes", nombre: "Deportes" },
  { id: "animales", nombre: "Animales" },
];

export default function CrucigramaLista() {
  return (
    <View className="flex-1 bg-secondary-200 items-center px-4 pt-4">
      <Text className="text-primary font-work-black text-4xl mb-6">Crucigrama</Text>

      <FlatList
        data={crucigramas}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() =>
              router.push({
                pathname: "/juegos/crucigrama/[id]",
                params: { id: item.id },
              })
            }
            className="bg-white border border-primary w-72 py-3 rounded-2xl mb-4 items-center justify-center"
          >
            <Text className="text-primary font-work-black text-xl">
              {item.nombre}
            </Text>
          </TouchableOpacity>
        )}
      />
    </View>
  );
}
