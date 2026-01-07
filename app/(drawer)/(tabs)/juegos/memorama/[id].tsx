import React, { useEffect, useState } from "react";
import { View, Text, TouchableOpacity, Image } from "react-native";
import { useLocalSearchParams, router } from "expo-router";
import { Audio } from "expo-av";
import { LinearGradient } from "expo-linear-gradient";
import { Tablero } from "@/components/juegos/Tablero";
import { MemoBlock } from "@/components/juegos/MemoBlock";

export default function MemoramaJuego() {
    const { id } = useLocalSearchParams<{ id: string }>();
    const [blocks, setBlocks] = useState<any[]>([]);
    const [selected, setSelected] = useState<any | null>(null);
    const [movimientos, setMovimientos] = useState(0);
    const [mensaje, setMensaje] = useState<string | null>(null);
    const [fin, setFin] = useState(false);

    // 🔄 Inicializa el memorama
    const inicializarJuego = () => {
        const mock = [
            { id: 1, par_id: 1, tipo: "texto", texto: "A" },
            { id: 2, par_id: 1, tipo: "imagen", img: "https://i.imgur.com/ZvWn5.png" },
            { id: 3, par_id: 2, tipo: "texto", texto: "B" },
            { id: 4, par_id: 2, tipo: "imagen", img: "https://i.imgur.com/ZvWn5.png" },
        ];
        setBlocks(shuffle(mock).map((b, i) => ({ ...b, index: i, flipped: false, matched: false })));
        setSelected(null);
        setMovimientos(0);
        setMensaje(null);
        setFin(false);
    };

    useEffect(() => {
        inicializarJuego();
    }, [id]);

    const shuffle = (arr: any[]) => arr.sort(() => Math.random() - 0.5);

    const handleClick = async (block: any) => {
        if (block.flipped || block.matched || fin) return;

        const updated = [...blocks];
        updated[block.index].flipped = true;
        setBlocks(updated);

        if (!selected) {
            setSelected(block);
            return;
        }

        if (selected.par_id === block.par_id) {
            updated[block.index].matched = true;
            updated[selected.index].matched = true;
            setBlocks(updated);
            setMensaje("✅ Correcto");
            setMovimientos((m) => m + 1);
            await playSound("correct");
        } else {
            setMensaje("❌ Incorrecto");
            await playSound("fail");
            setTimeout(() => {
                updated[block.index].flipped = false;
                updated[selected.index].flipped = false;
                setBlocks([...updated]);
            }, 800);
        }

        setSelected(null);

        if (updated.every((b) => b.matched)) {
            await playSound("finish");
            setFin(true);
        }
    };

    const playSound = async (type: "correct" | "fail" | "finish") => {
        const sound = new Audio.Sound();
        const sounds = {
            correct: require("../../../../../assets/sounds/correct.wav"),
            fail: require("../../../../../assets/sounds/fail.wav"),
            finish: require("../../../../../assets/sounds/finish.wav"),
        };
        await sound.loadAsync(sounds[type]);
        await sound.playAsync();
    };

    const volverAJuegos = () => {
        inicializarJuego();
        router.push("/juegos");
    };

    return (
        <LinearGradient colors={["#E3EBF6", "#FFFFFF"]} className="flex-1 items-center justify-center">
            <Text className="text-primary text-3xl font-work-black mb-3">Memorama</Text>
            <Text className="text-gray-700 mb-2">Movimientos: {movimientos}</Text>

            <Tablero memoBlocks={blocks} handleMemoClick={handleClick} />

            {mensaje && (
                <View className="mt-3 px-6 py-2 rounded-full bg-white border border-primary">
                    <Text
                        className={`font-work-black text-lg ${mensaje.includes("✅") ? "text-green-600" : "text-red-600"
                            }`}
                    >
                        {mensaje}
                    </Text>
                </View>
            )}

            {fin && (
                <View className="absolute bottom-10 flex flex-col items-center space-y-3">
                    <Text className="text-primary font-work-black text-lg">
                        ¡Has completado el juego en {movimientos} movimientos!
                    </Text>
                    <TouchableOpacity
                        onPress={inicializarJuego}
                        className="bg-green-500 px-6 py-2 rounded-full"
                    >
                        <Text className="text-white font-work-black">🔁 Reintentar</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        onPress={volverAJuegos}
                        className="bg-primary px-6 py-2 rounded-full"
                    >
                        <Text className="text-white font-work-black">🏠 Volver a Juegos</Text>
                    </TouchableOpacity>
                </View>
            )}
        </LinearGradient>
    );
}
