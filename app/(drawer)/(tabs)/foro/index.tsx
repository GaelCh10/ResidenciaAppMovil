import { crearPost, obtenerPosts, Post, toggleLike } from '@/src/services/foro';
import { Ionicons } from '@expo/vector-icons';
import { formatDistanceToNow } from 'date-fns';
import { es } from 'date-fns/locale';
import { router,useFocusEffect } from 'expo-router';
import React, { useEffect, useState,useCallback } from 'react';
import { ActivityIndicator, Alert, FlatList, Image, Modal, RefreshControl, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ForoScreen() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);
  const [nuevoTexto, setNuevoTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  const cargarDatos = async () => {
    setRefreshing(true);
    try {
      const data = await obtenerPosts();
      setPosts(data);
    } catch (e) {
      console.error(e);
    } finally {
      setRefreshing(false);
    }
  };

  useFocusEffect(useCallback(() => {
    cargarDatos();
  }, []));

  // Función para manejar el like visualmente rápido
  const manejarLike = async (post: Post) => {
    // 1. Actualización Optimista (UI cambia antes de que responda el servidor)
    const nuevoEstadoLike = !post.user_has_liked;
    const nuevosLikes = nuevoEstadoLike ? post.likes_count + 1 : post.likes_count - 1;

    // Actualizamos la lista local
    setPosts(prev => prev.map(p =>
      p.id === post.id
        ? { ...p, user_has_liked: nuevoEstadoLike, likes_count: nuevosLikes }
        : p
    ));

    // 2. Llamada al servidor en segundo plano
    try {
      await toggleLike(post.id, post.user_has_liked);
    } catch (error) {
      // Si falla, revertimos el cambio (Rollback)
      console.error("Error like", error);
      cargarDatos();
    }
  };

  const publicarPost = async () => {
    if (!nuevoTexto.trim()) return;
    setEnviando(true);
    try {
      await crearPost(nuevoTexto);
      setNuevoTexto("");
      setModalVisible(false);
      cargarDatos(); // Recargar lista
    } catch (error: any) {
      console.error("Error creando post:", error);
      console.error("detalles:", error.message, error.details, error.hint, error.code);

      Alert.alert("Error, no se pudo publicar", error.message || "Error desconocido");
    } finally {
      setEnviando(false);
    }
  };

  const renderPost = ({ item }: { item: Post }) => (
    <View className="bg-white p-4 rounded-3xl mb-4 shadow-sm border border-gray-100 mx-2">
      {/* Header */}
      <View className="flex-row items-center mb-3">
        <Image
          source={{ uri: item.profiles?.avatar_url || 'https://via.placeholder.com/50' }}
          className="w-10 h-10 rounded-full bg-gray-200"
        />
        <View className="ml-3">
          <Text className="font-work-bold text-primary text-base">
            {item.profiles?.full_name || 'Estudiante Anónimo'}
          </Text>
          <Text className="text-xs text-gray-400 font-work-regular">
            {formatDistanceToNow(new Date(item.created_at), { addSuffix: true, locale: es })}
          </Text>
        </View>
      </View>

      {/* Contenido */}
      <Text className="text-gray-800 text-base mb-4 font-work-regular leading-6">
        {item.content}
      </Text>

      {/* Footer / Acciones */}
      <View className="flex-row items-center border-t border-gray-100 pt-3">
        <TouchableOpacity
          className="flex-row items-center mr-6 px-2 py-1"
          onPress={() => manejarLike(item)}
        >
          <Ionicons
            name={item.user_has_liked ? "heart" : "heart-outline"}
            size={22}
            color={item.user_has_liked ? "#EF4444" : "#64748B"}
          />
          <Text className={`ml-2 font-work-medium ${item.user_has_liked ? 'text-red-500' : 'text-gray-500'}`}>
            {item.likes_count}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          className="flex-row items-center px-2 py-1"
          onPress={() => {
            // NAVEGACIÓN A DETALLE
            router.push({
              pathname: "/(drawer)/(tabs)/foro/[id]", // Ruta dinámica
              params: {
                id: item.id,
                content: item.content,
                authorName: item.profiles?.full_name,
                authorAvatar: item.profiles?.avatar_url,
                time: item.created_at, // Pasamos fecha cruda
                likes: item.likes_count
              }
            });
          }}
        >
          <Ionicons name="chatbubble-outline" size={20} color="#64748B" />
          <Text className="ml-2 text-gray-500 font-work-medium">Comentar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-200">
      <View className="px-4 py-2">
        <Text className="text-primary text-3xl font-work-black mb-2">Comunidad</Text>
        <Text className="text-gray-500 text-sm mb-4">Comparte tus avances en LSM</Text>
      </View>

      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        renderItem={renderPost}
        contentContainerStyle={{ paddingBottom: 80 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={cargarDatos} />
        }
        ListEmptyComponent={
          <View className="items-center mt-20">
            <Ionicons name="people-outline" size={60} color="#ccc" />
            <Text className="text-gray-400 mt-4">Sé el primero en publicar algo.</Text>
          </View>
        }
      />

      {/* BOTÓN FLOTANTE (FAB) PARA NUEVO POST */}
      <TouchableOpacity
        className="absolute bottom-6 right-6 bg-primary w-14 h-14 rounded-full items-center justify-center shadow-lg"
        onPress={() => setModalVisible(true)}
      >
        <Ionicons name="add" size={30} color="white" />
      </TouchableOpacity>

      {/* MODAL PARA CREAR POST */}
      <Modal visible={modalVisible} animationType="slide" transparent>
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white rounded-t-3xl p-6 h-[60%] shadow-2xl">
            <View className="flex-row justify-between items-center mb-6">
              <Text className="text-xl font-work-bold text-primary">Nueva Publicación</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Ionicons name="close-circle" size={30} color="#ccc" />
              </TouchableOpacity>
            </View>

            <TextInput
              className="bg-gray-50 p-4 rounded-2xl text-lg font-work-regular text-gray-800 min-h-[150px] mb-6"
              placeholder="¿Qué aprendiste hoy en LSM?"
              multiline
              textAlignVertical="top"
              value={nuevoTexto}
              onChangeText={setNuevoTexto}
              autoFocus
            />

            <TouchableOpacity
              className={`w-full py-4 rounded-2xl flex-row justify-center items-center ${nuevoTexto.trim() ? 'bg-primary' : 'bg-gray-300'}`}
              onPress={publicarPost}
              disabled={!nuevoTexto.trim() || enviando}
            >
              {enviando ? (
                <ActivityIndicator color="white" />
              ) : (
                <>
                  <Text className="text-white font-work-bold text-lg mr-2">Publicar</Text>
                  <Ionicons name="send" size={20} color="white" />
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}