import { cursosMock } from "@/store/cursos.mock";
import { router, useLocalSearchParams } from "expo-router";
import React from "react";
import { Text, TouchableOpacity, View } from "react-native";
cursosMock
const CursoPantalla = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const curso = cursosMock[0].categoria[0].cursos.find((c) => c.id === Number(id));

    if (!curso) return <Text>Curso no encontrado</Text>;

    return (
        <View className="flex-1 bg-secondary-200 items-center p-4">
            <Text className="text-3xl text-primary font-work-black mb-3">
                {curso.titulo}
            </Text>

            <Text className="text-base text-center text-gray-700 mb-6">
                {curso.descripcion}
            </Text>

            <TouchableOpacity
                onPress={() => router.push({
                    pathname: "/cursos/curso/temas/[id]",
                    params: { id: curso.id.toString() },
                })
                }
                className="bg-primary rounded-2xl py-3 px-6 mb-3 w-64"
            >
                <Text className="text-white text-center font-work-black text-lg">
                    Iniciar Curso
                </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress={() => router.push({
                    pathname: "/cursos/curso/evaluacion/[id]",
                    params: { id: curso.id.toString() },
                })}
                className="bg-secondary rounded-2xl py-3 px-6 w-64"
            >
                <Text className="text-primary text-center font-work-black text-lg">
                    Evaluación
                </Text>
            </TouchableOpacity>
        </View>
    );
};

export default CursoPantalla;
