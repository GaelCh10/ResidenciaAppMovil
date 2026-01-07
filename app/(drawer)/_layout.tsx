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
        headerStyle:{
            backgroundColor: 'blue',
          },
          headerTintColor:'white',
        headerShadowVisible:false,
        sceneStyle:{
            backgroundColor:'white',
        },
    }}>
         <Drawer.Screen
        name="(tabs)" // This is the name of the page and must match the url from root
        options={{
          headerShown:false,
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
        name="avance/index" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: 'Avance',
          title: 'Tus avances',
          drawerIcon :({color,size}) => (
            <Ionicons name='trending-up-outline' size={size}
            color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="diccionario/index" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: 'Diccionario',
          title: 'Diccionario',
          drawerIcon :({color,size}) => (
            <Ionicons name='glasses-outline' size={size}
            color={color} />
          )
        }}
      />


      <Drawer.Screen
        name="juegos/index" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: 'Juegos',
          title: 'Diviertete mientras aprendes',
          drawerIcon :({color,size}) => (
            <Ionicons name='game-controller-outline' size={size}
            color={color} />
          )
        }}
      />
      

      <Drawer.Screen
        name="foro/index" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: 'Foro',
          title: 'Comparte tu aprendizaje',
          drawerIcon :({color,size}) => (
            <Ionicons name='people-outline' size={size}
            color={color} />
          )
        }}
      />

      <Drawer.Screen
        name="traductor/index" // This is the name of the page and must match the url from root
        options={{
          drawerLabel: 'Traductor',
          title: 'Educacion Virtual',
          
          drawerIcon :({color,size}) => (
            <Ionicons name='language-outline' size={size}
            color={color} />
          )
        }}
      />




    </Drawer>
  )
}

export default DrawerLayout