import { DrawerActions } from '@react-navigation/native'
import { router, useNavigation } from 'expo-router'
import React from 'react'
import { ImageBackground, Text, TouchableOpacity, View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
// Asegúrate de tener instalados los iconos o usa texto si prefieres
// import { Ionicons } from '@expo/vector-icons'; 

const HomeScreen = () => {

  const navigation = useNavigation()

  const onToggleDrawer = () => {
    navigation.dispatch(DrawerActions.toggleDrawer())
  }

  // Componente interno para el Botón Cuadrado (Card)
  // Esto hace el código más limpio y reutilizable en esta pantalla
  const DashboardCard = ({ title, subtitle, onPress, iconName }: any) => (
    <TouchableOpacity 
      onPress={onPress}
      activeOpacity={0.8}
      // Clases clave:
      // w-[47%]: Ocupa casi la mitad para caber 2 por fila
      // aspect-square: Fuerza la forma cuadrada
      // bg-white/90: Fondo blanco semitransparente para resaltar sobre la imagen
      className='w-[47%] aspect-square bg-white/95 rounded-3xl justify-center items-center p-4 mb-5 shadow-lg shadow-black/30'
    >
      {/* Aquí podrías poner un Icono. Por ahora uso un View circular como placeholder visual */}
      <View className='w-12 h-12 bg-blue-100 rounded-full justify-center items-center mb-3'>
         {/* <Ionicons name={iconName} size={28} color="#60a5fa" /> */}
         <Text className='text-xl'>📚</Text> 
      </View>
      
      <Text className='text-blue-900 font-bold text-lg text-center'>{title}</Text>
      {subtitle && (
        <Text className='text-gray-500 text-xs text-center mt-1'>{subtitle}</Text>
      )}
    </TouchableOpacity>
  )

  return (
    // Flex-1 asegura que ocupe toda la pantalla
    <ImageBackground 
      source={require('../../../../../assets/images/fondo1.jpg')} 
      resizeMode="cover"
      className='flex-1'
      blurRadius={3} // Un pequeño desenfoque ayuda a leer mejor los botones
    >
      {/* Overlay oscuro sutil para mejorar contraste si la imagen es clara */}
      <SafeAreaView className='flex-1 bg-black/30'>
        
        {/* Header simple */}
        <View className='px-6 mt-4 mb-8 flex-row justify-between items-center'>
            <View>
              <Text className='text-white font-bold text-3xl'>Hola,</Text>
              <Text className='text-gray-200 text-lg'>¿Qué quieres aprender hoy?</Text>
            </View>
            
            {/* Botón pequeño para menú (opcional si ya tienes gesto) */}
            <TouchableOpacity onPress={onToggleDrawer} className='bg-white/20 p-2 rounded-full'>
              <Text className='text-white'>Menu</Text>
            </TouchableOpacity>
        </View>

        {/* Contenedor Grid */}
        <View className='px-6 flex-row flex-wrap justify-between'>
            
            {/* Botón 1: Cursos Generales */}
            <DashboardCard 
              title="Cursos"
              subtitle="Explora el catálogo"
              onPress={() => router.push('/(drawer)/(tabs)/(stack)/cursos')}
            />

            {/* Botón 2: LSM / Gestuno */}
            {/* <DashboardCard 
              title="LSM / Gestuno"
              subtitle="Aprende señas"
              onPress={() => router.push('/profile')}
            /> */}

            {/* Botón 3: Ejemplo de ajuste (Placeholder para simular grid)
             <DashboardCard 
              title="Mi Perfil"
              subtitle="Tu progreso"
              onPress={() => router.push('/profile')}
            /> */}

            {/* Botón 4: Ajustes */}
             {/* <DashboardCard 
              title="Ajustes"
              subtitle="Configuración"
              onPress={() => router.push('/settings')}
            /> */}

        </View>

      </SafeAreaView>
    </ImageBackground>
  )
}

export default HomeScreen