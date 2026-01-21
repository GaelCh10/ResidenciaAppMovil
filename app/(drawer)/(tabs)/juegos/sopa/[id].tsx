import { Ionicons } from "@expo/vector-icons";
import { Stack, useLocalSearchParams, useRouter } from "expo-router";
import React, { useEffect, useState } from "react";
import {
  ActivityIndicator,
  Modal,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

// OFFLINE
import { getPalabrasJuegoOffline } from "@/src/hooks/useOfflineData";

const SIZE = 8;

export default function SopaLetrasScreen() {
  const { id } = useLocalSearchParams();
  const router = useRouter();

  const [grid, setGrid] = useState<string[][]>([]);
  const [palabrasAEncontrar, setPalabrasAEncontrar] = useState<
    { word: string; found: boolean }[]
  >([]);
  const [seleccion, setSeleccion] = useState<{ r: number; c: number } | null>(
    null,
  );
  const [juegoTerminado, setJuegoTerminado] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    iniciarJuego();
  }, [id]);

  const iniciarJuego = async () => {
    setLoading(true);
    setJuegoTerminado(false);
    setSeleccion(null);

    try {
      // OFFLINE
      const data = await getPalabrasJuegoOffline(id.toString(), 10);

      const palabrasFiltradas = data
        .map((p: any) =>
          p.word
            .toUpperCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, ""),
        )
        .filter((w: string) => w.length <= SIZE)
        .slice(0, 5);

      generarGrid(palabrasFiltradas);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  // ... (El resto de funciones generarGrid, sePuedeColocar, etc. se mantienen EXACTAMENTE IGUAL) ...
  // Solo copio la parte de renderizado para confirmar:

  const generarGrid = (palabras: string[]) => {
    // ... tu lógica existente ...
    // (Asegúrate de copiar tu función generarGrid original aquí)
    let nuevaGrid = Array(SIZE)
      .fill(null)
      .map(() => Array(SIZE).fill(""));
    let palabrasListas = [];
    for (let palabra of palabras) {
      let colocado = false;
      let intentos = 0;
      while (!colocado && intentos < 50) {
        const direction = Math.random() > 0.5 ? "H" : "V";
        const row = Math.floor(Math.random() * SIZE);
        const col = Math.floor(Math.random() * SIZE);
        if (sePuedeColocar(nuevaGrid, palabra, row, col, direction)) {
          colocarPalabra(nuevaGrid, palabra, row, col, direction);
          palabrasListas.push({ word: palabra, found: false });
          colocado = true;
        }
        intentos++;
      }
    }
    const letras = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (nuevaGrid[r][c] === "") {
          nuevaGrid[r][c] = letras[Math.floor(Math.random() * letras.length)];
        }
      }
    }
    setGrid(nuevaGrid);
    setPalabrasAEncontrar(palabrasListas);
  };

  const sePuedeColocar = (
    g: string[][],
    w: string,
    r: number,
    c: number,
    d: string,
  ) => {
    if (d === "H") {
      if (c + w.length > SIZE) return false;
      for (let i = 0; i < w.length; i++)
        if (g[r][c + i] !== "" && g[r][c + i] !== w[i]) return false;
    } else {
      if (r + w.length > SIZE) return false;
      for (let i = 0; i < w.length; i++)
        if (g[r + i][c] !== "" && g[r + i][c] !== w[i]) return false;
    }
    return true;
  };

  const colocarPalabra = (
    g: string[][],
    w: string,
    r: number,
    c: number,
    d: string,
  ) => {
    for (let i = 0; i < w.length; i++) {
      if (d === "H") g[r][c + i] = w[i];
      else g[r + i][c] = w[i];
    }
  };

  const manejarToque = (r: number, c: number) => {
    if (!seleccion) {
      setSeleccion({ r, c });
    } else {
      validarSeleccion(seleccion, { r, c });
      setSeleccion(null);
    }
  };

  const validarSeleccion = (
    inicio: { r: number; c: number },
    fin: { r: number; c: number },
  ) => {
    let palabraFormada = "";
    if (inicio.r === fin.r) {
      const start = Math.min(inicio.c, fin.c);
      const end = Math.max(inicio.c, fin.c);
      for (let i = start; i <= end; i++) palabraFormada += grid[inicio.r][i];
    } else if (inicio.c === fin.c) {
      const start = Math.min(inicio.r, fin.r);
      const end = Math.max(inicio.r, fin.r);
      for (let i = start; i <= end; i++) palabraFormada += grid[i][inicio.c];
    }
    const match = palabrasAEncontrar.find(
      (p) =>
        p.word === palabraFormada ||
        p.word === palabraFormada.split("").reverse().join(""),
    );
    if (match && !match.found) {
      const nuevas = palabrasAEncontrar.map((p) =>
        p.word === match.word ? { ...p, found: true } : p,
      );
      setPalabrasAEncontrar(nuevas);
      if (nuevas.every((p) => p.found)) setJuegoTerminado(true);
    }
  };

  if (loading)
    return <ActivityIndicator size="large" className="mt-10" color="#2563EB" />;

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 p-4">
      <Stack.Screen
        options={{ title: "Sopa de Letras", headerBackTitle: "Juegos" }}
      />
      <TouchableOpacity
        onPress={() => router.back()}
        className="mb-2 self-start"
      >
        <Text className="text-primary font-bold">← Volver al Menú</Text>
      </TouchableOpacity>

      <View className="bg-white p-2 rounded-xl shadow-sm mb-6 items-center">
        {grid.map((row, rIndex) => (
          <View key={rIndex} className="flex-row">
            {row.map((letter, cIndex) => (
              <TouchableOpacity
                key={cIndex}
                onPress={() => manejarToque(rIndex, cIndex)}
                className={`w-9 h-9 items-center justify-center border border-gray-100 
                            ${seleccion?.r === rIndex && seleccion?.c === cIndex ? "bg-primary" : "bg-white"}`}
              >
                <Text
                  className={`font-bold ${seleccion?.r === rIndex && seleccion?.c === cIndex ? "text-white" : "text-gray-800"}`}
                >
                  {letter}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ))}
      </View>

      <Text className="text-center font-work-bold mb-2">
        Encuentra estas palabras:
      </Text>
      <View className="flex-row flex-wrap justify-center gap-4">
        {palabrasAEncontrar.map((item, idx) => (
          <View
            key={idx}
            className={`px-3 py-2 rounded-lg ${item.found ? "bg-green-100" : "bg-gray-200"}`}
          >
            <Text
              style={{ fontFamily: "LsmVulpy" }}
              className={`text-3xl ${item.found ? "text-green-600 line-through" : "text-secondary-500"}`}
            >
              {item.word.toLowerCase()}
            </Text>
          </View>
        ))}
      </View>

      <Modal visible={juegoTerminado} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center">
            <Ionicons name="trophy" size={60} color="#F59E0B" />
            <Text className="text-2xl font-bold text-primary mt-4">
              ¡Sopa Terminada!
            </Text>
            <TouchableOpacity
              onPress={iniciarJuego}
              className="bg-primary w-full py-3 rounded-xl mt-6"
            >
              <Text className="text-white text-center font-bold">
                Jugar otra vez
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => router.back()} className="mt-4">
              <Text className="text-gray-500">Salir</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}
