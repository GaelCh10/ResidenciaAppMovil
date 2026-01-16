import { router } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, FlatList, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
// Importamos el servicio y las interfaces
import { supabase } from "@/src/lib/supabase";
import { Categoria, obtenerCategoriasConNiveles } from "@/src/services/cursos";

const CursosPantalla = () => {
  // Estado para guardar los datos reales de Supabase
  const [categorias, setCategorias] = useState<Categoria[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Tu estado original para el acordeón
  const [hover, setHover] = useState<string | null>(null); // Cambié number a string porque los IDs de Supabase son UUIDs

  useEffect(() => {
    cargarDatos();
  }, []);

  const cargarDatos = async () => {
    try {
      const data = await obtenerCategoriasConNiveles();
      setCategorias(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // AGREGA ESTO DENTRO DE TU COMPONENTE PARA DEBUGGEAR
useEffect(() => {
  debugConexion();
}, []);

const debugConexion = async () => {
  console.log("--- INICIANDO TEST DE CONEXIÓN ---");
  
  // 1. Prueba básica de conexión
  const { data, error, count } = await supabase
    .from('categories')
    .select('*', { count: 'exact' });

  if (error) {
    console.error("❌ ERROR CRÍTICO DE SUPABASE:", error.message);
    console.error("Detalles:", error);
  } else {
    console.log("✅ Conexión exitosa.");
    console.log(`📊 Se encontraron ${data?.length} categorías.`);
    if (data?.length === 0) {
      console.warn("⚠️ La lista está vacía. Posibles causas: RLS activado sin estar logueado, o tabla vacía.");
    } else {
      console.log("Ejemplo de data:", data?.[0]);
    }
  }
};

  // Renderizado de carga
  if (loading) {

    return (
      <SafeAreaView className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#your_primary_color_here" /> 
        {/* Nota: Tailwind a veces no aplica color al ActivityIndicator, usa el hex de tu primario si es necesario */}
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-primary text-3xl font-work-black text-center mb-4">
        Cursos
      </Text>

      <FlatList
        data={categorias}
        keyExtractor={(item) => item.id}
        renderItem={({ item: categoria }) => (
          <View className="mb-5">
            {/* Botón Principal (Categoría: General, Básico, etc.) */}
            <TouchableOpacity
              onPress={() => setHover(hover === categoria.id ? null : categoria.id)}
              className="bg-primary rounded-3xl py-3 px-5"
            >
              <Text className="text-white text-lg text-center font-work-black">
                {categoria.name}
              </Text>
            </TouchableOpacity>

            {/* Sub-lista (Niveles: Básico 1, Básico 2, etc.) */}
            {hover === categoria.id && (
              <View className="mt-4 space-y-2">
                {categoria.levels.length > 0 ? (
                  categoria.levels.map((nivel) => (
                    <TouchableOpacity
                      key={nivel.id}
                      onPress={() =>
                        // Redirigimos pasando el ID del NIVEL
                        // En la siguiente pantalla usarás este ID para buscar los cursos
                        router.push({
                          pathname: "/cursos/categoria/[id]", 
                          params: { id: nivel.id },
                        })
                      }
                      className="bg-white border border-primary rounded-2xl py-2 px-4 mb-2" // Agregué mb-2 para espaciado manual si space-y falla
                    >
                      <Text className="text-primary text-center font-work-regular">
                        {nivel.name}
                      </Text>
                    </TouchableOpacity>
                  ))
                ) : (
                  <Text className="text-primary text-center font-work-regular italic">
                    Próximamente
                  </Text>
                )}
              </View>
            )}
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default CursosPantalla;