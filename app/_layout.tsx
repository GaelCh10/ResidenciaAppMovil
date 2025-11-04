import { useFonts } from 'expo-font'
import { Slot, SplashScreen, Stack } from 'expo-router'
import "./global.css"
import { useEffect } from 'react';
import {GestureHandlerRootView} from 'react-native-gesture-handler';
SplashScreen.preventAutoHideAsync();

const RootLayout = () => {

  const [fontsLoaded, error] = useFonts({
  
    'TitilliumWeb-Black': require('../assets/fonts/TitilliumWeb-Black.ttf'),
    'TitilliumWeb-Light': require('../assets/fonts/TitilliumWeb-Light.ttf'),
    'TitilliumWeb-Regular': require('../assets/fonts/TitilliumWeb-Regular.ttf'),
  })

  useEffect(() => {
    if(error) throw error;
    if(fontsLoaded) SplashScreen.hideAsync();
  }, [fontsLoaded, error])
  
  if (!fontsLoaded && !error) return null;


  return (
  <GestureHandlerRootView style={{flex:1}}>
    <Slot />
  </GestureHandlerRootView>
  
)
  // return <Slot />
  // return <Stack />
}

export default RootLayout