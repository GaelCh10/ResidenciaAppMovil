import { router } from "expo-router";
import React, { useState } from "react";
import { ScrollView, Text, TextInput, TouchableOpacity, View } from "react-native";

type CrucigramaProps = {
  title: string;
  gridData: string[][];
  hints: { vertical: { n: number; palabra: string }[]; horizontal: { n: number; palabra: string }[] };
  numbers: Record<number, [number, number]>;
};

export const CrucigramaGrid = ({ title, gridData, hints, numbers }: CrucigramaProps) => {
  // 🧠 Estado del tablero
  const [grid, setGrid] = useState(gridData.map((r) => r.map(() => "")));
  const [respuestas, setRespuestas] = useState<any[][] | null>(null);
  const [fin, setFin] = useState(false);

  // 📝 Cambiar letra en casilla
  const handleChange = (r: number, c: number, val: string) => {
    const v = val.toUpperCase().slice(0, 1);
    const newGrid = grid.map((row, i) =>
      row.map((cell, j) => (i === r && j === c ? v : cell))
    );
    setGrid(newGrid);
  };

  // ✅ Verificar respuestas
  const verificar = () => {
    const resultado = grid.map((row, y) =>
      row.map((cell, x) => ({
        correcto: cell === gridData[y][x],
      }))
    );
    setRespuestas(resultado);

    const completo = gridData.every((row, y) =>
      row.every((val, x) => val === "" || val === grid[y][x])
    );
    setFin(completo);
  };

  // 🔄 Reiniciar crucigrama
  const reiniciar = () => {
    setGrid(gridData.map((r) => r.map(() => "")));
    setRespuestas(null);
    setFin(false);
  };

  return (
    <ScrollView className="flex-1 bg-secondary-200 px-3 pt-6">
      <Text className="text-center text-primary font-work-black text-3xl mb-3">
        {title}
      </Text>

      {/* 🧩 MATRIZ DEL CRUCIGRAMA */}
      <View className="items-center">
        {grid.map((row, y) => (
          <View key={y} className="flex flex-row">
            {row.map((_, x) => {
              const numero = Object.entries(numbers).find(
                ([, coords]) => coords[0] === y && coords[1] === x
              )?.[0];

              const disabled = gridData[y][x] === "";
              const correcto =
                respuestas?.[y]?.[x]?.correcto && !disabled ? "bg-green-300" : "";
              const incorrecto =
                respuestas && !respuestas[y][x].correcto && !disabled
                  ? "bg-red-300"
                  : "";

              return (
                <View
                  key={x}
                  className="relative m-[1px] w-[30px] h-[30px] justify-center items-center"
                >
                  {numero && (
                    <Text className="absolute text-[10px] font-bold text-black top-[1px] left-[2px] z-10">
                      {numero}
                    </Text>
                  )}

                  <TextInput
                    maxLength={1}
                    value={grid[y][x]}
                    editable={!disabled}
                    onChangeText={(v) => handleChange(y, x, v)}
                    className={`w-[30px] h-[30px] border text-center text-lg rounded-sm ${
                      disabled ? "bg-gray-300 border-gray-300" : "bg-white border-primary"
                    } ${correcto} ${incorrecto}`}
                  />
                </View>
              );
            })}
          </View>
        ))}
      </View>

      {/* 🔘 BOTONES */}
      <View className="mt-4 flex items-center space-y-2">
        <TouchableOpacity
          onPress={verificar}
          className="bg-primary px-6 py-2 rounded-2xl"
        >
          <Text className="text-white font-work-black">Verificar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={reiniciar}
          className="bg-green-600 px-6 py-2 rounded-2xl"
        >
          <Text className="text-white font-work-black">Reiniciar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          onPress={() => router.push("/juegos/crucigrama")}
          className="bg-gray-600 px-6 py-2 rounded-2xl"
        >
          <Text className="text-white font-work-black">Volver</Text>
        </TouchableOpacity>
      </View>

      {/* 💡 PISTAS */}
      <View className="mt-5 mb-8 px-2">
        <Text className="text-lg font-work-black text-primary mb-1">Pistas:</Text>

        <Text className="font-work-black mt-2">Vertical</Text>
        {hints.vertical.map((h) => (
          <Text key={h.n} className="text-gray-800">
            {h.n}. {h.palabra}
          </Text>
        ))}

        <Text className="font-work-black mt-2">Horizontal</Text>
        {hints.horizontal.map((h) => (
          <Text key={h.n} className="text-gray-800">
            {h.n}. {h.palabra}
          </Text>
        ))}
      </View>

      {fin && (
        <View className="mt-4 bg-green-500 p-3 rounded-xl mx-3">
          <Text className="text-white text-center font-work-black">
            🎉 ¡Crucigrama completado correctamente!
          </Text>
        </View>
      )}
    </ScrollView>
  );
};
