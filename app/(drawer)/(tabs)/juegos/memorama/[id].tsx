import { obtenerPalabrasMemorama } from '@/src/services/juegos';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Dimensions, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

// Definimos el tipo de una "Tarjeta" en el tablero
interface TarjetaJuego {
  id: string;        // ID único de la tarjeta (para React keys)
  wordId: string;    // ID de la palabra (para saber si hacen match)
  content: string;   // URL de imagen o Texto de la palabra
  type: 'image' | 'text';
  mediaType?: 'video' | 'image'; // Solo si es tipo imagen
  isFlipped: boolean;
  isMatched: boolean;
}

const numColumns = 3;
const screenWidth = Dimensions.get('window').width;
const cardSize = (screenWidth - 40) / numColumns - 10; // Cálculo dinámico del tamaño

export default function MemoramaScreen() {
  const { id } = useLocalSearchParams(); // ID de la categoría
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
      // 1. Pedimos 6 palabras
      const palabras = await obtenerPalabrasMemorama(id.toString(), 6);

      // 2. Duplicamos: Creamos la carta A (Imagen) y la carta B (Texto)
      let deck: TarjetaJuego[] = [];
      
      palabras.forEach((p) => {
        // Carta 1: La Imagen/Video
        deck.push({
          id: p.id + '-img',
          wordId: p.id,
          content: p.media_url,
          type: 'image',
          mediaType: p.media_type,
          isFlipped: false,
          isMatched: false,
        });
        // Carta 2: El Texto
        deck.push({
          id: p.id + '-txt',
          wordId: p.id,
          content: p.word,
          type: 'text',
          isFlipped: false,
          isMatched: false,
        });
      });

      // 3. Barajamos el deck final
      deck = deck.sort(() => Math.random() - 0.5);
      setCards(deck);

    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const manejarCardPress = (card: TarjetaJuego) => {
    // Si ya está girada, o ya hizo match, o el tablero está bloqueado -> No hacer nada
    if (card.isFlipped || card.isMatched || bloquearTablero) return;

    // 1. Girar la carta seleccionada
    const nuevoDeck = cards.map(c => 
      c.id === card.id ? { ...c, isFlipped: true } : c
    );
    setCards(nuevoDeck);

    const nuevasSeleccionadas = [...selectedCards, card];
    setSelectedCards(nuevasSeleccionadas);

    // 2. Si es la segunda carta, verificamos Match
    if (nuevasSeleccionadas.length === 2) {
      setBloquearTablero(true); // Bloqueamos para que no toque una 3ra carta
      verificarMatch(nuevasSeleccionadas, nuevoDeck);
    }
  };

  const verificarMatch = (seleccionadas: TarjetaJuego[], deckActual: TarjetaJuego[]) => {
    const [carta1, carta2] = seleccionadas;
    const esMatch = carta1.wordId === carta2.wordId;

    if (esMatch) {
      // ACIERTO: Marcamos como matched
      const deckActualizado = deckActual.map(c => 
        c.wordId === carta1.wordId ? { ...c, isMatched: true } : c
      );
      setCards(deckActualizado);
      setSelectedCards([]);
      setBloquearTablero(false);

      // Verificar si ganó (todas matched)
      if (deckActualizado.every(c => c.isMatched)) {
        setTimeout(() => setGameWon(true), 500);
      }
    } else {
      // FALLO: Esperamos 1 seg y las volteamos de nuevo
      setTimeout(() => {
        const deckReseteado = deckActual.map(c => 
          (c.id === carta1.id || c.id === carta2.id) ? { ...c, isFlipped: false } : c
        );
        setCards(deckReseteado);
        setSelectedCards([]);
        setBloquearTablero(false);
      }, 1000);
    }
  };

  if (loading) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#your_primary_color" />
      </View>
    );
  }

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 p-2">
      <Stack.Screen options={{ title: 'Memorama', headerBackTitle: 'Juegos' }} />

      {/* Tablero de Cartas */}
      <View className="flex-row flex-wrap justify-center mt-4">
        {cards.map((card) => (
          <TouchableOpacity
            key={card.id}
            onPress={() => manejarCardPress(card)}
            activeOpacity={0.8}
            style={{ width: cardSize, height: cardSize, margin: 5 }}
            className={`rounded-2xl items-center justify-center border-2 
              ${card.isFlipped || card.isMatched ? 'bg-white border-primary' : 'bg-primary border-primary'}
            `}
          >
            {card.isFlipped || card.isMatched ? (
              // LADO FRONTAL (Contenido)
              card.type === 'text' ? (
                <Text className="text-primary font-work-bold text-center text-sm px-1">
                  {card.content}
                </Text>
              ) : (
                // Imagen o Video
                <View className="w-full h-full p-1 rounded-xl overflow-hidden">
                    {card.mediaType === 'video' ? (
                         <Video
                         source={{ uri: card.content }}
                         style={{ width: '100%', height: '100%' }}
                         resizeMode={ResizeMode.COVER}
                         shouldPlay={true} // Reproducir solo al voltear
                         isLooping
                         isMuted
                       />
                    ) : (
                        <Image 
                        source={{ uri: card.content }} 
                        className="w-full h-full rounded-lg" 
                        resizeMode="contain"
                        />
                    )}
                </View>
              )
            ) : (
              // LADO TRASERO (Dorso)
              <Ionicons name="help-outline" size={40} color="white" />
            )}
          </TouchableOpacity>
        ))}
      </View>

      {/* MODAL DE VICTORIA */}
      <Modal visible={gameWon} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white w-full rounded-3xl p-8 items-center shadow-lg">
                <Ionicons name="trophy" size={80} color="#F59E0B" className="mb-4" />
                <Text className="text-3xl font-work-black text-primary text-center mb-2">
                    ¡Excelente!
                </Text>
                <Text className="text-gray-500 font-work-regular text-center mb-6">
                    Has encontrado todos los pares.
                </Text>
                
                <TouchableOpacity 
                    onPress={iniciarJuego}
                    className="bg-primary w-full py-4 rounded-2xl mb-3"
                >
                    <Text className="text-white text-center font-bold text-lg">Jugar de Nuevo</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                    onPress={() => router.back()}
                >
                    <Text className="text-primary font-bold mt-2">Salir</Text>
                </TouchableOpacity>
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}