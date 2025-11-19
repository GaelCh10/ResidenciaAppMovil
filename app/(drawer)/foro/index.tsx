import React, { useState } from "react";
import { FlatList, Text, TextInput, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface Post {
  id: string;
  user: string;
  content: string;
}

const ForoPantalla: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([
    { id: "1", user: "Ana", content: "¿Cuál es la mejor manera de aprender señas básicas?" },
    { id: "2", user: "Carlos", content: "Yo recomiendo practicar con amigos y grabarse en video 👋" },
  ]);
  const [newPost, setNewPost] = useState<string>("");

  const handleAddPost = () => {
    if (newPost.trim() === "") return;
    const newEntry: Post = {
      id: Date.now().toString(),
      user: "Usuario LSM",
      content: newPost.trim(),
    };
    setPosts([newEntry, ...posts]);
    setNewPost("");
  };

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4">
      <Text className="text-2xl font-work-black text-primary text-center mt-2 mb-4">
        Foro de Aprendizaje LSM
      </Text>

      {/* Input y botón */}
      <View className="flex-row items-center mb-4">
        <TextInput
          placeholder="Escribe tu comentario..."
          placeholderTextColor="#7C8A9C"
          value={newPost}
          onChangeText={setNewPost}
          className="flex-1 bg-white border border-primary rounded-xl px-3 py-2 text-base text-black mr-2"
        />
        <TouchableOpacity
          onPress={handleAddPost}
          className="bg-primary px-4 py-2 rounded-lg active:opacity-80"
        >
          <Text className="text-white font-work-black">Publicar</Text>
        </TouchableOpacity>
      </View>

      {/* Lista de posts */}
      <FlatList
        data={posts}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingBottom: 80 }}
        renderItem={({ item }) => (
          <View className="bg-white border-l-4 border-primary rounded-lg p-3 mb-3 shadow-sm">
            <Text className="text-primary font-work-black mb-1">{item.user}</Text>
            <Text className="text-black font-work-regular">{item.content}</Text>
          </View>
        )}
      />
    </SafeAreaView>
  );
};

export default ForoPantalla;
