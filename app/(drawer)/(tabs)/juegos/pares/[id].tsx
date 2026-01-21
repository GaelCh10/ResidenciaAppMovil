import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// OFFLINE
import SmartMedia from "@/components/shared/SmartMedia";
import { getPalabrasJuegoOffline } from "@/src/hooks/useOfflineData";

export default function EncontrarParesScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [columnaIzq, setColumnaIzq] = useState<any[]>([]);
  const [columnaDer, setColumnaDer] = useState<any[]>([]);
  const [seleccionIzq, setSeleccionIzq] = useState<string | null>(null);
  const [seleccionDer, setSeleccionDer] = useState<string | null>(null);
  const [paresEncontrados, setParesEncontrados] = useState<string[]>([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    iniciarJuego();
  }, [id]);

  const iniciarJuego = async () => {
    setLoading(true);
    setJuegoTerminado(false);
    setParesEncontrados([]);
    setSeleccionIzq(null);
    setSeleccionDer(null);

    try {
      // OFFLINE
      const data = await getPalabrasJuegoOffline(id.toString(), 4);
      setColumnaIzq(data);
      const media = [...data].sort(() => Math.random() - 0.5);
      setColumnaDer(media);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const manejarToque = (lado: "izq" | "der", itemId: string) => {
    if (paresEncontrados.includes(itemId)) return;
    if (lado === "izq") {
      setSeleccionIzq(itemId);
      if (seleccionDer) verificarMatch(itemId, seleccionDer);
    } else {
      setSeleccionDer(itemId);
      if (seleccionIzq) verificarMatch(seleccionIzq, itemId);
    }
  };

  const verificarMatch = (idIzq: string, idDer: string) => {
    if (idIzq === idDer) {
      const nuevosPares = [...paresEncontrados, idIzq];
      setParesEncontrados(nuevosPares);
      setSeleccionIzq(null);
      setSeleccionDer(null);
      if (nuevosPares.length === columnaIzq.length) {
        setTimeout(() => setJuegoTerminado(true), 500);
      }
    } else {
      setTimeout(() => {
        setSeleccionIzq(null);
        setSeleccionDer(null);
      }, 500);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" className="mt-10" color="#2563EB" />;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 p-4">
      <Stack.Screen
        options={{ title: "Encontrar Pares", headerBackTitle: "Juegos" }}
      />
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-primary font-bold">← Volver al Menú</Text>
      </TouchableOpacity>

      <View className="flex-1 flex-row justify-between mt-4">
        {/* COLUMNA IZQUIERDA */}
        <View className="w-[45%] gap-4">
          {columnaIzq.map((item) => {
            const esResuelto = paresEncontrados.includes(item.id);
            const esSeleccionado = seleccionIzq === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                disabled={esResuelto}
                onPress={() => manejarToque("izq", item.id)}
                className={`h-24 justify-center items-center rounded-xl border-2 px-2
                            ${
                              esResuelto
                                ? "bg-green-100 border-green-500"
                                : esSeleccionado
                                  ? "bg-blue-100 border-blue-500"
                                  : "bg-white border-gray-200"
                            }`}
              >
                <Text className="text-center font-bold text-primary capitalize">
                  {item.word}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>

        {/* COLUMNA DERECHA (SMARTMEDIA) */}
        <View className="w-[45%] gap-4">
          {columnaDer.map((item) => {
            const esResuelto = paresEncontrados.includes(item.id);
            const esSeleccionado = seleccionDer === item.id;
            return (
              <TouchableOpacity
                key={item.id}
                disabled={esResuelto}
                onPress={() => manejarToque("der", item.id)}
                className={`h-24 justify-center items-center rounded-xl border-2 overflow-hidden
                            ${
                              esResuelto
                                ? "bg-green-100 border-green-500"
                                : esSeleccionado
                                  ? "bg-blue-100 border-blue-500"
                                  : "bg-white border-gray-200"
                            }`}
              >
                <View className="w-full h-full">
                  <SmartMedia
                    uri={item.media_url}
                    type={item.media_type}
                    resizeMode="cover"
                    shouldPlay={false} // Evitar 4 videos sonando a la vez, o true si prefieres
                    isLooping={true}
                    isMuted={true}
                    className="w-full h-full"
                  />
                </View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Modal igual... */}
      <Modal visible={juegoTerminado} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center">
            <Text className="text-2xl font-bold text-primary mb-4">
              ¡Conexiones listas!
            </Text>
            <TouchableOpacity
              onPress={iniciarJuego}
              className="bg-primary w-full py-3 rounded-xl mt-6"
            >
              <Text className="text-white text-center font-bold">
                Jugar de nuevo
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} className="mt-4">
              <Text className="text-gray-500">Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
