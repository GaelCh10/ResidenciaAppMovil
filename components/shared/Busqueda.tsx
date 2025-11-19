import { palabrasDiccionario } from "@/store/words.dicc";
import { FontAwesome } from "@expo/vector-icons";
import React, { useMemo, useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import DetallesDic from "./DetallesDisc";



interface Categoria {
  nombre: string;
}

const Busqueda: React.FC = () => {
  const [palabra, setPalabra] = useState("");
  const [modoBusqueda, setModoBusqueda] = useState<"palabra" | "categoria">("palabra");
  const [categoriaSeleccionada, setCategoriaSeleccionada] = useState<string | null>(null);

  const categorias = useMemo(() => {
    const unique = Array.from(new Set(palabrasDiccionario.map((p) => p.categoria)));
    return unique.map((nombre) => ({ nombre }));
  }, []);

  const resultados = useMemo(() => {
    if (modoBusqueda === "palabra" && palabra.trim()) {
      return palabrasDiccionario.filter((p) =>
        p.palabra.toLowerCase().includes(palabra.toLowerCase())
      );
    } else if (modoBusqueda === "categoria" && categoriaSeleccionada) {
      return palabrasDiccionario.filter((p) => p.categoria === categoriaSeleccionada);
    }
    return [];
  }, [palabra, modoBusqueda, categoriaSeleccionada]);

  return (
    <View className="flex-1 w-full px-4 mt-4">
      {/* Modo de búsqueda */}
      <View className="flex-row items-center mb-4 space-x-2">
        <TouchableOpacity
          onPress={() => setModoBusqueda("palabra")}
          className={`px-4 py-2 rounded-md border-2 ${
            modoBusqueda === "palabra" ? "bg-primary border-primary" : "border-primary bg-white"
          }`}
        >
          <Text className={`font-work-black ${modoBusqueda === "palabra" ? "text-white" : "text-primary"}`}>
            Palabra
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => setModoBusqueda("categoria")}
          className={`px-4 py-2 rounded-md border-2 ${
            modoBusqueda === "categoria" ? "bg-primary border-primary" : "border-primary bg-white"
          }`}
        >
          <Text className={`font-work-black ${modoBusqueda === "categoria" ? "text-white" : "text-primary"}`}>
            Categoría
          </Text>
        </TouchableOpacity>
      </View>

      {/* Entrada de búsqueda */}
      {modoBusqueda === "palabra" ? (
        <View className="flex-row items-center mb-3">
          <TextInput
            placeholder="Buscar palabra..."
            value={palabra}
            onChangeText={setPalabra}
            className="flex-1 bg-white border border-primary rounded-l-xl px-3 py-2 text-black"
          />
          <TouchableOpacity
            disabled={!palabra}
            className={`px-4 py-2 rounded-r-xl ${
              palabra ? "bg-primary" : "bg-secondary"
            }`}
          >
            <FontAwesome name="search" size={22} color="white" />
          </TouchableOpacity>
        </View>
      ) : (
        <FlatList
        
          horizontal
          data={categorias}
          keyExtractor={(item) => item.nombre}
          showsHorizontalScrollIndicator={false}
          renderItem={({ item }) => (
            <TouchableOpacity
              onPress={() =>
                setCategoriaSeleccionada(
                  categoriaSeleccionada === item.nombre ? null : item.nombre
                )
              }
              className={`px-4 py-2 mr-2 rounded-lg ${
                categoriaSeleccionada === item.nombre ? "bg-primary" : "bg-secondary"
              }`}
            >
              <Text
                className={`font-work-regular ${
                  categoriaSeleccionada === item.nombre ? "text-white" : "text-primary"
                }`}
              >
                {item.nombre}
              </Text>
            </TouchableOpacity>
          )}
        />
      )}

      {/* Resultados */}
      <FlatList
        data={resultados}
        keyExtractor={(item) => item.id.toString()}
        renderItem={({ item }) => (
          <DetallesDic palabra={item.palabra} img={item.imagen_url} />
        )}
        contentContainerStyle={{ paddingBottom: 100 }}
        ListEmptyComponent={() => (
          <Text className="text-center text-gray-500 mt-4">Sin resultados</Text>
        )}
      />
    </View>
  );
};

export default Busqueda;
