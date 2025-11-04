import customDrawer from '@/components/shared/customDrawer'
import { Ionicons } from '@expo/vector-icons'
import { Drawer } from 'expo-router/drawer'
import React from 'react'

const DrawerLayout = () => {
  return (
    <Drawer 
    drawerContent={customDrawer}
    screenOptions={{
        headerShown:false,
        overlayColor:'rgba(0,0,0,0.4)',
        drawerActiveTintColor:'blue',
        headerShadowVisible:false,
        sceneStyle:{
            backgroundColor:'white',
        },
    }}>
         <Drawer.Screen
        name="(tabs)" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: 'Inicio',
          title: 'LSM ',
          drawerIcon:({color,size}) => (
            <Ionicons name='book-outline'
            size={size} color={color}/>
          )
        }}
      />
      <Drawer.Screen
        name="user/index" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: 'Usuario',
          title: 'Hola, ',
          drawerIcon:({color,size}) => (
            <Ionicons name='person-circle-outline'
            size={size} color={color}/>
          )
        }}
      />
       

      <Drawer.Screen
        name="schedule/index" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: 'Avance',
          title: 'Tus avances',
          drawerIcon :({color,size}) => (
            <Ionicons name='trending-up-outline' size={size}
            color={color} />
          )
        }}
      />
    </Drawer>
  )
}

export default DrawerLayout