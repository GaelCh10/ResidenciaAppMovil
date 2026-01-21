import React, { useRef, useEffect } from 'react';
import { View, Image, ActivityIndicator, ImageResizeMode } from 'react-native';
import { Video, ResizeMode } from 'expo-av';
import { Ionicons } from '@expo/vector-icons';
import { useCachedMedia } from '@/src/hooks/useCachedMedia';

interface SmartMediaProps {
  uri?: string | null;
  type?: 'image' | 'video' | string; // Aceptamos string por si viene de la BD
  className?: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch';
  // Props extra para video
  isPlaying?: boolean; // Para controlar play/pause desde fuera
  useNativeControls?: boolean;
  isLooping?: boolean;
  autoPlay?: boolean;
}

export default function SmartMedia({ 
  uri, 
  type = 'image', 
  className, 
  style, 
  resizeMode = 'contain',
  isPlaying = false,
  useNativeControls = false,
  isLooping = false,
  autoPlay = false
}: SmartMediaProps) {
  
  // Normalizamos el tipo (por si viene mayúscula o algo raro)
  const mediaType = type?.toLowerCase().includes('video') ? 'video' : 'image';
  
  // Usamos el hook de caché (Funciona igual para mp4 o jpg)
  const { source, loading } = useCachedMedia(uri || null, mediaType as 'image' | 'video');
  const videoRef = useRef<Video>(null);

  // Efecto para controlar Play/Pause si cambia la prop isPlaying
  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.playAsync();
      } else if (!autoPlay) {
         // Si no es autoplay y isPlaying es false, pausamos (opcional)
         // videoRef.current.pauseAsync();
      }
    }
  }, [isPlaying]);

  // 1. Caso: No hay URL
  if (!uri) {
    return (
      <View className={`bg-gray-200 justify-center items-center ${className}`} style={style}>
        <Ionicons name={mediaType === 'video' ? 'videocam-off' : 'image'} size={30} color="#ccc" />
      </View>
    );
  }

  // 2. Caso: Descargando para caché
  if (loading && !source) {
    return (
      <View className={`bg-gray-100 justify-center items-center ${className}`} style={style}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }

  const finalUri = source || uri;

  // 3. Renderizar VIDEO
  if (mediaType === 'video') {
    return (
      <Video
        ref={videoRef}
        source={{ uri: finalUri }}
        style={[{ width: '100%', height: '100%' }, style]} // Style necesita dimensiones
        className={className}
        useNativeControls={useNativeControls}
        resizeMode={resizeMode === 'cover' ? ResizeMode.COVER : ResizeMode.CONTAIN}
        isLooping={isLooping}
        shouldPlay={autoPlay || isPlaying}
        isMuted={false}
      />
    );
  }

  // 4. Renderizar IMAGEN
  return (
    <Image
      source={{ uri: finalUri }}
      className={className}
      style={[{ width: '100%', height: '100%' }, style]}
      resizeMode={resizeMode as ImageResizeMode}
    />
  );
}