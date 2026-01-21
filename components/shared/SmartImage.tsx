// components/shared/SmartImage.tsx
import { useCachedMedia } from '@/src/hooks/useCachedMedia';
import { Ionicons } from '@expo/vector-icons';
import React from 'react';
import { ActivityIndicator, Image, ImageResizeMode, View } from 'react-native';

interface SmartImageProps {
  uri?: string | null;      // La URL remota (puede ser null)
  className?: string;       // Para estilos con NativeWind
  style?: any;              // Para estilos inline
  resizeMode?: ImageResizeMode;
}

export default function SmartImage({ uri, className, style, resizeMode = 'cover' }: SmartImageProps) {
  // Usamos el hook que creamos antes
  const { source, loading } = useCachedMedia(uri || null, 'image');

  // 1. Caso: No hay URL (Ni remota ni local)
  if (!uri) {
    return (
      <View className={`bg-gray-100 justify-center items-center ${className}`} style={style}>
        <Ionicons name="image-outline" size={30} color="#ccc" />
      </View>
    );
  }

  // 2. Caso: Cargando / Descargando
  if (loading) {
    return (
      <View className={`bg-gray-100 justify-center items-center ${className}`} style={style}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }

  // 3. Caso: Imagen Lista (Ya sea local 'file://' o remota 'https://')
  return (
    <Image
      source={{ uri: source || uri }} 
      className={className}
      style={style}
      resizeMode={resizeMode}
    />
  );
}