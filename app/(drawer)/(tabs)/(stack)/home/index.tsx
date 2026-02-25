import { Ionicons } from '@expo/vector-icons'
import { DrawerActions } from '@react-navigation/native'
import { router, useNavigation } from 'expo-router'
import React from 'react'
import { Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const HomeScreen = () => {
  const navigation = useNavigation()

  const onToggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer())
  }

  const DashboardCard = ({ title, subtitle, onPress, iconName }: any) => (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      className='w-48 aspect-square bg-white rounded-3xl justify-center items-center p-4 shadow-xl shadow-blue-200 border border-blue-50'
    >
      <View className='w-14 h-14 bg-blue-100 rounded-full justify-center items-center mb-4'>
        <Ionicons name="book" size={28} color="#2563EB" />
      </View>

      <Text className='text-blue-900 font-bold text-xl text-center'>{title}</Text>
      {subtitle && (
        <Text className='text-gray-400 text-sm text-center mt-1'>{subtitle}</Text>
      )}
    </TouchableOpacity>
  )

  return (
    <View className='flex-1 bg-gray-50'>
      <SafeAreaView className='flex-1'>
        <View className='px-6 mt-4 mb-4 flex-row justify-between items-center'>
          <View>
            <Text className='text-blue-900 font-bold text-3xl'>Shbeey</Text>
            <Text className='text-gray-500 text-lg'>¿Qué quieres aprender hoy?</Text>
          </View>

          <TouchableOpacity onPress={onToggleDrawer} className='bg-blue-100 p-2 rounded-full'>
            <Ionicons name="menu" size={24} color="#2563EB" />
          </TouchableOpacity>
        </View>
        <View className='flex-1 px-6 justify-center items-center pb-20'>
          <Text className='text-gray-600 text-center text-lg mb-10 leading-6'>
            ¡Bienvenido! Siente la emoción de comunicarte con las manos. 
            En nuestra plataforma, te acompañamos en tu viaje para aprender la Lengua de Señas Mexicana (LSM).
          </Text>
          <DashboardCard
            title="Cursos"
            subtitle="Explora el catálogo"
            iconName="book"
            onPress={() => router.push('/(drawer)/(tabs)/(stack)/cursos')}
          />

        </View>

      </SafeAreaView>
    </View>
  )
}

export default HomeScreen