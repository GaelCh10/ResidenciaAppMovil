import { View, Text } from 'react-native'
import React from 'react'
import { DrawerContentComponentProps, DrawerContentScrollView, DrawerItemList } from '@react-navigation/drawer'

const customDrawer = (props: DrawerContentComponentProps) => {
  return (
    <DrawerContentScrollView {...props}>
      <View className='flex justify-center items-center mx-3 p-10 h-[150px] rounded-xl bg-blue-500'>
        <View className='flex justify-center items-center bg-white rounded-full h-24 w-24 '>
            <Text className='text-primary font-work-black text-3xl'>GCH</Text>
        </View>
      </View>

      {/* drawer items */}
      <DrawerItemList {...props} />

    </DrawerContentScrollView>
  )
}

export default customDrawer