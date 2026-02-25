import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import { ActivityIndicator, Dimensions, Modal, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import SmartMedia from "@/components/shared/SmartMedia";
import { getPalabrasJuegoOffline } from "@/src/hooks/useOfflineData";

const mensajesExito = ["¡Excelente! 🌟", "¡Muy bien! 👍", "¡Sigue así! 🚀", "¡Perfecto! ✨", "¡Genial! 👏"];
interface TarjetaJuego { id: string; wordId: string; content: string; type: "image" | "text"; mediaType?: "video" | "image"; isFlipped: boolean; isMatched: boolean; }
const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const cardSize = Math.floor((screenWidth - 80) / numColumns); 

export default function MemoramaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [cards, setCards] = useState<TarjetaJuego[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarjetaJuego[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [bloquearTablero, setBloquearTablero] = useState(false);
  
  const [movimientos, setMovimientos] = useState(0);
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => { iniciarJuego(); }, [id]);

  const iniciarJuego = async () => {
    setLoading(true); setGameWon(false); setSelectedCards([]); setMovimientos(0); setFeedback(null);
    try {  
      const palabras = await getPalabrasJuegoOffline(id.toString(), 6);
      let deck: TarjetaJuego[] = [];
      palabras.forEach((p: any) => {
        deck.push({ id: p.id + "-img", wordId: p.id, content: p.media_url, type: "image", mediaType: p.media_type, isFlipped: false, isMatched: false });
        deck.push({ id: p.id + "-txt", wordId: p.id, content: p.word, type: "text", isFlipped: false, isMatched: false });
      });
      deck = deck.sort(() => Math.random() - 0.5);
      setCards(deck);
    } catch (error) { console.error(error); } finally { setLoading(false); }
  };

  const manejarCardPress = (card: TarjetaJuego) => {
    if (card.isFlipped || card.isMatched || bloquearTablero) return;
    const nuevoDeck = cards.map((c) => c.id === card.id ? { ...c, isFlipped: true } : c);
    setCards(nuevoDeck);
    
    const nuevasSeleccionadas = [...selectedCards, card];
    setSelectedCards(nuevasSeleccionadas);
    
    if (nuevasSeleccionadas.length === 2) {
      setMovimientos(prev => prev + 1); 
      setBloquearTablero(true);
      verificarMatch(nuevasSeleccionadas, nuevoDeck);
    }
  };

  const verificarMatch = (seleccionadas: TarjetaJuego[], deckActual: TarjetaJuego[]) => {
    const [carta1, carta2] = seleccionadas;
    if (carta1.wordId === carta2.wordId) {
      setFeedback(mensajesExito[Math.floor(Math.random() * mensajesExito.length)]);
      setTimeout(() => setFeedback(null), 1500);

      const deckActualizado = deckActual.map((c) => c.wordId === carta1.wordId ? { ...c, isMatched: true } : c);
      setCards(deckActualizado);
      setSelectedCards([]);
      setBloquearTablero(false);
      
      if (deckActualizado.every((c) => c.isMatched)) setTimeout(() => setGameWon(true), 500);
    } else {
      setTimeout(() => {
        const deckReseteado = deckActual.map((c) => c.id === carta1.id || c.id === carta2.id ? { ...c, isFlipped: false } : c);
        setCards(deckReseteado);
        setSelectedCards([]);
        setBloquearTablero(false);
      }, 1000);
    }
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10" color="#2563EB" />;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ headerShown: false }} />

      <View className="flex-row items-center justify-between mb-2 mt-2">
        <TouchableOpacity onPress={() => router.back()} className="bg-white p-3 rounded-full shadow-sm">
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text className="text-xl font-work-black text-primary">Memorama</Text>
        <View className="bg-white px-3 py-1 rounded-full shadow-sm">
            <Text className="font-bold text-gray-500">🎮 {movimientos}</Text>
        </View> 
      </View>

      <View className="h-8 justify-center items-center mb-2">
        {feedback && <Text className="text-green-600 font-work-bold text-lg animate-bounce">{feedback}</Text>}
      </View>

      <View className="flex-row flex-wrap justify-start p-3 rounded-3xl bg-[#0b1973] shadow-lg">
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => manejarCardPress(card)}
            activeOpacity={0.8}
            style={{ width: cardSize, height: cardSize, margin: 4 }}
            className={`rounded-xl items-center justify-center border-2 shadow-sm
              ${card.isFlipped || card.isMatched ? "bg-white border-blue-400" : "bg-blue-500 border-blue-400"}
            `}
          >
            {card.isFlipped || card.isMatched ? (
              card.type === "text" ? (
                <Text className="text-primary font-work-bold text-center text-xs px-1 capitalize">
                  {card.content}
                </Text>
              ) : (
                <View className="w-full h-full p-1 rounded-lg overflow-hidden">
                  <SmartMedia uri={card.content} type={card.mediaType} resizeMode="cover" isLooping={true} isMuted={true} className="w-full h-full" />
                </View>
              )
            ) : (
              <Ionicons name="help" size={30} color="white opacity-50" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      <Modal visible={gameWon} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center shadow-lg">
            <Ionicons name="trophy" size={60} color="#F59E0B" className="mb-2"/>
            <Text className="text-3xl font-work-black text-primary text-center mb-2">
              ¡Nivel Completado!
            </Text>
            <Text className="text-gray-500 font-work-medium text-lg mb-4">
                Movimientos: <Text className="font-bold text-primary">{movimientos}</Text>
            </Text>
            <TouchableOpacity onPress={iniciarJuego} className="bg-primary w-full py-4 rounded-2xl mb-3">
              <Text className="text-white text-center font-bold text-lg">Jugar de Nuevo</Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()}>
              <Text className="text-primary font-bold mt-2">Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}