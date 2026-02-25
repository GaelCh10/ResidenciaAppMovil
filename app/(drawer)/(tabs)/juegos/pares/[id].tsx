import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SmartMedia from "@/components/shared/SmartMedia";
import { getPalabrasJuegoOffline } from "@/src/hooks/useOfflineData";
import { Ionicons } from "@expo/vector-icons";

const mensajesExito = ["¡Excelente! 🌟", "¡Muy bien! 👍", "¡Sigue así! 🚀", "¡Perfecto! ✨", "¡Genial! 👏"];

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
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { iniciarJuego(); }, [id]);

  const iniciarJuego = async () => {
    setLoading(true); setJuegoTerminado(false); setParesEncontrados([]); setSeleccionIzq(null); setSeleccionDer(null); setFeedback(null);
    try {
      const data = await getPalabrasJuegoOffline(id.toString(), 4);
      setColumnaIzq(data);
      const media = [...data].sort(() => Math.random() - 0.5);
      setColumnaDer(media);
    } catch (e) { console.error(e); } finally { setLoading(false); }
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
      setFeedback(mensajesExito[Math.floor(Math.random() * mensajesExito.length)]);
      setTimeout(() => setFeedback(null), 1500);

      const nuevosPares = [...paresEncontrados, idIzq];
      setParesEncontrados(nuevosPares);
      setSeleccionIzq(null);
      setSeleccionDer(null);
      if (nuevosPares.length === columnaIzq.length) {
        setTimeout(() => setJuegoTerminado(true), 1000);
      }
    } else {
      setTimeout(() => { setSeleccionIzq(null); setSeleccionDer(null); }, 500);
    }
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10" color="#2563EB" />;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ headerShown: false }} />
      <View className="flex-row items-center justify-between mb-2 mt-2">
        <TouchableOpacity onPress={() => router.back()} className="bg-white p-3 rounded-full shadow-sm"><Ionicons name="arrow-back" size={24} color="#2563EB" /></TouchableOpacity>
        <Text className="text-xl font-work-black text-primary">Encontrar Pares</Text>
        <View style={{width: 48}} /> 
      </View>

      <View className="h-8 justify-center items-center mb-2">
        {feedback && <Text className="text-green-600 font-work-bold text-lg">{feedback}</Text>}
      </View>

      <View className="flex-1 flex-row justify-between mt-2">
        <View className="w-[45%] gap-4">
          {columnaIzq.map((item) => {
            const esResuelto = paresEncontrados.includes(item.id);
            const esSeleccionado = seleccionIzq === item.id;
            return (
              <TouchableOpacity key={item.id} disabled={esResuelto} onPress={() => manejarToque("izq", item.id)} className={`h-24 justify-center items-center rounded-xl border-2 px-2 shadow-sm ${esResuelto ? "bg-green-100 border-green-500 opacity-50" : esSeleccionado ? "bg-blue-100 border-blue-500" : "bg-white border-white"}`}>
                <Text className="text-center font-bold text-primary capitalize text-lg">{item.word}</Text>
              </TouchableOpacity>
            );
          })}
        </View>

        <View className="w-[45%] gap-4">
          {columnaDer.map((item) => {
            const esResuelto = paresEncontrados.includes(item.id);
            const esSeleccionado = seleccionDer === item.id;
            return (
              <TouchableOpacity key={item.id} disabled={esResuelto} onPress={() => manejarToque("der", item.id)} className={`h-24 justify-center items-center rounded-xl border-2 overflow-hidden shadow-sm ${esResuelto ? "bg-green-100 border-green-500 opacity-50" : esSeleccionado ? "bg-blue-100 border-blue-500" : "bg-white border-white"}`}>
                <View className="w-full h-full"><SmartMedia uri={item.media_url} type={item.media_type} resizeMode="cover" shouldPlay={false} isLooping={true} isMuted={true} className="w-full h-full" /></View>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      <Modal visible={juegoTerminado} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center shadow-lg">
            <Text className="text-2xl font-bold text-primary mb-4">¡Conexiones listas!</Text>
            <TouchableOpacity onPress={iniciarJuego} className="bg-primary w-full py-4 rounded-2xl mb-3 mt-4"><Text className="text-white text-center font-bold text-lg">Jugar de nuevo</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} className="mt-4"><Text className="text-gray-500">Salir</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}