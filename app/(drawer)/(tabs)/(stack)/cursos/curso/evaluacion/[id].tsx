import SmartMedia from "@/components/shared/SmartMedia";
import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
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

// IMPORTANTE: Hook offline
import { usePreguntasOffline } from "@/src/hooks/useOfflineData";
import { supabase } from "@/src/lib/supabase";
import { guardarProgresoCurso } from "@/src/services/cursos";

export default function EvaluacionPantalla() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Usamos el Hook
  const { data: preguntas, loading } = usePreguntasOffline(
    id ? id.toString() : "",
  );

  const [indiceActual, setIndiceActual] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<
    string | null
  >(null);
  const [mostrarResultado, setMostrarResultado] = useState(false);

  // --- HELPER PARA DETECTAR TIPO ---
  const getMediaType = (url: string) => {
    if (!url) return 'image';
    // Obtenemos la extensión del archivo
    const extension = url.split('.').pop()?.toLowerCase();
    // Lista de extensiones de video comunes
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
      setPuntaje(puntaje + 1);
    }

    setTimeout(() => {
      if (indiceActual < preguntas.length - 1) {
        setIndiceActual(indiceActual + 1);
        setRespuestaSeleccionada(null);
      } else {
        // Al terminar, usamos el puntaje acumulado + el actual si fue correcto
        terminarExamen(esCorrecta ? puntaje + 1 : puntaje);
      }
    }, 1000);
  };

  const terminarExamen = async (puntajeFinal: number) => {
    const porcentaje = (puntajeFinal / preguntas.length) * 100;

    if (porcentaje >= 80) {
      try {
        // 1. OBTENER EL USUARIO REAL
        const {
          data: { user },
        } = await supabase.auth.getUser();

        if (user) {
          // 2. PASAR EL ID REAL
          await guardarProgresoCurso(user.id, id.toString(), puntajeFinal);
        } else {
          console.warn(
            "No hay usuario logueado (Offline), no se guardó el progreso en la nube.",
          );
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
        <ActivityIndicator size="large" color="#your_primary_color" />
      </View>
    );
  }

  if (preguntas.length === 0) {
    return (
      <View className="flex-1 bg-secondary-200 justify-center items-center p-6">
        <Text className="text-primary text-lg text-center font-work-bold">
          No hay preguntas configuradas para este curso aún.
        </Text>
        <TouchableOpacity
          onPress={() => router.back()}
          className="mt-4 bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const preguntaActual = preguntas[indiceActual];
  const porcentajeFinal = Math.round((puntaje / preguntas.length) * 100);
  const aprobado = porcentajeFinal >= 80;
  
  // Calculamos el tipo dinámicamente
  const tipoMedio = preguntaActual.media_url ? getMediaType(preguntaActual.media_url) : 'none';

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen
        options={{
          title: "Evaluación",
          headerBackTitle: "Curso",
          headerShown: true,
        }}
      />

      {/* Barra de Progreso */}
      <View className="flex-row items-center h-2 bg-gray-200 rounded-full mt-4 mb-6 overflow-hidden">
        <View
          className="bg-primary h-full"
          style={{ width: `${((indiceActual + 1) / preguntas.length) * 100}%` }}
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        {/* Tarjeta Pregunta */}
        <View className="bg-white p-6 rounded-3xl shadow-sm mb-6">
          <Text className="text-xl font-work-bold text-primary text-center mb-4">
            {preguntaActual.question_text}
          </Text>

          {preguntaActual.media_url && (
            <View className="h-48 w-full mb-4 rounded-xl overflow-hidden bg-gray-100">
              <SmartMedia
                uri={preguntaActual.media_url}
                type={tipoMedio} // <--- AQUÍ ESTÁ EL CAMBIO IMPORTANTE
                resizeMode="contain"
                useNativeControls={tipoMedio === 'video'} // Solo controles si es video
                isLooping={true}
              />
            </View>
          )}
        </View>

        {/* Opciones */}
        <View className="space-y-3">
          {preguntaActual.options.map((opcion: string, index: number) => {
            let btnColor = "bg-white border-primary";
            let textColor = "text-primary";

            if (respuestaSeleccionada) {
              if (opcion === preguntaActual.correct_answer) {
                btnColor = "bg-green-500 border-green-500";
                textColor = "text-white";
              } else if (opcion === respuestaSeleccionada) {
                btnColor = "bg-red-500 border-red-500";
                textColor = "text-white";
              }
            }

            return (
              <TouchableOpacity
                key={index}
                disabled={respuestaSeleccionada !== null}
                onPress={() => manejarRespuesta(opcion)}
                className={`border-2 rounded-2xl p-4 flex-row items-center justify-between mb-3 ${btnColor}`}
              >
                <Text className={`text-lg font-work-medium ${textColor}`}>
                  {opcion}
                </Text>
                {respuestaSeleccionada === opcion && (
                  <Ionicons
                    name={
                      opcion === preguntaActual.correct_answer
                        ? "checkmark-circle"
                        : "close-circle"
                    }
                    size={24}
                    color="white"
                  />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* Modal Resultados */}
      <Modal
        visible={mostrarResultado}
        animationType="slide"
        transparent={true}
      >
        <View className="flex-1 bg-black/50 justify-center items-center px-4">
          <View className="bg-white w-full rounded-3xl p-8 items-center shadow-lg">
            <Ionicons
              name={aprobado ? "trophy" : "sad"}
              size={80}
              color={aprobado ? "#F59E0B" : "#EF4444"}
              style={{ marginBottom: 20 }}
            />
            <Text className="text-3xl font-work-black text-primary mb-2">
              {aprobado ? "¡Felicidades!" : "Inténtalo de nuevo"}
            </Text>
            <Text className="text-gray-500 text-center mb-6 font-work-regular">
              {aprobado
                ? "Has completado este curso."
                : "Necesitas un 80% para aprobar."}
            </Text>
            <View className="bg-secondary-100 px-6 py-4 rounded-2xl mb-8">
              <Text className="text-4xl font-work-black text-primary text-center">
                {porcentajeFinal}%
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => router.replace("/cursos")}
              className="bg-primary w-full py-4 rounded-2xl mb-3"
            >
              <Text className="text-white text-center font-work-bold text-lg">
                Finalizar
              </Text>
            </TouchableOpacity>
            {!aprobado && (
              <TouchableOpacity
                onPress={() => {
                  setIndiceActual(0);
                  setPuntaje(0);
                  setRespuestaSeleccionada(null);
                  setMostrarResultado(false);
                }}
              >
                <Text className="text-primary font-work-bold mt-2">
                  Reintentar
                </Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}