import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
  return (
    
    <Tabs screenOptions={{
      tabBarActiveTintColor: 'white',
      tabBarShowLabel:true,//quita los label del tab
      tabBarStyle: {
        backgroundColor: 'blue',
      }
    }}>
      <Tabs.Screen
        name="(stack)"
        options={{
          title: 'Cursos',
          headerShown: false,
          tabBarIcon: ({ color }) => <Ionicons size={28} name="footsteps-outline" color={color} />,
        }}
      />

      <Tabs.Screen
        name="practicar/index"
        options={{
          title: 'Practicar',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="hand-right-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="foro/index"

        options={{
          title: 'Foro',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="chatbox-outline" color={color} />,
        }}
      />

      <Tabs.Screen
        name='juegos/index'
        options={{
          title: 'Juegos',
          tabBarIcon: ({ color }) => <Ionicons size={28} name='game-controller-outline' color={color} />
        }}
      />
      <Tabs.Screen
        name='diccionario/index'
        options={{
          title: 'Diccionario',
          tabBarIcon: ({ color }) => <Ionicons size={28} name='glasses-outline' color={color} />
        }}
      />  

      <Tabs.Screen
        name='user/index'
        options={{
          title: 'Perfil',
          tabBarIcon: ({ color }) => <Ionicons size={28} name='person-circle-outline' color={color} />
        }}
      /> 

      <Tabs.Screen
        name='traductor/index'
        options={{
          title: 'Traductor',
          tabBarIcon: ({ color }) => <Ionicons size={28} name='language-outline' color={color} />
        }}
      />  
    </Tabs>
  )
}

export default TabsLayout