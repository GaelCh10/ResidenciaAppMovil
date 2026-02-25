import SmartMedia from "@/components/shared/SmartMedia";
import { getPalabrasJuegoOffline } from "@/src/hooks/useOfflineData";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mensajesExito = ["¡Excelente! 🌟", "¡Muy bien! 👍", "¡Sigue así! 🚀", "¡Perfecto! ✨", "¡Genial! 👏"];

export default function OrdenarPalabraScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();
  const [palabrasJuego, setPalabrasJuego] = useState<any[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [letrasDesordenadas, setLetrasDesordenadas] = useState<any[]>([]);
  const [letrasSeleccionadas, setLetrasSeleccionadas] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [estadoJuego, setEstadoJuego] = useState<"jugando" | "ganaste" | "error">("jugando");
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { cargarJuego(); }, [id]);

  const cargarJuego = async () => {
    try {
      setLoading(true); reiniciarEstado();
      const data = await getPalabrasJuegoOffline(id.toString(), 10);
      setPalabrasJuego(data);
      if (data.length > 0) prepararNivel(data[0]);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const reiniciarEstado = () => { setIndiceActual(0); setJuegoTerminado(false); setLetrasSeleccionadas([]); setLetrasDesordenadas([]); setEstadoJuego("jugando"); setFeedback(null); };

  const prepararNivel = (palabraObj: any) => {
    const palabra = palabraObj.word.toUpperCase();
    const letrasObj = palabra.split("").map((char: string, index: number) => ({ id: `${index}-${char}`, char: char, selected: false }));
    setLetrasDesordenadas(letrasObj.sort(() => Math.random() - 0.5));
    setLetrasSeleccionadas([]);
    setEstadoJuego("jugando");
  };

  const manejarClickLetra = (letraObj: any) => {
    if (letraObj.selected) return;
    const nuevaSeleccion = [...letrasSeleccionadas, { id: letraObj.id, char: letraObj.char }];
    setLetrasSeleccionadas(nuevaSeleccion);
    setLetrasDesordenadas((prev) => prev.map((l) => (l.id === letraObj.id ? { ...l, selected: true } : l)));
    const palabraMeta = palabrasJuego[indiceActual].word.toUpperCase();
    
    if (nuevaSeleccion.length === palabraMeta.length) {
      const palabraFormada = nuevaSeleccion.map((l) => l.char).join("");
      if (palabraFormada === palabraMeta) {
        setEstadoJuego("ganaste");
        setFeedback(mensajesExito[Math.floor(Math.random() * mensajesExito.length)]);
        setTimeout(() => {
            setFeedback(null);
            siguienteNivel();
        }, 1500);
      } else {
        setEstadoJuego("error");
        setTimeout(() => {
          setLetrasSeleccionadas([]);
          setLetrasDesordenadas((prev) => prev.map((l) => ({ ...l, selected: false })));
          setEstadoJuego("jugando");
        }, 1000);
      }
    }
  };

  const devolverLetra = (letraId: string) => {
    if (estadoJuego !== "jugando") return;
    setLetrasSeleccionadas(letrasSeleccionadas.filter((l) => l.id !== letraId));
    setLetrasDesordenadas((prev) => prev.map((l) => (l.id === letraId ? { ...l, selected: false } : l)));
  };

  const siguienteNivel = () => {
    if (indiceActual < palabrasJuego.length - 1) {
      const nuevoIndice = indiceActual + 1;
      setIndiceActual(nuevoIndice);
      prepararNivel(palabrasJuego[nuevoIndice]);
    } else {
      setJuegoTerminado(true);
    }
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10" color="#2563EB" />;
  if (palabrasJuego.length === 0) return <Text className="text-center mt-10">No hay palabras.</Text>;

  const palabraActual = palabrasJuego[indiceActual];

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between mb-4 mt-2">
        <TouchableOpacity onPress={() => router.back()} className="bg-white p-3 rounded-full shadow-sm"><Ionicons name="arrow-back" size={24} color="#2563EB" /></TouchableOpacity>
        <Text className="text-xl font-work-black text-primary">Ordenar Palabra</Text>
        <View style={{width: 48}} /> 
      </View>

      <Text className="text-center text-gray-400 mb-2 font-bold">Palabra {indiceActual + 1} de {palabrasJuego.length}</Text>

      <View className="items-center mb-4">
        <View className="w-40 h-40 rounded-3xl bg-white overflow-hidden shadow-sm border border-gray-100">
          <SmartMedia uri={palabraActual.media_url} type={palabraActual.media_type} resizeMode="contain" autoPlay={true} isLooping={true} className="w-full h-full" />
        </View>
      </View>

      <View className="h-8 justify-center items-center mb-2">
        {feedback && <Text className="text-green-600 font-work-bold text-lg">{feedback}</Text>}
      </View>

      <View className="flex-row flex-wrap justify-center mb-8 min-h-[60px]">
        {letrasSeleccionadas.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => devolverLetra(item.id)} className={`w-12 h-12 border-b-4 mx-1 items-center justify-center ${estadoJuego === "ganaste" ? "border-green-500" : estadoJuego === "error" ? "border-red-500" : "border-primary"}`}>
            <Text className="text-2xl font-work-bold text-primary">{item.char}</Text>
          </TouchableOpacity>
        ))}
        {Array.from({ length: palabraActual.word.length - letrasSeleccionadas.length }).map((_, i) => (
          <View key={i} className="w-12 h-12 border-b-2 border-gray-300 mx-1" />
        ))}
      </View>

      <View className="flex-row flex-wrap justify-center gap-3">
        {letrasDesordenadas.map((item) => (
          <TouchableOpacity key={item.id} onPress={() => manejarClickLetra(item)} disabled={item.selected} className={`w-16 h-16 rounded-2xl items-center justify-center shadow-sm ${item.selected ? "bg-gray-200" : "bg-white border-b-4 border-blue-400"}`}>
            {!item.selected && <Text className="text-4xl text-primary" style={{ fontFamily: "LsmVulpy" }}>{item.char.toLowerCase()}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={juegoTerminado} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center shadow-lg">
            <Text className="text-3xl font-work-black text-primary text-center mb-2">¡Orden Perfecto!</Text>
            <TouchableOpacity onPress={cargarJuego} className="bg-primary w-full py-4 rounded-2xl mb-3 mt-4"><Text className="text-white text-center font-bold text-lg">Jugar de Nuevo</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}><Text className="text-primary font-bold mt-2">Salir</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}