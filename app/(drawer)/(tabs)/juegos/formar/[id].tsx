import { getPalabrasJuegoOffline } from "@/src/hooks/useOfflineData";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mensajesExito = ["¡Excelente! 🌟", "¡Muy bien! 👍", "¡Sigue así! 🚀", "¡Perfecto! ✨", "¡Genial! 👏"];

export default function FormarPalabrasScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [palabrasMeta, setPalabrasMeta] = useState<{ word: string; found: boolean }[]>([]);
  const [letrasPool, setLetrasPool] = useState<{ id: string; char: string; used: boolean }[]>([]);
  const [inputActual, setInputActual] = useState<{ id: string; char: string }[]>([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [loading, setLoading] = useState(true);
  
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { iniciarJuego(); }, [id]);

  const iniciarJuego = async () => {
    setLoading(true); setJuegoTerminado(false); setInputActual([]); setFeedback(null);
    try {
      const data = await getPalabrasJuegoOffline(id.toString(), 3);
      const metas = data.map((p: any) => ({ word: p.word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""), found: false }));
      setPalabrasMeta(metas);

      let letras: any[] = [];
      metas.forEach((m: any) => {
        m.word.split("").forEach((char: string, i: number) => {
          letras.push({ id: `${m.word}-${i}-${Math.random()}`, char, used: false });
        });
      });
      setLetrasPool(letras.sort(() => Math.random() - 0.5));
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const manejarLetra = (letraObj: any) => {
    const nuevoInput = [...inputActual, letraObj];
    setInputActual(nuevoInput);
    setLetrasPool((prev) => prev.map((l) => (l.id === letraObj.id ? { ...l, used: true } : l)));
    const textoFormado = nuevoInput.map((l) => l.char).join("");
    const match = palabrasMeta.find((p) => p.word === textoFormado && !p.found);
    if (match) {
      setFeedback(mensajesExito[Math.floor(Math.random() * mensajesExito.length)]);
      setTimeout(() => setFeedback(null), 1500);

      setPalabrasMeta((prev) => prev.map((p) => (p.word === match.word ? { ...p, found: true } : p)));
      setInputActual([]);
      const nuevasMetas = palabrasMeta.map((p) => p.word === match.word ? { ...p, found: true } : p);
      if (nuevasMetas.every((p) => p.found)) setTimeout(() => setJuegoTerminado(true), 1000);
    }
  };

  const borrarInput = () => {
    const idsRestaurar = inputActual.map((l) => l.id);
    setLetrasPool((prev) => prev.map((l) => idsRestaurar.includes(l.id) ? { ...l, used: false } : l));
    setInputActual([]);
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10" color="#2563EB" />;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between mb-4 mt-2">
        <TouchableOpacity onPress={() => router.back()} className="bg-white p-3 rounded-full shadow-sm"><Ionicons name="arrow-back" size={24} color="#2563EB" /></TouchableOpacity>
        <Text className="text-xl font-work-black text-primary">Formar Palabras</Text>
        <View style={{width: 48}} /> 
      </View>

      <View className="bg-white p-4 rounded-xl mb-4 shadow-sm">
        <Text className="text-center text-gray-500 mb-2 font-bold">Objetivos:</Text>
        {palabrasMeta.map((p, i) => (
          <View key={i} className="flex-row items-center justify-between mb-2 p-2 bg-gray-50 rounded-lg">
            <Text className={`text-lg font-bold ${p.found ? 'text-green-600' : 'text-gray-400'}`}>{p.found ? p.word : "????"}</Text>
            {p.found ? <Ionicons name="checkmark-circle" size={24} color="green" /> : <Ionicons name="ellipse-outline" size={24} color="#ccc" />}
          </View>
        ))}
      </View>

      <View className="h-8 justify-center items-center mb-2">
        {feedback && <Text className="text-green-600 font-work-bold text-lg">{feedback}</Text>}
      </View>

      <View className="flex-row justify-center items-center bg-white h-16 rounded-xl mb-4 border border-blue-200 px-4 shadow-sm">
        <Text className="text-2xl font-bold tracking-widest text-primary flex-1 text-center">{inputActual.map((l) => l.char).join("")}</Text>
        {inputActual.length > 0 && (
          <TouchableOpacity onPress={borrarInput} className="bg-red-100 p-2 rounded-full"><Ionicons name="backspace" size={20} color="red" /></TouchableOpacity>
        )}
      </View>

      <View className="flex-row flex-wrap justify-center gap-2">
        {letrasPool.map((l) => (
          <TouchableOpacity key={l.id} disabled={l.used} onPress={() => manejarLetra(l)} className={`w-14 h-14 justify-center items-center rounded-xl shadow-sm ${l.used ? "bg-gray-100" : "bg-white border-b-4 border-blue-500"}`}>
            {!l.used && <Text style={{ fontFamily: "LsmVulpy" }} className="text-4xl text-primary">{l.char.toLowerCase()}</Text>}
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={juegoTerminado} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center shadow-lg">
            <Ionicons name="trophy" size={60} color="#F59E0B" className="mb-4"/>
            <Text className="text-2xl font-bold text-primary mb-4">¡Excelente Trabajo!</Text>
            <TouchableOpacity onPress={iniciarJuego} className="bg-primary w-full py-4 rounded-xl mt-2"><Text className="text-white text-center font-bold text-lg">Jugar de Nuevo</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} className="mt-4"><Text className="text-gray-500 font-bold">Salir</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}