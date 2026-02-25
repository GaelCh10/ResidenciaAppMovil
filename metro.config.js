const { getDefaultConfig } = require("expo/metro-config");
const { withNativeWind } = require("nativewind/metro");

const config = getDefaultConfig(__dirname);

// Extraemos el resolver para modificarlo
const { resolver } = config;

// 1. CRUCIAL: Eliminar 'wasm' y 'db' de sourceExts si existen por defecto
// Esto evita que Metro intente leerlos como código JS
resolver.sourceExts = resolver.sourceExts.filter(ext => ext !== 'wasm' && ext !== 'db');

// 2. Agregarlos a assetExts (Archivos Binarios)
// Aquí es donde deben ir para que expo-sqlite los pueda cargar
resolver.assetExts.push('db', 'wasm', 'sql', 'bin');

module.exports = withNativeWind(config, { input: "./app/global.css" });