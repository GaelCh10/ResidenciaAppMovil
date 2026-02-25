import { Ionicons } from '@expo/vector-icons';
import { DrawerActions } from '@react-navigation/native';
import { router, Stack, useNavigation } from 'expo-router';
const StackLayout = () => {
    const navigation = useNavigation();

    const onHeaderLeftClick = (canGoBack?: boolean) => {
        if (canGoBack) {
            router.back()
            return;

        } else {
            navigation.dispatch(DrawerActions.toggleDrawer());
        }
    };


    return (
        <Stack
            screenOptions={{
                // headerShown: false,
                headerShadowVisible: false,
                /* headerTitleStyle:{                   
                },
 */
                headerTintColor: '#fff',
                headerStyle: {
                    backgroundColor: '#0b1973',
                },

                contentStyle: {
                    backgroundColor: 'white',

                },

                headerLeft: ({ tintColor, canGoBack }) => (
                    <Ionicons
                        name={canGoBack ? 'arrow-back-outline' : 'menu-outline'}
                        className="mr-5"
                        color={'#fff'}
                        size={20}
                        onPress={() => onHeaderLeftClick(canGoBack)}
                    />
                ),
            }}
        >
            <Stack.Screen
                name="home/index"
                options={{
                    title: 'Inicio',
                }}
            />
            <Stack.Screen
                name="cursos/index"
                options={{
                    title: 'Cursos LSM',
                }}
            />

            <Stack.Screen
                name="profile/index"
                options={{
                    title: 'Cursos Español Gestuno',
                }}
            />
            <Stack.Screen
                name="settings/index"
                options={{
                    title: 'Ajustes Pantalla',
                }}
            />
        </Stack>
    );
};
export default StackLayout;