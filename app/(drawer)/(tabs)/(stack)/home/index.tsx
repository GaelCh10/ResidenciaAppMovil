import CustomButton from '@/components/shared/customButton'
import { Link, router } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const HomeScreen = () => {
  return (

    <SafeAreaView>
      <View className='px-10 mt-5'>

        <CustomButton color='primary' className='mb-3'
          onPress={() => router.push('/products')}>
          Cursos
        </CustomButton>

        <CustomButton color='primary' className='mb-3'
          onPress={() => router.push('/profile')}>

          Perfil
        </CustomButton>

        <CustomButton variant='text-only' color='primary'
          onPress={() => router.push('/settings')}
          className='mb-3'>
          Ajustes
        </CustomButton>
        {/* <Text>HomeScreen {' '}</Text>
        <Link className='mb-5' href='/products'>Cursos {' '}</Link>
        <Link className='mb-5' href='/profile'>Perfil {' '}</Link>
        <Link className='mb-5' href='/settings'>Ajustes {' '}</Link> */}
        <Link href="/products" asChild>
          <CustomButton color='primary' className='mb-3'>Cursos</CustomButton>
        </Link>

        <CustomButton color='primary'>
          Abrir Menu 
        </CustomButton>
      </View>


    </SafeAreaView>
  )
}

export default HomeScreen