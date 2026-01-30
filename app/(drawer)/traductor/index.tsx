import SmartMedia from "@/components/shared/SmartMedia";
import { buscarPalabraOffline } from "@/src/hooks/useOfflineData";
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  ActivityIndicator,
  Keyboard,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

export default function TraductorScreen() {
  const [input, setInput] = useState("");
  const [resultado, setResultado] = useState<any>(null);
  const [buscando, setBuscando] = useState(false);

  // Función de búsqueda manual
  const traducir = async () => {
    if (!input.trim()) return;
    
    Keyboard.dismiss();
    setBuscando(true);
    setResultado(null);

    // Usamos la función Offline
    const coincidencias: any[] = await buscarPalabraOffline(input.trim());

    if (coincidencias.length > 0) {
      setResultado(coincidencias[0]); // Mostramos la mejor coincidencia
    } else {
      setResultado("nofound");
    }
    setBuscando(false);
  };

  return (
    <View className="flex-1 bg-secondary-200 p-6">
      
      {/* --- HEADER --- */}
      <View className="mt-6 mb-8 items-center">
        <View className="w-16 h-16 bg-primary rounded-3xl items-center justify-center mb-4 shadow-lg shadow-blue-200">
            <Ionicons name="language" size={32} color="white" />
        </View>
        <Text className="text-center font-work-black text-3xl text-primary mb-1">
            Diccionario LSM
        </Text>
        <Text className="text-center text-gray-500 font-work-regular">
            Escribe una palabra para ver su seña
        </Text>
      </View>

      {/* --- BARRA DE BÚSQUEDA --- */}
      <View className="bg-white p-2 pl-5 rounded-3xl flex-row items-center mb-8 shadow-sm border border-gray-100">
        <TextInput
          value={input}
          onChangeText={(text) => {
            setInput(text);
            if(text === '') setResultado(null); // Limpiar si borran todo
          }}
          placeholder="Ej: Casa, Hola, Gracias..."
          placeholderTextColor="#9CA3AF"
          className="flex-1 text-lg font-work-medium text-gray-800 h-14"
          returnKeyType="search"
          onSubmitEditing={traducir}
        />
        
        {/* Botón de Buscar */}
        <TouchableOpacity 
            onPress={traducir} 
            className={`p-4 rounded-2xl ${input.trim() ? 'bg-primary' : 'bg-gray-200'}`}
            disabled={!input.trim()}
        >
          <Ionicons name="search" color={input.trim() ? "white" : "#9CA3AF"} size={24} />
        </TouchableOpacity>
      </View>

      {/* --- ESTADO DE CARGA --- */}
      {buscando && (
        <View className="flex-1 justify-center items-center">
            <ActivityIndicator size="large" color="#2563EB" />
            <Text className="text-gray-400 mt-4 font-work-medium">Buscando en diccionario...</Text>
        </View>
      )}

      {/* --- RESULTADO NO ENCONTRADO --- */}
      {resultado === "nofound" && !buscando && (
        <View className="items-center mt-8 bg-white p-8 rounded-3xl shadow-sm border border-gray-100">
          <View className="bg-red-50 p-4 rounded-full mb-4">
            <Ionicons name="search-outline" size={40} color="#EF4444" />
          </View>
          <Text className="text-gray-800 text-xl font-work-bold mb-2 text-center">
            No encontrada
          </Text>
          <Text className="text-gray-500 text-center font-work-regular leading-6">
            Aún no tenemos la seña para <Text className="font-bold text-gray-700">"{input}"</Text>.
            {"\n"}Intenta con un sinónimo simple.
          </Text>
        </View>
      )}

      {/* --- RESULTADO EXITOSO --- */}
      {resultado && resultado !== "nofound" && !buscando && (
        <View className="flex-1 bg-white rounded-3xl overflow-hidden shadow-xl border border-gray-100 mb-6">
          
          {/* VISOR MULTIMEDIA */}
          <View className="w-full flex-1 bg-black relative">
            <SmartMedia
              uri={resultado.media_url}
              type={resultado.media_type || (resultado.media_url?.endsWith('mp4') ? 'video' : 'image')}
              resizeMode="contain"
              autoPlay={true}
              isLooping={true}
              useNativeControls={true}
            />
          </View>

          {/* INFORMACIÓN */}
          <View className="p-6 bg-white border-t border-gray-100 items-center">
            <Text className="text-xs text-blue-500 font-bold uppercase tracking-widest mb-2 bg-blue-50 px-3 py-1 rounded-full">
              Traducción
            </Text>
            <Text
              className="text-4xl font-work-black text-gray-900 capitalize text-center mb-1"
            >
              {resultado.word}
            </Text>
            
            {/* Si quieres mostrar la glosa en fuente de señas */}
            <Text
                style={{ fontFamily: "LsmVulpy" }}
                className="text-5xl text-secondary-500 text-center mt-2"
            >
                {resultado.word}
            </Text>
          </View>
        </View>
      )}
    </View>
  );
}