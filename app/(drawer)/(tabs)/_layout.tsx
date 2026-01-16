import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
  return (
    <Tabs screenOptions={{
      headerShown: false, // <--- IMPORTANTE: Esto quita el doble encabezado
      tabBarActiveTintColor: 'white',
      tabBarShowLabel: false, 
      tabBarStyle: { backgroundColor: 'blue' }
    }}>
      {/* 1. Cursos (Stack principal) */}
      <Tabs.Screen
        name="(stack)"
        options={{
          title: 'Cursos',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="footsteps-outline" color={color} />,
        }}
      />

      {/* 2. Juegos */}
      <Tabs.Screen
        name='juegos/index'
        options={{
          title: 'Juegos',
          tabBarIcon: ({ color }) => <Ionicons size={28} name='game-controller-outline' color={color} />
        }}
      />

      {/* 3. Foro */}
      <Tabs.Screen
        name="foro/index"
        options={{
          title: 'Foro',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="chatbox-outline" color={color} />,
        }}
      />

      {/* 4. Perfil */}
      <Tabs.Screen
        name='user/index'
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons size={28} name='person-circle-outline' color={color} />
        }}
      /> 
    </Tabs>
  )
}
export default TabsLayout