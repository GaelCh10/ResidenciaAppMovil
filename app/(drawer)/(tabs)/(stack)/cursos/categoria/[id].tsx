import React from "react";
import { View, Text, TouchableOpacity } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { cursosMock } from "@/store/cursos.mock";

const CategoriaPantalla = () => {
    const { id } = useLocalSearchParams<{ id: string }>();
    const categoria = cursosMock[0].categoria.find((c) => c.id === Number(id));

    if (!categoria) return <Text>No se encontró la categoría</Text>;

    return (
        <View className="flex-1 bg-secondary-200 px-4 pt-4">
            <Text className="text-primary text-3xl font-work-black text-center mb-4">
                {categoria.nombre}
            </Text>

            {categoria.cursos.map((curso) => (
                <TouchableOpacity
                    key={curso.id}
                    onPress={() => router.push({
                        pathname: "/cursos/curso/[id]",
                        params: { id: curso.id.toString() },
                    })
                    }
                    className="bg-primary rounded-2xl py-3 px-4 mb-3"
                >
                    <Text className="text-white text-center font-work-black text-lg">
                        {curso.titulo}
                    </Text>
                </TouchableOpacity>
            ))}
        </View>
    );
};

export default CategoriaPantalla;
