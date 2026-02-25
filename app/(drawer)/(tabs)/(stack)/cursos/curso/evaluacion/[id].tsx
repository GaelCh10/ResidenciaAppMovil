import SmartMedia from "@/components/shared/SmartMedia";
import { usePreguntasOffline } from "@/src/hooks/useOfflineData";
import { supabase } from "@/src/lib/supabase";
import { guardarProgresoCurso } from "@/src/services/cursos";
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Modal,
  ScrollView,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

const mensajesExito = ["¡Excelente! 🌟", "¡Muy bien! 👍", "¡Sigue así! 🚀", "¡Perfecto! ✨", "¡Eres increíble! 👏"];
const mensajesError = ["¡No te rindas! 💪", "Casi lo logras 😅", "Sigue practicando 📚"];

export default function EvaluacionPantalla() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const { data: preguntas, loading } = usePreguntasOffline(
    id ? id.toString() : "",
  );

  const [indiceActual, setIndiceActual] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);
  const [respuestaVerificada, setRespuestaVerificada] = useState(false); 
  const [feedback, setFeedback] = useState<{ texto: string, tipo: 'exito' | 'error' } | null>(null);

  const getMediaType = (url: string) => {
    if (!url) return 'image';
    const extension = url.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'mkv', 'webm'];
    
    if (videoExtensions.includes(extension || '')) {
        return 'video';
    }
    return 'image';
  };

  const manejarRespuesta = (opcion: string) => {
    setRespuestaSeleccionada(opcion);
    const esCorrecta = opcion === preguntas[indiceActual].correct_answer;

    if (esCorrecta) {
      setPuntaje(prev => prev + 1);
      setFeedback({
          texto: mensajesExito[Math.floor(Math.random() * mensajesExito.length)],
          tipo: 'exito'
      });

      setTimeout(() => {
        avanzarSiguiente(true);
      }, 1500); 
    } else {
      setFeedback({
          texto: mensajesError[Math.floor(Math.random() * mensajesError.length)],
          tipo: 'error'
      });
    }
  };

  const verificarRespuesta = () => {
    setRespuestaVerificada(true);
    setTimeout(() => {
        avanzarSiguiente(false);
    }, 2000);
  };

   const avanzarSiguiente = (fueCorrecta: boolean) => {
    if (indiceActual < preguntas.length - 1) {
      setIndiceActual(prev => prev + 1);
      setRespuestaSeleccionada(null);
      setRespuestaVerificada(false);
      setFeedback(null); 
    } else {
      terminarExamen(fueCorrecta ? puntaje + 1 : puntaje);
    }
  };

  const terminarExamen = async (puntajeFinal: number) => {
    const calificacion = Math.round((puntajeFinal / preguntas.length) * 10);
    if (calificacion >= 6) {
      try {
        const { data: { user } } = await supabase.auth.getUser();

        if (user) {
          await guardarProgresoCurso(user.id, id.toString(), calificacion);
        } else {
          console.warn("Offline: Progreso guardado localmente (pendiente de sync).");
        }
      } catch (error) {
        console.error("Error al obtener usuario:", error);
      }
    }
    setPuntaje(puntajeFinal);
    setMostrarResultado(true);
  };

  if (loading) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
      </View>
    );
  }

  if (!preguntas || preguntas.length === 0) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center p-6">
        <Text className="text-primary text-lg text-center font-work-bold">
          No hay preguntas configuradas para este curso aún.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="bg-primary px-6 py-3 rounded-xl mt-4"
        >
          <Text className="text-white">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const preguntaActual = preguntas[indiceActual];
  if (!preguntaActual) return null;

  const esPreguntaImagen = preguntaActual.question_type === 'image';
  const calificacionFinal = Math.round((puntaje / preguntas.length) * 10);
  const aprobado = calificacionFinal >= 6; // Umbral de aprobación
  const tipoMedio = preguntaActual.media_url ? getMediaType(preguntaActual.media_url) : 'none';

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      
      <View className="flex-row items-center justify-between mb-2 mt-2">
        <TouchableOpacity 
            onPress={() => router.back()} 
            className="bg-white p-3 rounded-full shadow-sm"
        >
            <Ionicons name="arrow-back" size={24} color="#2563EB" />
        </TouchableOpacity>
        <Text className="text-xl font-work-black text-primary">Evaluación</Text>
        <View style={{width: 48}} /> 
      </View>
      <Text className="text-center font-bold text-gray-500 mb-2">
        Pregunta {indiceActual + 1} de {preguntas.length}
      </Text>

      <View className="flex-row items-center h-2 bg-gray-200 rounded-full mb-6 overflow-hidden">
        <View
          className="bg-primary h-full transition-all duration-300"
          style={{ width: `${((indiceActual + 1) / preguntas.length) * 100}%` }}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }} showsVerticalScrollIndicator={false}>
        
        <View className="bg-white p-6 rounded-3xl shadow-sm mb-6">
          <Text className="text-xl font-work-bold text-primary text-center mb-2">
            {preguntaActual.question_text}
          </Text>
          
          {!esPreguntaImagen && preguntaActual.media_url && (
             <View className="h-48 w-full mt-4 rounded-xl overflow-hidden bg-gray-100 border border-gray-100">
                <SmartMedia 
                    uri={preguntaActual.media_url} 
                    type={tipoMedio} 
                    resizeMode="contain" 
                    isLooping={true} 
                    useNativeControls={tipoMedio === 'video'}
                />
             </View>
          )}
          {feedback && (
            <View className={`mt-4 p-3 rounded-xl border ${feedback.tipo === 'exito' ? 'bg-green-50 border-green-200' : 'bg-orange-50 border-orange-200'}`}>
                <Text className={`text-center font-bold text-lg ${feedback.tipo === 'exito' ? 'text-green-600' : 'text-orange-600'}`}>
                    {feedback.texto}
                </Text>
            </View>
          )}
        </View>
        {esPreguntaImagen ? (
            <View className="flex-row flex-wrap justify-between">
                {preguntaActual.options.map((opcion: string, index: number) => {
                    let borderColor = "border-transparent";
                    let overlayColor = "bg-transparent";
                    let icon = null;

                    if (respuestaSeleccionada) {
                        const esLaCorrecta = opcion === preguntaActual.correct_answer;
                        const fueSeleccionada = opcion === respuestaSeleccionada;

                        if (esLaCorrecta && (respuestaVerificada || fueSeleccionada)) {
                            borderColor = "border-green-500 border-4";
                            overlayColor = "bg-green-500/20";
                            icon = "checkmark-circle";
                        } else if (fueSeleccionada && !esLaCorrecta) {
                            borderColor = "border-red-500 border-4";
                            overlayColor = "bg-red-500/20";
                            icon = "close-circle";
                        } else {
                            overlayColor = "bg-white/50"; 
                        }
                    }

                    return (
                        <TouchableOpacity
                            key={index}
                            disabled={respuestaSeleccionada !== null}
                            onPress={() => manejarRespuesta(opcion)}
                            className={`w-[48%] aspect-square bg-white rounded-2xl mb-4 overflow-hidden shadow-sm border-2 ${borderColor}`}
                        >
                            <SmartMedia 
                                uri={opcion} 
                                type="image" 
                                resizeMode="cover" 
                                className="w-full h-full"
                            />
                            
                            <View className={`absolute inset-0 items-center justify-center ${overlayColor}`}>
                                {icon && <Ionicons name={icon as any} size={40} color={icon.includes('checkmark') ? '#16A34A' : '#EF4444'} />}
                            </View>
                        </TouchableOpacity>
                    );
                })}
            </View>
        ) : (
            <View className="space-y-3">
              {preguntaActual.options.map((opcion: string, index: number) => {
                 let btnColor = "bg-white border-primary";
                 let textColor = "text-primary";
                 let iconName = null;

                 if (respuestaSeleccionada) {
                    const esLaCorrecta = opcion === preguntaActual.correct_answer;
                    const fueSeleccionada = opcion === respuestaSeleccionada;

                    if (esLaCorrecta && (respuestaVerificada || fueSeleccionada)) {
                        btnColor = "bg-green-500 border-green-500"; 
                        textColor = "text-white"; 
                        iconName = "checkmark-circle";
                    } else if (fueSeleccionada && !esLaCorrecta) {
                        btnColor = "bg-red-500 border-red-500"; 
                        textColor = "text-white"; 
                        iconName = "close-circle";
                    }
                 }
                 
                 return (
                    <TouchableOpacity 
                        key={index} 
                        disabled={respuestaSeleccionada !== null} 
                        onPress={() => manejarRespuesta(opcion)} 
                        className={`border-2 rounded-2xl p-4 flex-row items-center justify-between mb-3 ${btnColor}`}
                    >
                        <Text className={`text-lg font-work-medium flex-1 ${textColor}`}>{opcion}</Text>
                        {iconName && (
                            <Ionicons name={iconName as any} size={24} color="white" />
                        )}
                    </TouchableOpacity>
                 );
              })}
            </View>
        )}

        {respuestaSeleccionada && 
         respuestaSeleccionada !== preguntaActual.correct_answer && 
         !respuestaVerificada && (
            <TouchableOpacity 
                onPress={verificarRespuesta}
                className="bg-orange-500 mt-4 py-4 rounded-xl items-center shadow-md flex-row justify-center"
            >
                <Ionicons name="eye" size={24} color="white" className="mr-2" />
                <Text className="text-white font-bold text-lg ml-2">Ver respuesta correcta</Text>
            </TouchableOpacity>
        )}

      </ScrollView>
      <Modal visible={mostrarResultado} animationType="slide" transparent={true}>
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white w-full rounded-3xl p-8 items-center shadow-lg">
            <Ionicons
              name={aprobado ? "trophy" : "sad"}
              size={80}
              color={aprobado ? "#F59E0B" : "#EF4444"}
              style={{ marginBottom: 20 }}
            />
            <Text className="text-3xl font-work-black text-primary mb-2 text-center">
              {aprobado ? "¡Felicidades!" : "Sigue esforzándote"}
            </Text>
            <Text className="text-gray-500 text-center mb-6 font-work-regular">
              {aprobado
                ? "Has completado este curso exitosamente."
                : "No te preocupes, siempre podemos mejorar."}
            </Text>
            <View className="bg-secondary-100 px-8 py-4 rounded-2xl mb-8 items-center">
              <Text className="text-xs text-gray-500 font-bold tracking-widest mb-1">Calificación</Text>
              <Text className={`text-6xl font-work-black ${aprobado ? 'text-green-600' : 'text-orange-600'}`}>
                {calificacionFinal}
                <Text className="text-2xl text-gray-400">/10</Text>
              </Text>
            </View>
            {aprobado ? (
              <TouchableOpacity
                onPress={() => router.replace("/cursos")}
                className="bg-primary w-full py-4 rounded-2xl shadow-sm"
              >
                <Text className="text-white text-center font-work-bold text-lg">
                  Finalizar
                </Text>
              </TouchableOpacity>
            ) : (
              <>
                <TouchableOpacity
                  onPress={() => {
                    setIndiceActual(0);
                    setPuntaje(0);
                    setRespuestaSeleccionada(null);
                    setRespuestaVerificada(false);
                    setFeedback(null);
                    setMostrarResultado(false);
                  }}
                  className="bg-orange-500 w-full py-4 rounded-2xl mb-4 shadow-sm"
                >
                  <Text className="text-white text-center font-work-bold text-lg">
                    Reintentar evaluación
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={() => router.replace("/cursos")}>
                  <Text className="text-gray-500 font-work-bold text-base">
                    Finalizar y salir
                  </Text>
                </TouchableOpacity>
              </>
            )}

          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}