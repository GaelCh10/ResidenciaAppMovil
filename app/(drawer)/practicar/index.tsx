/* eslint-disable @typescript-eslint/no-require-imports */
import React, { useEffect, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  StyleSheet,
  Text,
  View,
} from "react-native";

import { Camera } from "expo-camera";

// eslint-disable-next-line import/no-duplicates
import * as tf from "@tensorflow/tfjs";
import { cameraWithTensors } from "@tensorflow/tfjs-react-native";
// eslint-disable-next-line import/no-duplicates
import { bundleResourceIO } from "@tensorflow/tfjs-react-native";
import { Stack } from "expo-router";
import { SafeAreaView } from "react-native-safe-area-context";

// Asegúrate de que estas rutas sean correctas en tu proyecto
const modelJson = require("@/assets/models/staticModel/model.json");
const modelWeights1 = require("@/assets/models/staticModel/group1-shard1of3.bin");
const modelWeights2 = require("@/assets/models/staticModel/group1-shard2of3.bin");
const modelWeights3 = require("@/assets/models/staticModel/group1-shard3of3.bin");

const INPUT_WIDTH = 224;
const INPUT_HEIGHT = 224;

const CLASSES = [
  "A",
  "B",
  "C",
  "D",
  "E",
  "F",
  "G",
  "H",
  "I",
  "J",
  "K",
  "L",
  "M",
  "N",
  "O",
  "P",
  "Q",
  "R",
  "S",
  "T",
  "U",
  "V",
  "W",
  "X",
  "Y",
  "Z",
];

// 2. TRUCO PARA EVITAR ERRORES DE TYPESCRIPT ("as any")
// Esto le dice a TS: "Confía en mí, esto funciona aunque los tipos no coincidan"
const TensorCamera = cameraWithTensors(Camera as any);

const { width, height } = Dimensions.get("window");

export default function DetectorScreen() {
  const [isTfReady, setIsTfReady] = useState(false);
  const [model, setModel] = useState<tf.LayersModel | null>(null);
  const [prediction, setPrediction] = useState<string>("...");
  const [probability, setProbability] = useState<number>(0);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);

  // Inicializamos useRef con 0 para evitar errores de undefined
  const requestRef = useRef<number>(0);

  useEffect(() => {
    (async () => {
      // Permisos
      const { status } = await Camera.requestCameraPermissionsAsync();
      setHasPermission(status === "granted");

      // Cargar TF
      await tf.ready();
      setIsTfReady(true);

      // Cargar Modelo
      try {
        const loadedModel = await tf.loadLayersModel(
          bundleResourceIO(modelJson, [
            modelWeights1,
            modelWeights2,
            modelWeights3,
          ]),
        );
        setModel(loadedModel);
        console.log("✅ Modelo cargado!");
      } catch (e) {
        console.error("Error cargando modelo:", e);
      }
    })();

    return () => {
      if (requestRef.current) cancelAnimationFrame(requestRef.current);
    };
  }, []);

  const handleCameraStream = (
    images: IterableIterator<tf.Tensor3D>,
    updatePreview: () => void,
    gl: any,
  ) => {
    const loop = async () => {
      if (!model) return;

      const nextImageTensor = images.next().value;

      if (nextImageTensor) {
        const processedTensor = tf.tidy(() => {
          return nextImageTensor
            .resizeBilinear([INPUT_WIDTH, INPUT_HEIGHT])
            .div(255.0)
            .expandDims(0);
        });

        const predictionTensor = model.predict(processedTensor) as tf.Tensor;
        const data = await predictionTensor.data();

        const maxProbability = Math.max(...Array.from(data));
        const maxIndex = data.indexOf(maxProbability);

        if (maxProbability > 0.8) {
          setPrediction(CLASSES[maxIndex]);
          setProbability(maxProbability);
        } else {
          setPrediction("?");
          setProbability(0);
        }

        tf.dispose([nextImageTensor, processedTensor, predictionTensor]);
      }

      updatePreview();
      gl.endFrameEXP();
      requestRef.current = requestAnimationFrame(loop);
    };

    loop();
  };

  if (hasPermission === null) return <View />;
  if (hasPermission === false)
    return (
      <View className="flex-1 justify-center items-center">
        <Text>Sin acceso a cámara</Text>
      </View>
    );
  if (!isTfReady || !model)
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#2563EB" />
        <Text>Cargando IA...</Text>
      </View>
    );

  return (
    <SafeAreaView className="flex-1 bg-black">
      <Stack.Screen
        options={{
          title: "Detector IA",
          headerBackTitle: "Inicio",
          headerTintColor: "white",
          headerStyle: { backgroundColor: "black" },
        }}
      />

      <View className="flex-1 rounded-3xl overflow-hidden m-4 border-4 border-primary bg-gray-800">
        <TensorCamera
          style={styles.camera}
          // Usamos string directo 'back' para evitar problemas con Constants
          type={"back"}
          // Props obligatorias de TensorCamera
          cameraTextureHeight={1200}
          cameraTextureWidth={1600}
          resizeHeight={INPUT_HEIGHT}
          resizeWidth={INPUT_WIDTH}
          resizeDepth={3}
          onReady={handleCameraStream}
          autorender={true}
          useCustomShadersToResize={false}
        />
      </View>

      <View className="bg-white rounded-t-3xl p-6 items-center h-48">
        <Text className="text-gray-500 font-bold mb-2">DETECTANDO LETRA:</Text>
        <Text className="text-8xl font-black text-primary">{prediction}</Text>
        <Text className="text-gray-400">
          Confianza: {(probability * 100).toFixed(1)}%
        </Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  camera: {
    width: "100%",
    height: "100%",
    zIndex: 1,
  },
});
