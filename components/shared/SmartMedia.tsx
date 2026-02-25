import { useCachedMedia } from '@/src/hooks/useCachedMedia';
import { Ionicons } from '@expo/vector-icons';
import { ResizeMode, Video } from 'expo-av';
import { Image, ImageContentFit } from 'expo-image';
import { useEffect, useRef } from 'react';
import { ActivityIndicator, View } from 'react-native';

interface SmartMediaProps {
  uri?: string | null;
  type?: 'image' | 'video' | string;
  className?: string;
  style?: any;
  resizeMode?: 'cover' | 'contain' | 'stretch' | 'center';
  isPlaying?: boolean;
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
  
  const mediaType = type?.toLowerCase().includes('video') || uri?.endsWith('.mp4') 
    ? 'video' 
    : 'image';
  
  const { source, loading } = useCachedMedia(uri || null, mediaType as 'image' | 'video');
  const videoRef = useRef<Video>(null);
  const getContentFit = (mode: string): ImageContentFit => {
    switch (mode) {
        case 'stretch': return 'fill';
        case 'center': return 'none';
        default: return mode as ImageContentFit; 
    }
  };

  const getVideoResize = (mode: string) => {
      if (mode === 'cover') return ResizeMode.COVER;
      if (mode === 'stretch') return ResizeMode.STRETCH;
      return ResizeMode.CONTAIN;
  };

  useEffect(() => {
    if (mediaType === 'video' && videoRef.current) {
      if (isPlaying) {
        videoRef.current.playAsync();
      } else if (!autoPlay) {
      }
    }
  }, [isPlaying]);

  if (!uri) {
    return (
      <View className={`bg-gray-200 justify-center items-center ${className}`} style={[{minHeight: 150}, style]}>
        <Ionicons name={mediaType === 'video' ? 'videocam-off' : 'image-outline'} size={40} color="#9CA3AF" />
      </View>
    );
  }

  if (loading && !source) {
    return (
      <View className={`bg-gray-100 justify-center items-center ${className}`} style={style}>
        <ActivityIndicator size="small" color="#2563EB" />
      </View>
    );
  }

  const finalUri = source || uri;

  if (mediaType === 'video') {
    return (
      <Video
        ref={videoRef}
        source={{ uri: finalUri }}
        style={[{ width: '100%', height: '100%' }, style]}
        className={className}
        useNativeControls={useNativeControls}
        resizeMode={getVideoResize(resizeMode)} 
        isLooping={isLooping}
        shouldPlay={autoPlay || isPlaying}
        isMuted={false}
      />
    );
  }

  return (
    <Image
      source={{ uri: finalUri }}
      className={className}
      style={[{ width: '100%', height: '100%' }, style]}
      contentFit={getContentFit(resizeMode)} 
      transition={200}
      cachePolicy="disk"
    />
  );
}