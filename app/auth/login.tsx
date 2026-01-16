import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';
import { useRouter } from 'expo-router';
import { supabase } from '@/src/lib/supabase';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';

export default function LoginScreen() {
  const router = useRouter();
  
  // Estados del formulario
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState(''); // Nuevo campo
  const [loading, setLoading] = useState(false);

  // Estados de la vista (Modos)
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false); // Nuevo modo Admin

  const handleAuth = async () => {
    setLoading(true);
    try {
      if (isRegistering) {
        // --- LÓGICA DE REGISTRO ---
        if (!username.trim()) throw new Error("El nombre de usuario es obligatorio");
        
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            // Aquí mandamos los datos extra para que el Trigger los guarde en la BD
            data: { 
              full_name: username, // Usamos el mismo para nombre completo por simplicidad
              username: username 
            } 
          }
        });
        if (error) throw error;
        Alert.alert('Registro exitoso', 'Verifica tu correo o inicia sesión.');
        setIsRegistering(false);

      } else {
        // --- LÓGICA DE LOGIN ---
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;

        // Si el usuario intentó entrar por el modo "Administrador", verificamos su rol
        if (isAdminMode && data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('role')
            .eq('id', data.user.id)
            .single();

          if (profile?.role !== 'admin') {
            // Si no es admin, lo sacamos inmediatamente
            await supabase.auth.signOut();
            throw new Error("No tienes permisos de Administrador.");
          }
        }
        
        // Si todo está bien, el _layout.tsx detectará la sesión y redirigirá
      }
    } catch (error: any) {
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  // Función para cambiar entre modos limpiando errores visuales
  const toggleMode = (mode: 'register' | 'admin' | 'login') => {
    if (mode === 'register') {
      setIsRegistering(true);
      setIsAdminMode(false);
    } else if (mode === 'admin') {
      setIsRegistering(false);
      setIsAdminMode(true);
    } else {
      // Login normal
      setIsRegistering(false);
      setIsAdminMode(false);
    }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        className="flex-1"
      >
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          <View className="items-center mb-8">
            <Ionicons 
              name={isAdminMode ? "shield-checkmark" : "school"} 
              size={60} 
              color={isAdminMode ? "#EA580C" : "#2563EB"} 
            />
            <Text className={`text-4xl font-work-black mb-2 ${isAdminMode ? 'text-orange-600' : 'text-primary'}`}>
              {isAdminMode ? 'Acceso Admin' : 'Shebbey App'}
            </Text>
            <Text className="text-gray-500 font-work-regular text-center">
              {isAdminMode 
                ? 'Gestión de contenido y usuarios' 
                : 'Aprende Lengua de Señas Mexicana'}
            </Text>
          </View>

          <Text className="text-xl font-bold text-gray-800 mb-6">
            {isRegistering ? 'Crear Cuenta Nueva' : isAdminMode ? 'Hola, Administrador' : 'Iniciar Sesión'}
          </Text>

          <View className="space-y-4">
            
            {/* CAMPO NOMBRE DE USUARIO (Solo en Registro) */}
            {isRegistering && (
              <TextInput
                placeholder="Nombre de usuario"
                value={username}
                onChangeText={setUsername}
                className="bg-gray-100 p-4 rounded-xl text-primary border border-gray-200"
              />
            )}

            <TextInput
              placeholder="Correo electrónico"
              value={email}
              onChangeText={setEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-gray-100 p-4 rounded-xl text-primary border border-gray-200"
            />
            
            <TextInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-gray-100 p-4 rounded-xl text-primary border border-gray-200 mb-4"
            />

            <TouchableOpacity 
              onPress={handleAuth}
              disabled={loading}
              className={`py-4 rounded-xl items-center shadow-lg ${isAdminMode ? 'bg-orange-600' : 'bg-primary'}`}
            >
              {loading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-bold text-lg">
                  {isRegistering ? 'Registrarse' : 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            {/* LINKS DE NAVEGACIÓN ENTRE MODOS */}
            <View className="mt-6 space-y-3">
              
              {/* Link 1: Toggle Registro vs Login Normal */}
              <TouchableOpacity onPress={() => toggleMode(isRegistering ? 'login' : 'register')}>
                <Text className="text-center text-gray-500">
                  {isRegistering 
                    ? '¿Ya tienes cuenta? Inicia sesión' 
                    : '¿No tienes cuenta? Regístrate aquí'}
                </Text>
              </TouchableOpacity>

              {/* Link 2: Toggle Admin vs Login Normal (Solo visible si no estamos registrando) */}
              {!isRegistering && (
                <TouchableOpacity onPress={() => toggleMode(isAdminMode ? 'login' : 'admin')}>
                  <Text className={`text-center font-bold mt-2 ${isAdminMode ? 'text-primary' : 'text-gray-400 text-xs'}`}>
                    {isAdminMode 
                      ? '← Volver al acceso de Estudiantes' 
                      : 'Soy Administrador'}
                  </Text>
                </TouchableOpacity>
              )}

            </View>
          </View>

        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}