import { Stack } from 'expo-router'
import React from 'react'

const StackLayout = () => {
    return <Stack screenOptions={{
        // headerShown:false, //oculta el header
        headerShadowVisible:false,
        headerTitleStyle:{
            color:'white',
        },
        headerStyle:{
            backgroundColor:'blue'
        },

        contentStyle:{
            backgroundColor:'white',
            
        }
    }}
    >
        <Stack.Screen
            name='home/index' 
            options={{ title: 'Bienvenido, ', animation:'fade',  }} />

        <Stack.Screen
            name='profile/index'
            options={{ title: 'Perfil', animation:'fade' }} />

        <Stack.Screen
            name='settings/index'
            options={{ title: 'Ajustes', animation:'fade' }} />

        <Stack.Screen
            name='products/index'
            options={{ title: 'Cursos', animation:'fade'}} />

    </Stack>
}

export default StackLayout