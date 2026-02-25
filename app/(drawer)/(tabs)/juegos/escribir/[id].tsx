import SmartMedia from "@/components/shared/SmartMedia";
import { getPalabrasJuegoOffline } from "@/src/hooks/useOfflineData";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mensajesExito = ["¡Excelente! 🌟", "¡Muy bien! 👍", "¡Sigue así! 🚀", "¡Perfecto! ✨", "¡Genial! 👏"];

export default function EscribirSenaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [palabras, setPalabras] = useState<any[]>([]);
  const [indice, setIndice] = useState(0);
  const [textoUsuario, setTextoUsuario] = useState("");
  const [mensaje, setMensaje] = useState<{ tipo: "exito" | "error" | null; texto: string; }>({ tipo: null, texto: "" });
  const [loading, setLoading] = useState(true);
  const [juegoTerminado, setJuegoTerminado] = useState(false);

  useEffect(() => { cargarDatos(); }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true); reiniciarEstado();
      const data = await getPalabrasJuegoOffline(id.toString(), 10);
      setPalabras(data);
    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const reiniciarEstado = () => { setIndice(0); setTextoUsuario(""); setMensaje({ tipo: null, texto: "" }); setJuegoTerminado(false); };

  const verificarRespuesta = () => {
    const palabraCorrecta = palabras[indice].word;
    const inputNormalizado = textoUsuario.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const correctaNormalizada = palabraCorrecta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (inputNormalizado === correctaNormalizada) {
      setMensaje({ tipo: "exito", texto: mensajesExito[Math.floor(Math.random() * mensajesExito.length)] });
      setTimeout(siguiente, 1500);
    } else {
      setMensaje({ tipo: "error", texto: "Inténtalo de nuevo" });
    }
  };

  const siguiente = () => {
    if (indice < palabras.length - 1) {
      setIndice(indice + 1); setTextoUsuario(""); setMensaje({ tipo: null, texto: "" });
    } else {
      setJuegoTerminado(true);
    }
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10" color="#2563EB" />;
  if (!palabras.length) return <Text className="text-center mt-10">No hay datos para jugar.</Text>;

  const actual = palabras[indice];

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between mb-4 mt-2">
        <TouchableOpacity onPress={() => router.back()} className="bg-white p-3 rounded-full shadow-sm"><Ionicons name="arrow-back" size={24} color="#2563EB" /></TouchableOpacity>
        <Text className="text-xl font-work-black text-primary">Escribir Seña</Text>
        <View style={{width: 48}} /> 
      </View>

      <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} className="flex-1 justify-center">
        <Text className="text-center text-gray-400 mb-2 font-work-bold">Palabra {indice + 1} de {palabras.length}</Text>

        <View className="h-64 bg-white rounded-3xl overflow-hidden mb-8 border border-gray-200 items-center justify-center shadow-sm">
          <SmartMedia uri={actual.media_url} type={actual.media_type} resizeMode="contain" autoPlay={true} isLooping={true} className="w-full h-full" />
        </View>

        <Text className="text-primary font-work-bold text-center mb-2 text-lg">¿Qué palabra es?</Text>

        <TextInput value={textoUsuario} onChangeText={setTextoUsuario} placeholder="Escribe aquí..." className="bg-white p-4 rounded-2xl text-center text-xl font-work-bold text-primary border border-gray-200 mb-4 shadow-sm" autoCapitalize="characters" />

        <TouchableOpacity onPress={verificarRespuesta} className={`w-full py-4 rounded-2xl shadow-sm ${mensaje.tipo === "exito" ? "bg-green-500" : mensaje.tipo === "error" ? "bg-red-500" : "bg-primary"}`}>
          <Text className="text-white text-center font-work-bold text-lg">
            {mensaje.texto || "Comprobar"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => { alert(`La respuesta era: ${actual.word}`); siguiente(); }} className="mt-4">
          <Text className="text-center text-gray-400 font-work-regular">Saltar palabra</Text>
        </TouchableOpacity>
      </KeyboardAvoidingView>

      <Modal visible={juegoTerminado} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white w-full rounded-3xl p-8 items-center shadow-lg">
            <Ionicons name="star" size={80} color="#F59E0B" className="mb-4" />
            <Text className="text-3xl font-work-black text-primary text-center mb-2">¡Juego Terminado!</Text>
            <TouchableOpacity onPress={cargarDatos} className="bg-primary w-full py-4 rounded-2xl mb-3 mt-4"><Text className="text-white text-center font-bold text-lg">Jugar de Nuevo</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}><Text className="text-primary font-bold mt-2">Salir</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}