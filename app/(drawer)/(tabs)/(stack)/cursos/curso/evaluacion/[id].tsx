import { cursosMock } from "@/store/cursos.mock";
import confetti from "canvas-confetti";
import { useLocalSearchParams } from "expo-router";
import React, { useState } from "react";
import { Text, TouchableOpacity, View } from "react-native";
 
const EvaluacionPantalla = () => {
  const { id } = useLocalSearchParams<{ id: string }>();
  const curso = cursosMock[0].categoria[0].cursos.find((c) => c.id === Number(id));

  const [preguntaActual, setPreguntaActual] = useState(0);
  const [puntuacion, setPuntuacion] = useState(0);
  const [seleccion, setSeleccion] = useState<number | null>(null);
  const [fin, setFin] = useState(false);

  if (!curso) return <Text>No hay curso</Text>;

  const pregunta = curso.evaluacion[preguntaActual];

  const verificar = (opcionId: number, esCorrecto: boolean) => {
    setSeleccion(opcionId);
    if (esCorrecto) {
      setPuntuacion((p) => p + 20);
    }
    setTimeout(() => {
      if (preguntaActual === curso.evaluacion.length - 1) {
        setFin(true);
        if (puntuacion >= 80) confetti();
      } else {
        setSeleccion(null);
        setPreguntaActual(preguntaActual + 1);
      }
    }, 800);
  };

  if (fin) {
    return (
      <View className="flex-1 items-center justify-center bg-secondary-200">
        <Text className="text-3xl font-work-black text-primary mb-3">
          Evaluación Completada
        </Text>
        <Text className="text-xl text-gray-800">Tu puntuación: {puntuacion}</Text>
        <TouchableOpacity
          onPress={() => {
            setFin(false);
            setPuntuacion(0);
            setPreguntaActual(0);
          }}
          className="mt-4 bg-primary px-6 py-3 rounded-xl"
        >
          <Text className="text-white font-work-black">Reintentar</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View className="flex-1 bg-secondary-200 p-4">
      <Text className="text-2xl font-work-black text-center text-primary mb-4">
        Pregunta {preguntaActual + 1} de {curso.evaluacion.length}
      </Text>

      <Text className="text-lg text-center mb-6">{pregunta.pregunta}</Text>

      {pregunta.opciones.map((opcion) => {
        const esSeleccion = seleccion === opcion.id;
        const bgColor = esSeleccion
          ? opcion.esCorrecto
            ? "bg-green-500"
            : "bg-red-500"
          : "bg-white";

        return (
          <TouchableOpacity
            key={opcion.id}
            disabled={seleccion !== null}
            onPress={() => verificar(opcion.id, opcion.esCorrecto)}
            className={`rounded-2xl border border-primary py-3 px-4 mb-3 ${bgColor}`}
          >
            <Text
              className={`text-center font-work-black ${
                esSeleccion ? "text-white" : "text-primary"
              }`}
            >
              {opcion.respuesta}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

export default EvaluacionPantalla;
