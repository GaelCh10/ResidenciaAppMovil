import { obtenerPalabrasMemorama } from '@/src/services/juegos';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Modal, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FormarPalabrasScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [palabrasMeta, setPalabrasMeta] = useState<{word: string, found: boolean}[]>([]);
  const [letrasPool, setLetrasPool] = useState<{id: string, char: string, used: boolean}[]>([]);
  const [inputActual, setInputActual] = useState<{id: string, char: string}[]>([]);
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    iniciarJuego();
  }, [id]);

  const iniciarJuego = async () => {
    setLoading(true);
    setJuegoTerminado(false);
    setInputActual([]);
    
    try {
      // Pedimos 3 palabras
      const data = await obtenerPalabrasMemorama(id.toString(), 3);
      const metas = data.map(p => ({
        word: p.word.toUpperCase().normalize("NFD").replace(/[\u0300-\u036f]/g, ""),
        found: false
      }));
      setPalabrasMeta(metas);

      // Crear pool de letras mezcladas
      let letras: any[] = [];
      metas.forEach(m => {
        m.word.split('').forEach((char, i) => {
            letras.push({ id: `${m.word}-${i}-${Math.random()}`, char, used: false });
        });
      });
      setLetrasPool(letras.sort(() => Math.random() - 0.5));

    } catch (e) { console.error(e); } finally { setLoading(false); }
  };

  const manejarLetra = (letraObj: any) => {
    const nuevoInput = [...inputActual, letraObj];
    setInputActual(nuevoInput);
    
    // Marcar como usada visualmente
    setLetrasPool(prev => prev.map(l => l.id === letraObj.id ? { ...l, used: true } : l));

    // Validar si formó alguna palabra
    const textoFormado = nuevoInput.map(l => l.char).join('');
    const match = palabrasMeta.find(p => p.word === textoFormado && !p.found);

    if (match) {
        // Encontró una palabra
        setPalabrasMeta(prev => prev.map(p => p.word === match.word ? { ...p, found: true } : p));
        setInputActual([]); // Limpiar input para la siguiente
        
        // Las letras usadas se quedan usadas permanentemente (o se borran del pool)
        // En este diseño simple, las dejamos usadas.
        
        // Verificar victoria
        const nuevasMetas = palabrasMeta.map(p => p.word === match.word ? { ...p, found: true } : p);
        if (nuevasMetas.every(p => p.found)) setJuegoTerminado(true);
    }
  };

  const borrarInput = () => {
    // Regresa todas las letras del input al pool
    const idsRestaurar = inputActual.map(l => l.id);
    setLetrasPool(prev => prev.map(l => idsRestaurar.includes(l.id) ? { ...l, used: false } : l));
    setInputActual([]);
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10"/>;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 p-4">
      <Stack.Screen options={{ title: 'Formar Palabras', headerBackTitle: 'Juegos' }} />
      
      <TouchableOpacity onPress={() => router.back()} className="mb-4">
        <Text className="text-primary font-bold">← Reiniciar / Salir</Text>
      </TouchableOpacity>

      {/* OBJETIVOS */}
      <View className="bg-white p-4 rounded-xl mb-6 shadow-sm">
        <Text className="text-center text-gray-500 mb-2">Encuentra estas 3 palabras:</Text>
        {palabrasMeta.map((p, i) => (
            <View key={i} className="flex-row items-center justify-between mb-2">
                <Text className="text-lg font-bold text-gray-300">
                    {p.found ? p.word : "????"}
                </Text>
                {p.found && <Ionicons name="checkmark-circle" size={24} color="green" />}
            </View>
        ))}
      </View>

      {/* INPUT ACTUAL (Español) */}
      <View className="flex-row justify-center items-center bg-white h-16 rounded-xl mb-2 border border-primary px-4">
        <Text className="text-2xl font-bold tracking-widest text-primary flex-1 text-center">
            {inputActual.map(l => l.char).join('')}
        </Text>
        {inputActual.length > 0 && (
            <TouchableOpacity onPress={borrarInput}>
                <Ionicons name="backspace" size={24} color="red" />
            </TouchableOpacity>
        )}
      </View>
      <Text className="text-center text-xs text-gray-400 mb-6">Toca las letras para formar la palabra</Text>

      {/* POOL DE LETRAS (LSM) */}
      <View className="flex-row flex-wrap justify-center gap-2">
        {letrasPool.map((l) => (
            <TouchableOpacity 
                key={l.id}
                disabled={l.used}
                onPress={() => manejarLetra(l)}
                className={`w-14 h-14 justify-center items-center rounded-lg 
                    ${l.used ? 'bg-gray-200 opacity-50' : 'bg-white border-b-4 border-secondary-500'}`}
            >
                 <Text style={{ fontFamily: 'LsmVulpy' }} className="text-4xl text-secondary-500">
                    {l.char.toLowerCase()}
                </Text>
            </TouchableOpacity>
        ))}
      </View>

      <Modal visible={juegoTerminado} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white p-8 rounded-3xl w-full items-center">
                <Text className="text-2xl font-bold text-primary mb-4">¡Excelente!</Text>
                <Text>Has encontrado las 3 palabras.</Text>
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