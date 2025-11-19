import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
  return (
    //  tabBarShowLabel:false quita los label del tab
    <Tabs screenOptions={{ tabBarActiveTintColor: 'white',
      
      tabBarStyle:{
        backgroundColor: 'blue',
      }
    }}>
     <Tabs.Screen
        name="(stack)"
        
        options={{
          title: 'Cursos',
          headerShown:false,
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
    </Tabs>
  )
}

export default TabsLayout