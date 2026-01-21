import SmartMedia from '@/components/shared/SmartMedia';
import { Ionicons } from '@expo/vector-icons';
import Voice, { SpeechResultsEvent } from '@react-native-voice/voice'; // <--- Importamos Voz
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Keyboard, Text, TextInput, TouchableOpacity, View } from 'react-native';

import { buscarPalabraOffline } from '@/src/hooks/useOfflineData';

export default function TraductorScreen() {
  const [input, setInput] = useState('');
  const [resultado, setResultado] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);
  
  // Estado para el micrófono
  const [isListening, setIsListening] = useState(false);

  // --- CONFIGURACIÓN DE VOZ ---
  useEffect(() => {
    // Configurar los "Listeners" (Escuchadores de eventos)
    Voice.onSpeechStart = () => setIsListening(true);
    Voice.onSpeechEnd = () => setIsListening(false);
    
    Voice.onSpeechResults = (e: SpeechResultsEvent) => {
      // Aquí llega lo que el usuario dijo
      if (e.value && e.value.length > 0) {
        const textoEscuchado = e.value[0]; // Tomamos la primera coincidencia
        setInput(textoEscuchado);
        setIsListening(false);
        traducir(textoEscuchado); // ¡Búsqueda automática!
      }
    };

    Voice.onSpeechError = (e) => {
      console.log('Error de voz:', e);
      setIsListening(false);
      Alert.alert("No te entendí", "Intenta hablar más fuerte o escribe la palabra.");
    };

    // Limpieza al salir de la pantalla
    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const iniciarEscucha = async () => {
    setResultado(null);
    setInput('');
    try {
      await Voice.start('es-MX'); // Español de México
    } catch (e) {
      console.error(e);
    }
  };

  const detenerEscucha = async () => {
    try {
      await Voice.stop();
    } catch (e) {
      console.error(e);
    }
  };
  // -----------------------------

  // Función de búsqueda (acepta un texto opcional para cuando viene de la voz)
  const traducir = async (textoOverride?: string) => {
    const termino = textoOverride || input;
    
    if (!termino.trim()) return;
    Keyboard.dismiss();
    setBuscando(true);
    setResultado(null);

    // Usamos la función Offline que creamos antes
    const coincidencias: any[] = await buscarPalabraOffline(termino);

    if (coincidencias.length > 0) {
      setResultado(coincidencias[0]); 
    } else {
      setResultado('nofound');
    }
    setBuscando(false);
  };

  return (
    <View className="flex-1 bg-secondary-200 p-6">
       
       <Text className="text-center font-work-black text-2xl text-primary mb-2 mt-4">Traductor LSM</Text>
       <Text className="text-center text-gray-500 mb-8">Presiona y habla para traducir</Text>

       {/* --- BOTÓN DE MICRÓFONO GRANDE --- */}
       <View className="items-center mb-8">
         <TouchableOpacity 
            onPress={isListening ? detenerEscucha : iniciarEscucha}
            className={`w-32 h-32 rounded-full justify-center items-center shadow-lg border-4 
              ${isListening ? 'bg-red-500 border-red-200' : 'bg-primary border-blue-200'}`}
         >
            {isListening ? (
              // Animación simple (o icono de stop)
              <View className="items-center">
                 <Ionicons name="mic-off" size={50} color="white" />
                 <Text className="text-white font-bold text-xs mt-1">Escuchando...</Text>
              </View>
            ) : (
              <Ionicons name="mic" size={60} color="white" />
            )}
         </TouchableOpacity>
       </View>

       {/* --- INPUT DE TEXTO (SECUNDARIO / FALLBACK) --- */}
       <View className="bg-white p-3 rounded-2xl flex-row items-center mb-6 shadow-sm border border-gray-100">
         <TextInput 
            value={input} 
            onChangeText={setInput} 
            placeholder="O escribe aquí..."
            className="flex-1 text-lg font-work-regular text-center text-gray-700"
            onSubmitEditing={() => traducir()}
         />
         {/* Botón pequeño para buscar si escribieron manual */}
         <TouchableOpacity onPress={() => traducir()} className="p-2">
            <Ionicons name="search" color="#ccc" size={24} />
         </TouchableOpacity>
       </View>

       {/* --- RESULTADOS --- */}
       {buscando && <ActivityIndicator size="large" color="#2563EB" className="mt-4"/>}

       {resultado === 'nofound' && (
          <View className="items-center mt-4 bg-red-50 p-4 rounded-xl">
             <Text className="text-red-500 text-lg font-bold">No encontrada 😔</Text>
             <Text className="text-gray-500 text-center mt-1">
                Aún no tenemos la seña para "{input}". Intenta con un sinónimo.
             </Text>
          </View>
       )}

       {resultado && resultado !== 'nofound' && (
          <View className="bg-white rounded-3xl overflow-hidden shadow-2xl items-center border border-gray-100 flex-1 mb-6">
             {/* VIDEO/IMAGEN OFFLINE */}
             <View className="w-full flex-1 bg-gray-100">
                <SmartMedia 
                   uri={resultado.media_url} 
                   type={resultado.media_type}
                   resizeMode="contain"
                   autoPlay={true}
                   isLooping={true}
                />
             </View>
             <View className="p-6 w-full bg-white border-t border-gray-100 items-center">
                <Text className="text-xs text-gray-400 uppercase tracking-widest mb-1">Traducción</Text>
                <Text className="text-4xl font-work-black text-primary capitalize">{resultado.word}</Text>
             </View>
          </View>
       )}
    </View>
  );
}