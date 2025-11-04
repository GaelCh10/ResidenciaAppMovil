import { Ionicons } from '@expo/vector-icons'
import { Tabs } from 'expo-router'
import React from 'react'

const TabsLayout = () => {
  return (
    //  tabBarShowLabel:false quita los label del tab
    <Tabs screenOptions={{ tabBarActiveTintColor: 'blue'}}>
      <Tabs.Screen
        name="home/index"
        options={{
          title: 'Home',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="home-outline" color={color} />,
        }}
      />
      <Tabs.Screen
        name="favorites/index"
        options={{
          title: 'Favoritos',
          tabBarIcon: ({ color }) => <Ionicons size={28} name="heart-outline" color={color} />,
        }}
      />
    </Tabs>
  )
}

export default TabsLayout