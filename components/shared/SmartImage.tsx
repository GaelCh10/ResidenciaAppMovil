import { Ionicons } from '@expo/vector-icons';
import { Image } from 'expo-image';
import React, { useState } from 'react';
import { ActivityIndicator, View } from 'react-native';

interface SmartImageProps {
  uri?: string | null;
  className?: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
}

export default function SmartImage({ uri, className, style, resizeMode = 'cover' }: SmartImageProps) {
  const [isLoading, setIsLoading] = useState(true);

  if (!uri) {
    return (
      <View className={`bg-gray-100 justify-center items-center ${className}`} style={style}>
        <Ionicons name="image-outline" size={30} color="#ccc" />
      </View>
    );
  }

  return (
    <View className={className} style={style}>
      {isLoading && (
        <View className="absolute inset-0 justify-center items-center bg-gray-100">
          <ActivityIndicator size="small" color="#2563EB" />
        </View>
      )}
      <Image
        source={{ uri: uri }}
        style={{ width: '100%', height: '100%' }}
        contentFit={resizeMode === 'stretch' ? 'fill' : resizeMode === 'center' ? 'none' : resizeMode}
        transition={200}
        cachePolicy="disk" 
        onLoadEnd={() => setIsLoading(false)}
      />
    </View>
  );
}