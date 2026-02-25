import { Comment, enviarComentario, obtenerComentarios } from '@/src/services/foro';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { Stack, useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, KeyboardAvoidingView, Platform, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function DetallePostScreen() {
  const { id, content, authorName, authorAvatar, time, likes } = useLocalSearchParams(); 
  const router = useRouter();
  const [comentarios, setComentarios] = useState<Comment[]>([]);
  const [nuevoComentario, setNuevoComentario] = useState('');
  const [loading, setLoading] = useState(true);
  const [enviando, setEnviando] = useState(false);

  useEffect(() => {
    cargarComentarios();
  }, [id]);

  const cargarComentarios = async () => {
    try {
      const data = await obtenerComentarios(id as string);
      setComentarios(data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const manejarEnvio = async () => {
    if (!nuevoComentario.trim()) return;
    setEnviando(true);
    try {
      await enviarComentario(id as string, nuevoComentario);
      setNuevoComentario('');
      cargarComentarios(); 
    } catch (error: any) {
      Alert.alert("Error", "No se pudo enviar el comentario");
    } finally {
      setEnviando(false);
    }
  };

  const HeaderPost = () => (
    <View className="bg-white p-5 mb-2 border-b border-gray-100 pb-6">
      <View className="flex-row items-center mb-4">
        <Image 
          source={{ uri: (authorAvatar as string) || 'https://via.placeholder.com/50' }} 
          className="w-12 h-12 rounded-full bg-gray-200"
        />
        <View className="ml-3">
          <Text className="font-work-bold text-primary text-lg">
            {authorName}
          </Text>
          <Text className="text-xs text-gray-400">
             Publicado originalmente
          </Text>
        </View>
      </View>
      <Text className="text-gray-800 text-xl font-work-regular leading-8">
        {content}
      </Text>
      
      <View className="flex-row mt-4 pt-2 border-t border-gray-50">
         <Ionicons name="heart" size={18} color="#EF4444" />
         <Text className="ml-2 text-gray-500">{likes} Me gusta</Text>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-200" edges={['top']}> 
      <Stack.Screen options={{ title: 'Comentarios', headerBackTitle: 'Foro', headerShown: true }} />

      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 0}
        className="flex-1"
      >
        <FlatList
          data={comentarios}
          keyExtractor={(item) => item.id}
          ListHeaderComponent={HeaderPost}
          contentContainerStyle={{ paddingBottom: 100 }}
          renderItem={({ item }) => (
            <View className="flex-row px-4 py-3 bg-white mb-[1px]">
               <Image 
                  source={{ uri: item.profiles?.avatar_url || 'https://via.placeholder.com/40' }} 
                  className="w-10 h-10 rounded-full bg-gray-100 mt-1"
                />
                <View className="ml-3 flex-1 bg-gray-50 p-3 rounded-tr-2xl rounded-br-2xl rounded-bl-2xl">
                    <View className="flex-row justify-between items-baseline mb-1">
                        <Text className="font-bold text-primary text-sm">{item.profiles?.full_name}</Text>
                        <Text className="text-[10px] text-gray-400">
                            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
                        </Text>
                    </View>
                    <Text className="text-gray-700 leading-5">{item.content}</Text>
                </View>
            </View>
          )}
          ListEmptyComponent={
             !loading ? (
                 <View className="p-10 items-center">
                     <Text className="text-gray-400 text-center">Nadie ha comentado aún.{'\n'}Sé el primero.</Text>
                 </View>
             ) : null
          }
        />

        <View className="bg-white p-3 border-t border-gray-200 flex-row items-end pb-8">
            <TextInput
                className="flex-1 bg-gray-100 rounded-2xl px-4 py-3 min-h-[50px] max-h-[100px] text-base mr-3"
                placeholder="Escribe un comentario..."
                multiline
                value={nuevoComentario}
                onChangeText={setNuevoComentario}
            />
            <TouchableOpacity 
                onPress={manejarEnvio}
                disabled={!nuevoComentario.trim() || enviando}
                className={`w-12 h-12 rounded-full justify-center items-center mb-1 
                    ${nuevoComentario.trim() ? 'bg-primary' : 'bg-gray-300'}`}
            >
                {enviando ? <ActivityIndicator color="white" size="small"/> : <Ionicons name="send" size={20} color="white" />}
            </TouchableOpacity>
        </View>

      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}