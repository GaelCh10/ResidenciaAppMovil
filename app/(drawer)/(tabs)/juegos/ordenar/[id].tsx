import { EntradaDiccionario } from '@/src/services/diccionario';
import { obtenerPalabrasMemorama } from '@/src/services/juegos';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdenarPalabraScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [palabrasJuego, setPalabrasJuego] = useState<EntradaDiccionario[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [letrasDesordenadas, setLetrasDesordenadas] = useState<{ id: string, char: string, selected: boolean }[]>([]);
  const [letrasSeleccionadas, setLetrasSeleccionadas] = useState<{ id: string, char: string }[]>([]);
  
  const [loading, setLoading] = useState(true);
  const [estadoJuego, setEstadoJuego] = useState<'jugando' | 'ganaste' | 'error'>('jugando');
  const [juegoTerminado, setJuegoTerminado] = useState(false); // Estado para mostrar el Modal

  useEffect(() => {
    cargarJuego();
  }, [id]);

  const cargarJuego = async () => {
    try {
      setLoading(true);
      reiniciarEstado(); // <--- IMPORTANTE: Limpiamos todo al entrar
      
      const data = await obtenerPalabrasMemorama(id.toString(), 10);
      setPalabrasJuego(data);
      
      if (data.length > 0) {
        prepararNivel(data[0]);
      }
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const reiniciarEstado = () => {
    setIndiceActual(0);
    setJuegoTerminado(false);
    setLetrasSeleccionadas([]);
    setLetrasDesordenadas([]);
    setEstadoJuego('jugando');
  };

  const prepararNivel = (palabraObj: EntradaDiccionario) => {
    const palabra = palabraObj.word.toUpperCase();
    const letrasObj = palabra.split('').map((char, index) => ({
      id: `${index}-${char}`,
      char: char,
      selected: false
    }));

    setLetrasDesordenadas(letrasObj.sort(() => Math.random() - 0.5));
    setLetrasSeleccionadas([]);
    setEstadoJuego('jugando');
  };

  const manejarClickLetra = (letraObj: { id: string, char: string, selected: boolean }) => {
    if (letraObj.selected) return;

    const nuevaSeleccion = [...letrasSeleccionadas, { id: letraObj.id, char: letraObj.char }];
    setLetrasSeleccionadas(nuevaSeleccion);
    setLetrasDesordenadas(prev => prev.map(l => l.id === letraObj.id ? { ...l, selected: true } : l));

    const palabraMeta = palabrasJuego[indiceActual].word.toUpperCase();
    if (nuevaSeleccion.length === palabraMeta.length) {
      const palabraFormada = nuevaSeleccion.map(l => l.char).join('');
      
      if (palabraFormada === palabraMeta) {
        setEstadoJuego('ganaste');
        setTimeout(() => siguienteNivel(), 1000);
      } else {
        setEstadoJuego('error');
        setTimeout(() => {
            setLetrasSeleccionadas([]);
            setLetrasDesordenadas(prev => prev.map(l => ({ ...l, selected: false })));
            setEstadoJuego('jugando');
        }, 1000);
      }
    }
  };

  const devolverLetra = (letraId: string) => {
      if (estadoJuego !== 'jugando') return;
      const nuevasSeleccionadas = letrasSeleccionadas.filter(l => l.id !== letraId);
      setLetrasSeleccionadas(nuevasSeleccionadas);
      setLetrasDesordenadas(prev => prev.map(l => l.id === letraId ? { ...l, selected: false } : l));
  };

  const siguienteNivel = () => {
    if (indiceActual < palabrasJuego.length - 1) {
      const nuevoIndice = indiceActual + 1;
      setIndiceActual(nuevoIndice);
      prepararNivel(palabrasJuego[nuevoIndice]);
    } else {
      setJuegoTerminado(true); // <--- Activamos el Modal en lugar de alert
    }
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10" />;
  if (palabrasJuego.length === 0) return <Text className="text-center mt-10">No hay palabras.</Text>;

  const palabraActual = palabrasJuego[indiceActual];

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 p-4">
      <Stack.Screen options={{ title: 'Ordena la Palabra', headerBackTitle: 'Juegos' }} />

      <Text className="text-center text-gray-500 mb-4">
        Palabra {indiceActual + 1} de {palabrasJuego.length}
      </Text>

      <View className="items-center mb-8">
          <Image 
            source={{ uri: palabraActual.media_url }} 
            className="w-32 h-32 rounded-2xl bg-white"
            resizeMode="contain"
          />
      </View>

      <View className="flex-row flex-wrap justify-center mb-10 min-h-[60px]">
        {letrasSeleccionadas.map((item) => (
          <TouchableOpacity 
            key={item.id} 
            onPress={() => devolverLetra(item.id)}
            className={`w-12 h-12 border-b-4 mx-1 items-center justify-center 
                ${estadoJuego === 'ganaste' ? 'border-green-500' : estadoJuego === 'error' ? 'border-red-500' : 'border-primary'}`}
          >
            <Text className="text-2xl font-work-bold text-primary">{item.char}</Text>
          </TouchableOpacity>
        ))}
        {Array.from({ length: palabraActual.word.length - letrasSeleccionadas.length }).map((_, i) => (
             <View key={i} className="w-12 h-12 border-b-2 border-gray-300 mx-1" />
        ))}
      </View>

      <View className="flex-row flex-wrap justify-center gap-3">
        {letrasDesordenadas.map((item) => (
           <TouchableOpacity
             key={item.id}
             onPress={() => manejarClickLetra(item)}
             disabled={item.selected}
             className={`w-16 h-16 rounded-xl items-center justify-center shadow-sm 
                ${item.selected ? 'bg-gray-200' : 'bg-white border-2 border-secondary-500'}`}
           >
             {!item.selected && (
                 <Text className="text-4xl text-secondary-500" style={{ fontFamily: 'LsmVulpy' }}>
                    {item.char.toLowerCase()} 
                 </Text>
             )}
           </TouchableOpacity>
        ))}
      </View>

      {/* MODAL DE VICTORIA */}
      <Modal visible={juegoTerminado} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white w-full rounded-3xl p-8 items-center shadow-lg">
                <Ionicons name="trophy" size={80} color="#F59E0B" className="mb-4" />
                <Text className="text-3xl font-work-black text-primary text-center mb-2">
                    ¡Fantástico!
                </Text>
                <Text className="text-gray-500 font-work-regular text-center mb-6">
                    Has ordenado todas las palabras correctamente.
                </Text>
                
                <TouchableOpacity 
                    onPress={cargarJuego} // Recarga el juego (baraja de nuevo)
                    className="bg-primary w-full py-4 rounded-2xl mb-3"
                >
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