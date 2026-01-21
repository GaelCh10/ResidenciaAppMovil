import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// IMPORTACIONES OFFLINE
import SmartMedia from "@/components/shared/SmartMedia";
import { getPalabrasJuegoOffline } from "@/src/hooks/useOfflineData";

interface TarjetaJuego {
  id: string;
  wordId: string;
  content: string;
  type: "image" | "text";
  mediaType?: "video" | "image";
  isFlipped: boolean;
  isMatched: boolean;
}

const numColumns = 3;
const screenWidth = Dimensions.get("window").width;
const cardSize = (screenWidth - 40) / numColumns - 10;

export default function MemoramaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [cards, setCards] = useState<TarjetaJuego[]>([]);
  const [selectedCards, setSelectedCards] = useState<TarjetaJuego[]>([]);
  const [loading, setLoading] = useState(true);
  const [gameWon, setGameWon] = useState(false);
  const [bloquearTablero, setBloquearTablero] = useState(false);

  useEffect(() => {
    iniciarJuego();
  }, [id]);

  const iniciarJuego = async () => {
    setLoading(true);
    setGameWon(false);
    setSelectedCards([]);
    try {
      // OFFLINE
      const palabras = await getPalabrasJuegoOffline(id.toString(), 6);

      let deck: TarjetaJuego[] = [];

      palabras.forEach((p: any) => {
        deck.push({
          id: p.id + "-img",
          wordId: p.id,
          content: p.media_url,
          type: "image",
          mediaType: p.media_type,
          isFlipped: false,
          isMatched: false,
        });
        deck.push({
          id: p.id + "-txt",
          wordId: p.id,
          content: p.word,
          type: "text",
          isFlipped: false,
          isMatched: false,
        });
      });

      deck = deck.sort(() => Math.random() - 0.5);
      setCards(deck);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const manejarCardPress = (card: TarjetaJuego) => {
    if (card.isFlipped || card.isMatched || bloquearTablero) return;
    const nuevoDeck = cards.map((c) =>
      c.id === card.id ? { ...c, isFlipped: true } : c,
    );
    setCards(nuevoDeck);
    const nuevasSeleccionadas = [...selectedCards, card];
    setSelectedCards(nuevasSeleccionadas);
    if (nuevasSeleccionadas.length === 2) {
      setBloquearTablero(true);
      verificarMatch(nuevasSeleccionadas, nuevoDeck);
    }
  };

  const verificarMatch = (
    seleccionadas: TarjetaJuego[],
    deckActual: TarjetaJuego[],
  ) => {
    const [carta1, carta2] = seleccionadas;
    if (carta1.wordId === carta2.wordId) {
      const deckActualizado = deckActual.map((c) =>
        c.wordId === carta1.wordId ? { ...c, isMatched: true } : c,
      );
      setCards(deckActualizado);
      setSelectedCards([]);
      setBloquearTablero(false);
      if (deckActualizado.every((c) => c.isMatched))
        setTimeout(() => setGameWon(true), 500);
    } else {
      setTimeout(() => {
        const deckReseteado = deckActual.map((c) =>
          c.id === carta1.id || c.id === carta2.id
            ? { ...c, isFlipped: false }
            : c,
        );
        setCards(deckReseteado);
        setSelectedCards([]);
        setBloquearTablero(false);
      }, 1000);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" className="mt-10" color="#2563EB" />;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 p-2">
      <Stack.Screen
        options={{ title: "Memorama", headerBackTitle: "Juegos" }}
      />

      <View className="flex-row flex-wrap justify-center mt-4">
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => manejarCardPress(card)}
            activeOpacity={0.8}
            style={{ width: cardSize, height: cardSize, margin: 5 }}
            className={`rounded-2xl items-center justify-center border-2 
              ${card.isFlipped || card.isMatched ? "bg-white border-primary" : "bg-primary border-primary"}
            `}
          >
            {card.isFlipped || card.isMatched ? (
              card.type === "text" ? (
                <Text className="text-primary font-work-bold text-center text-sm px-1 capitalize">
                  {card.content}
                </Text>
              ) : (
                <View className="w-full h-full p-1 rounded-xl overflow-hidden">
                  {/* SMARTMEDIA AQUÍ */}
                  <SmartMedia
                    uri={card.content}
                    type={card.mediaType}
                    resizeMode="cover"
                    shouldPlay={true} // Se reproduce al voltear
                    isLooping={true}
                    isMuted={true} // Opcional, para no saturar audio
                    className="w-full h-full"
                  />
                </View>
              )
            ) : (
              <Ionicons name="help-outline" size={40} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* Modal igual que antes... */}
      <Modal visible={gameWon} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center">
            <Text className="text-3xl font-work-black text-primary text-center mb-2">
              ¡Excelente!
            </Text>
            <TouchableOpacity
              onPress={iniciarJuego}
              className="bg-primary w-full py-4 rounded-2xl mb-3 mt-4"
            >
              <Text className="text-white text-center font-bold text-lg">
                Jugar de Nuevo
              </Text>
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
