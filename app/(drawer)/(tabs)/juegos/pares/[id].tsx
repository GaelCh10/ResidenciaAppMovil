import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, Modal, ActivityIndicator, Image } from 'react-native';
import { useLocalSearchParams, useRouter, Stack } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Video, ResizeMode } from 'expo-av';
import { obtenerPalabrasMemorama } from '@/src/services/juegos';

export default function EncontrarParesScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [columnaIzq, setColumnaIzq] = useState<any[]>([]); // Palabras
  const [columnaDer, setColumnaDer] = useState<any[]>([]); // Media
  
  const [seleccionIzq, setSeleccionIzq] = useState<string | null>(null);
  const [seleccionDer, setSeleccionDer] = useState<string | null>(null);
  const [paresEncontrados, setParesEncontrados] = useState<string[]>([]); // IDs resueltos

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
      const data = await obtenerPalabrasMemorama(id.toString(), 4);
      
      // Columna Izquierda: Tal cual
      setColumnaIzq(data);
      
      // Columna Derecha: Duplicamos y barajamos
      const media = [...data].sort(() => Math.random() - 0.5);
      setColumnaDer(media);

    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const manejarToque = (lado: 'izq' | 'der', itemId: string) => {
    if (paresEncontrados.includes(itemId)) return; // Ya resuelto

    if (lado === 'izq') {
        setSeleccionIzq(itemId);
        if (seleccionDer) verificarMatch(itemId, seleccionDer);
    } else {
        setSeleccionDer(itemId);
        if (seleccionIzq) verificarMatch(seleccionIzq, itemId);
    }
  };

  const verificarMatch = (idIzq: string, idDer: string) => {
    if (idIzq === idDer) {
        // MATCH CORRECTO
        const nuevosPares = [...paresEncontrados, idIzq];
        setParesEncontrados(nuevosPares);
        setSeleccionIzq(null);
        setSeleccionDer(null);

        if (nuevosPares.length === columnaIzq.length) {
            setTimeout(() => setJuegoTerminado(true), 500);
        }
    } else {
        // ERROR: Resetear selecciones tras un momento
        setTimeout(() => {
            setSeleccionIzq(null);
            setSeleccionDer(null);
        }, 500);
    }
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10" />;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 p-4">
      <Stack.Screen options={{ title: 'Encontrar Pares', headerBackTitle: 'Juegos' }} />
      
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-primary font-bold">← Volver al Menú</Text>
      </TouchableOpacity>

      <View className="flex-1 flex-row justify-between mt-4">
        
        {/* COLUMNA IZQUIERDA (PALABRAS) */}
        <View className="w-[45%] gap-4">
            {columnaIzq.map((item) => {
                const esResuelto = paresEncontrados.includes(item.id);
                const esSeleccionado = seleccionIzq === item.id;
                
                return (
                    <TouchableOpacity 
                        key={item.id}
                        disabled={esResuelto}
                        onPress={() => manejarToque('izq', item.id)}
                        className={`h-24 justify-center items-center rounded-xl border-2 px-2
                            ${esResuelto ? 'bg-green-100 border-green-500' : 
                              esSeleccionado ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'}`}
                    >
                        <Text className="text-center font-bold text-primary">{item.word}</Text>
                    </TouchableOpacity>
                );
            })}
        </View>

        {/* COLUMNA DERECHA (MEDIA) */}
        <View className="w-[45%] gap-4">
            {columnaDer.map((item) => {
                const esResuelto = paresEncontrados.includes(item.id);
                const esSeleccionado = seleccionDer === item.id;

                return (
                    <TouchableOpacity 
                        key={item.id}
                        disabled={esResuelto}
                        onPress={() => manejarToque('der', item.id)}
                        className={`h-24 justify-center items-center rounded-xl border-2 overflow-hidden
                            ${esResuelto ? 'bg-green-100 border-green-500' : 
                              esSeleccionado ? 'bg-blue-100 border-blue-500' : 'bg-white border-gray-200'}`}
                    >
                        {item.media_type === 'video' ? (
                            <Video 
                                source={{ uri: item.media_url }} 
                                style={{ width: '100%', height: '100%' }} 
                                resizeMode={ResizeMode.COVER} 
                                shouldPlay isLooping isMuted 
                            />
                        ) : (
                            <Image source={{ uri: item.media_url }} className="w-full h-full" resizeMode="contain" />
                        )}
                    </TouchableOpacity>
                );
            })}
        </View>
      </View>

      <Modal visible={juegoTerminado} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white p-8 rounded-3xl w-full items-center">
                <Text className="text-2xl font-bold text-primary mb-4">¡Conexiones listas!</Text>
                <TouchableOpacity onPress={iniciarJuego} className="bg-primary w-full py-3 rounded-xl mt-6">
                    <Text className="text-white text-center font-bold">Jugar de nuevo</Text>
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