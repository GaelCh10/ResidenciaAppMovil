import CustomButton from '@/components/shared/customButton'
import { DrawerActions } from '@react-navigation/native'
import { Link, router, useNavigation } from 'expo-router'
import React from 'react'
import { View } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'

const HomeScreen = () => {

  const navigation = useNavigation()


  // funcion para poder abrir el drawer ya que a este punto su header esta oculto
  const onTooogleDrawer =() => {
    navigation.dispatch (DrawerActions.toggleDrawer)

  }
  return (

    <SafeAreaView>
      <View className='px-10 mt-5'>

        <CustomButton color='primary' className='mb-3'
          onPress={() => router.push('/(drawer)/(tabs)/(stack)/cursos')}>
          Cursos
        </CustomButton>

        <CustomButton color='primary' className='mb-3'
          onPress={() => router.push('/profile')}>

          Cursos Español Gestuno
        </CustomButton>
        {/* mismo funcionamiento que el custom button */}
        <Link href="/settings" asChild>
          <CustomButton color='primary' className='mb-3'>Cursos</CustomButton>
        </Link>

        {/* <CustomButton variant='text-only' color='primary'
          onPress={() => router.push('/settings')}
          className='mb-3'>
          Ajustes
        </CustomButton> */}
        {/* <Text>HomeScreen {' '}</Text>
        <Link className='mb-5' href='/products'>Cursos {' '}</Link>
        <Link className='mb-5' href='/profile'>Perfil {' '}</Link>
        <Link className='mb-5' href='/settings'>Ajustes {' '}</Link> */}
        
          {/* boton para abrir el drawer */}
       {/*  <CustomButton color='primary' onPress={onTooogleDrawer}>
          Abrir Menu 
        </CustomButton> */}
      </View>
    </SafeAreaView>
  )
}

export default HomeScreen