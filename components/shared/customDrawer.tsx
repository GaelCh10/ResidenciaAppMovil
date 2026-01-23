import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'
import React from 'react'
import { Image, View } from 'react-native'

const CustomDrawer = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props}>
      {/* Header del Drawer */}
      <View className='flex justify-center items-center mx-3 mt-2 mb-4 p-6 h-[150px] rounded-xl bg-blue-400'>
        {/* Logo */}
        <Image 
            // ⚠️ Asegúrate de que la ruta relativa sea correcta según donde esté este archivo
            source={require('../../assets/images/logo-snfondo.png')} 
            className='h-48 w-48'
            resizeMode='contain'
        />
      </View>

      {/* Items de navegación */}
      <DrawerItemList {...props} />

    </DrawerContentScrollView>
  )
}

export default CustomDrawer