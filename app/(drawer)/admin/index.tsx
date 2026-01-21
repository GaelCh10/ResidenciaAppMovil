import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function AdminDashboard() {
  const router = useRouter();

  const MenuCard = ({ title, icon, color, ruta, desc }: any) => (
    <TouchableOpacity 
      onPress={() => router.push(ruta)}
      className="bg-white p-6 rounded-3xl shadow-sm mb-4 flex-row items-center"
    >
      <View className={`p-4 rounded-2xl mr-4 ${color}`}>
        <Ionicons name={icon} size={32} color="white" />
      </View>
      <View className="flex-1">
        <Text className="text-xl font-bold text-gray-800">{title}</Text>
        <Text className="text-gray-500 text-xs">{desc}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color="#ccc" />
    </TouchableOpacity>
  );

  return (
    <SafeAreaView className="flex-1 bg-secondary-200 px-4 pt-4">
      <Text className="text-3xl font-black text-primary mb-6">Panel Admin</Text>
      
      <ScrollView>
        <MenuCard 
          title="Gestión Diccionario" 
          desc="Categorías y Palabras"
          icon="library" 
          color="bg-blue-500" 
          ruta="/(drawer)/admin/diccionario"
        />
        <MenuCard 
          title="Gestión Cursos" 
          desc="Lecciones, Niveles y Evaluaciones"
          icon="school" 
          color="bg-orange-500" 
          ruta="/(drawer)/admin/categorias"
        />
      </ScrollView>
    </SafeAreaView>
  );
}