import { obtenerPreguntas, Pregunta } from '@/src/services/cursos';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Image, Modal, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function EvaluacionPantalla() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  // Estados del juego
  const [preguntas, setPreguntas] = useState<Pregunta[]>([]);
  const [indiceActual, setIndiceActual] = useState(0);
  const [puntaje, setPuntaje] = useState(0);
  const [respuestaSeleccionada, setRespuestaSeleccionada] = useState<string | null>(null);
  const [mostrarResultado, setMostrarResultado] = useState(false); // Modal final
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    cargarExamen();
  }, [id]);

  const cargarExamen = async () => {
    try {
      const data = await obtenerPreguntas(id.toString());
      setPreguntas(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const manejarRespuesta = (opcion: string) => {
    setRespuestaSeleccionada(opcion);
    
    // Verificar si es correcta
    const esCorrecta = opcion === preguntas[indiceActual].correct_answer;
    if (esCorrecta) {
      setPuntaje(puntaje + 1);
    }

    // Esperar 1 segundo para que el usuario vea si acertó (feedback visual) y pasar a la siguiente
    setTimeout(() => {
      if (indiceActual < preguntas.length - 1) {
        setIndiceActual(indiceActual + 1);
        setRespuestaSeleccionada(null);
      } else {
        terminarExamen(esCorrecta ? puntaje + 1 : puntaje);
      }
    }, 1000);
  };

  const terminarExamen = (puntajeFinal: number) => {
    setMostrarResultado(true);
    // AQUÍ ES DONDE GUARDARÍAMOS EL PROGRESO EN SUPABASE EN EL FUTURO
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
        <TouchableOpacity onPress={() => router.back()} className="mt-4 bg-primary px-6 py-3 rounded-xl">
          <Text className="text-white">Volver</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const preguntaActual = preguntas[indiceActual];
  // Calculamos porcentaje para mostrar en el modal
  // Nota: usamos 'puntaje' del estado, pero si acabamos de responder la última, 
  // el estado puede no haberse actualizado visualmente en el modal todavía, 
  // así que calculamos en base a la lógica final.
  const porcentajeFinal = Math.round((puntaje / preguntas.length) * 100);
  const aprobado = porcentajeFinal >= 80;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Stack.Screen options={{ title: 'Evaluación', headerBackTitle: 'Curso', headerShown: true }} />

      {/* Barra de Progreso Superior */}
      <View className="flex-row items-center h-2 bg-gray-200 rounded-full mt-4 mb-6 overflow-hidden">
        <View 
          className="bg-primary h-full" 
          style={{ width: `${((indiceActual + 1) / preguntas.length) * 100}%` }} 
        />
      </View>

      <ScrollView contentContainerStyle={{ paddingBottom: 20 }}>
        
        {/* Tarjeta de la Pregunta */}
        <View className="bg-white p-6 rounded-3xl shadow-sm mb-6">
          <Text className="text-xl font-work-bold text-primary text-center mb-4">
            {preguntaActual.question_text}
          </Text>

          {/* Multimedia (Opcional) */}
          {preguntaActual.media_url && (
            <View className="h-48 w-full bg-gray-100 rounded-xl mb-4 overflow-hidden items-center justify-center">
               {preguntaActual.media_url.endsWith('.mp4') ? (
                 <Video
                   source={{ uri: preguntaActual.media_url }}
                   style={{ width: '100%', height: '100%' }}
                   useNativeControls
                   resizeMode={ResizeMode.CONTAIN}
                   isLooping
                 />
               ) : (
                 <Image 
                    source={{ uri: preguntaActual.media_url }} 
                    className="w-full h-full" 
                    resizeMode="contain"
                 />
               )}
            </View>
          )}
        </View>

        {/* Opciones de Respuesta */}
        <View className="space-y-3">
          {preguntaActual.options.map((opcion, index) => {
            // Lógica de colores para feedback
            let btnColor = "bg-white border-primary"; // Estado normal
            let textColor = "text-primary";
            
            if (respuestaSeleccionada) {
                if (opcion === preguntaActual.correct_answer) {
                    btnColor = "bg-green-500 border-green-500"; // Correcta (siempre se ilumina al final)
                    textColor = "text-white";
                } else if (opcion === respuestaSeleccionada && opcion !== preguntaActual.correct_answer) {
                    btnColor = "bg-red-500 border-red-500"; // Incorrecta seleccionada
                    textColor = "text-white";
                }
            }

            return (
              <TouchableOpacity
                key={index}
                disabled={respuestaSeleccionada !== null} // Bloquear clicks después de responder
                onPress={() => manejarRespuesta(opcion)}
                className={`border-2 rounded-2xl p-4 flex-row items-center justify-between mb-3 ${btnColor}`}
              >
                <Text className={`text-lg font-work-medium ${textColor}`}>
                  {opcion}
                </Text>
                {respuestaSeleccionada === opcion && (
                    <Ionicons 
                        name={opcion === preguntaActual.correct_answer ? "checkmark-circle" : "close-circle"} 
                        size={24} 
                        color="white" 
                    />
                )}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>

      {/* MODAL DE RESULTADOS */}
      <Modal visible={mostrarResultado} animationType="slide" transparent={true}>
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
                        ? "Has completado este curso satisfactoriamente." 
                        : "Necesitas un 80% para aprobar. Repasa las lecciones e inténtalo otra vez."}
                </Text>

                <View className="bg-secondary-100 px-6 py-4 rounded-2xl mb-8">
                    <Text className="text-4xl font-work-black text-primary text-center">
                        {porcentajeFinal}%
                    </Text>
                    <Text className="text-xs text-gray-500 text-center uppercase">Calificación Final</Text>
                </View>

                {/* Botones de Acción */}
                <TouchableOpacity 
                    onPress={() => router.replace('/cursos')} // Volver al inicio de cursos
                    className="bg-primary w-full py-4 rounded-2xl mb-3"
                >
                    <Text className="text-white text-center font-work-bold text-lg">
                        Finalizar
                    </Text>
                </TouchableOpacity>
                
                {!aprobado && (
                    <TouchableOpacity 
                        onPress={() => {
                            // Reiniciar examen
                            setIndiceActual(0);
                            setPuntaje(0);
                            setRespuestaSeleccionada(null);
                            setMostrarResultado(false);
                        }}
                    >
                        <Text className="text-primary font-work-bold mt-2">Reintentar</Text>
                    </TouchableOpacity>
                )}
            </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}