import { EntradaDiccionario } from '@/src/services/diccionario';
import { obtenerPalabrasMemorama } from '@/src/services/juegos';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, KeyboardAvoidingView, Modal, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EscribirSenaScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [palabras, setPalabras] = useState<EntradaDiccionario[]>([]);
  const [indice, setIndice] = useState(0);
  const [textoUsuario, setTextoUsuario] = useState('');
  const [mensaje, setMensaje] = useState<{ tipo: 'exito' | 'error' | null, texto: string }>({ tipo: null, texto: '' });
  const [loading, setLoading] = useState(true);
  const [juegoTerminado, setJuegoTerminado] = useState(false); // Modal

  useEffect(() => {
    cargarDatos();
  }, [id]);

  const cargarDatos = async () => {
    try {
      setLoading(true);
      reiniciarEstado(); // <--- Limpieza al iniciar
      const data = await obtenerPalabrasMemorama(id.toString(), 10);
      setPalabras(data);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  const reiniciarEstado = () => {
    setIndice(0);
    setTextoUsuario('');
    setMensaje({ tipo: null, texto: '' });
    setJuegoTerminado(false);
  };

  const verificarRespuesta = () => {
    const palabraCorrecta = palabras[indice].word;
    const inputNormalizado = textoUsuario.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    const correctaNormalizada = palabraCorrecta.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");

    if (inputNormalizado === correctaNormalizada) {
        setMensaje({ tipo: 'exito', texto: '¡Correcto!' });
        setTimeout(siguiente, 1500);
    } else {
        setMensaje({ tipo: 'error', texto: 'Inténtalo de nuevo' });
    }
  };

  const siguiente = () => {
      if (indice < palabras.length - 1) {
          setIndice(indice + 1);
          setTextoUsuario('');
          setMensaje({ tipo: null, texto: '' });
      } else {
          setJuegoTerminado(true); // <--- Modal
      }
  };

  if (loading) return <ActivityIndicator size="large" className="mt-10"/>;
  if (!palabras.length) return <Text>No hay datos.</Text>;

  const actual = palabras[indice];

  return (
    <SafeAreaView className="flex-1 bg-secondary-200">
      <Stack.Screen options={{ title: 'Escribir la Seña', headerBackTitle: 'Juegos' }} />
      
      <KeyboardAvoidingView 
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        className="flex-1 px-4 justify-center"
      >
        <Text className="text-center text-gray-400 mb-2">
            Palabra {indice + 1} de {palabras.length}
        </Text>

        <View className="h-64 bg-white rounded-3xl overflow-hidden mb-8 border border-gray-200 items-center justify-center shadow-sm">
            {actual.media_type === 'video' ? (
                <Video
                    source={{ uri: actual.media_url }}
                    style={{ width: '100%', height: '100%' }}
                    resizeMode={ResizeMode.CONTAIN}
                    shouldPlay
                    isLooping
                    isMuted
                />
            ) : (
                <Image source={{ uri: actual.media_url }} className="w-full h-full" resizeMode="contain" />
            )}
        </View>

        <Text className="text-primary font-work-bold text-center mb-2 text-lg">
            ¿Qué palabra es?
        </Text>
        
        <TextInput 
            value={textoUsuario}
            onChangeText={setTextoUsuario}
            placeholder="Escribe aquí..."
            className="bg-white p-4 rounded-2xl text-center text-xl font-work-bold text-primary border border-gray-200 mb-4"
            autoCapitalize="characters"
        />

        <TouchableOpacity 
            onPress={verificarRespuesta}
            className={`w-full py-4 rounded-2xl shadow-sm ${mensaje.tipo === 'exito' ? 'bg-green-500' : mensaje.tipo === 'error' ? 'bg-red-500' : 'bg-primary'}`}
        >
            <Text className="text-white text-center font-work-bold text-lg">
                {mensaje.tipo === 'exito' ? '¡Muy bien!' : mensaje.tipo === 'error' ? 'Incorrecto' : 'Comprobar'}
            </Text>
        </TouchableOpacity>
        
        <TouchableOpacity onPress={() => {
             alert(`La respuesta era: ${actual.word}`);
             siguiente();
        }} className="mt-4">
            <Text className="text-center text-gray-400 font-work-regular">No sé la respuesta</Text>
        </TouchableOpacity>

      </KeyboardAvoidingView>

      {/* MODAL DE VICTORIA */}
      <Modal visible={juegoTerminado} transparent={true} animationType="slide">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
            <View className="bg-white w-full rounded-3xl p-8 items-center shadow-lg">
                <Ionicons name="star" size={80} color="#F59E0B" className="mb-4" />
                <Text className="text-3xl font-work-black text-primary text-center mb-2">
                    ¡Juego Terminado!
                </Text>
                <Text className="text-gray-500 font-work-regular text-center mb-6">
                    Has practicado todas las señas de este nivel.
                </Text>
                
                <TouchableOpacity 
                    onPress={cargarDatos} // Reinicia el juego
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