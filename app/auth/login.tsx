import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {
  
  // Formulario
  const [identifier, setIdentifier] = useState(''); // Puede ser email o username
  const [emailRegister, setEmailRegister] = useState(''); // Exclusivo para registro
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  
  const [loading, setLoading] = useState(false);

  // Modos y Modales
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  
  const [showSuccessModal, setShowSuccessModal] = useState(false); // Modal Registro Éxito
  const [showForgotModal, setShowForgotModal] = useState(false); // Modal Olvidé Contraseña
  const [recoveryEmail, setRecoveryEmail] = useState(''); // Email para recuperar

  // --- LÓGICA DE LOGIN (Inteligente) ---
  const handleLogin = async () => {
    setLoading(true);
    try {
      let emailToLogin = identifier.trim();

      // Si NO parece un correo (no tiene @), asumimos que es un Username
      if (!emailToLogin.includes('@')) {
        // Usamos la función SQL que creamos para buscar el correo real
        const { data: foundEmail, error: lookupError } = await supabase
          .rpc('get_email_by_username', { username_input: emailToLogin });

        if (lookupError || !foundEmail) {
          throw new Error("Usuario no encontrado. Verifica que esté escrito correctamente.");
        }
        emailToLogin = foundEmail;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password,
      });
      if (error) throw error;

      // Verificación extra si es Admin
      if (isAdminMode && data.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single();
        if (profile?.role !== 'admin') {
          await supabase.auth.signOut();
          throw new Error("No tienes permisos de Administrador.");
        }
      }
    } catch (error: any) {
      Alert.alert('Error de inicio de sesión', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE REGISTRO ---
  const handleRegister = async () => {
    if (!username.trim() || !emailRegister.trim() || !password.trim()) {
      return Alert.alert("Faltan datos", "Por favor llena todos los campos");
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: emailRegister,
        password,
        options: {
          data: { 
            full_name: username, 
            username: username 
          } 
        }
      });
      if (error) throw error;
      
      // ÉXITO: Mostrar Modal bonito
      setShowSuccessModal(true);
      setIsRegistering(false); // Regresar al login de fondo
      setIdentifier(emailRegister); // Prellenar el campo
    } catch (error: any) {
      Alert.alert('Error de registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  // --- LÓGICA DE RECUPERACIÓN ---
  const handleRecovery = async () => {
    if (!recoveryEmail.includes('@')) {
      return Alert.alert("Error", "Ingresa un correo válido");
    }
    setLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        // Si usas Deep Linking, aquí iría tu redirectUrl. Por defecto Supabase manda una web.
      });
      if (error) throw error;
      Alert.alert("Correo enviado", "Revisa tu bandeja de entrada para restablecer tu contraseña.");
      setShowForgotModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  // Toggle entre modos
  const toggleMode = (mode: 'register' | 'admin' | 'login') => {
    setIdentifier(''); setPassword(''); setUsername(''); setEmailRegister('');
    if (mode === 'register') { setIsRegistering(true); setIsAdminMode(false); }
    else if (mode === 'admin') { setIsRegistering(false); setIsAdminMode(true); }
    else { setIsRegistering(false); setIsAdminMode(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }}>
          
          {/* LOGO E INTRO */}
          <View className="items-center mb-8">
            <Ionicons 
              name={isAdminMode ? "shield-checkmark" : "school"} 
              size={60} 
              color={isAdminMode ? "#EA580C" : "#2563EB"} 
            />
            <Text className={`text-4xl font-work-black mb-2 ${isAdminMode ? 'text-orange-600' : 'text-primary'}`}>
              {isAdminMode ? 'Acceso Admin' : 'LSM App'}
            </Text>
            <Text className="text-gray-500 font-work-regular text-center">
              {isAdminMode ? 'Gestión de contenido' : 'Aprende Lengua de Señas Mexicana'}
            </Text>
          </View>

          <Text className="text-xl font-bold text-gray-800 mb-6">
            {isRegistering ? 'Crear Cuenta' : isAdminMode ? 'Hola, Administrador' : 'Iniciar Sesión'}
          </Text>

          {/* FORMULARIO */}
          <View className="space-y-4">
            
            {/* Solo en Registro: Username y Email separados */}
            {isRegistering && (
              <>
                <TextInput
                  placeholder="Nombre de Usuario (Único)"
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                  className="bg-gray-100 p-4 rounded-xl text-primary border border-gray-200"
                />
                <TextInput
                  placeholder="Correo Electrónico"
                  value={emailRegister}
                  onChangeText={setEmailRegister}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  className="bg-gray-100 p-4 rounded-xl text-primary border border-gray-200"
                />
              </>
            )}

            {/* Solo en Login: Campo Único (Usuario o Email) */}
            {!isRegistering && (
              <TextInput
                placeholder={isAdminMode ? "Correo de Administrador" : "Correo o Nombre de Usuario"}
                value={identifier}
                onChangeText={setIdentifier}
                autoCapitalize="none"
                className="bg-gray-100 p-4 rounded-xl text-primary border border-gray-200"
              />
            )}

            <TextInput
              placeholder="Contraseña"
              value={password}
              onChangeText={setPassword}
              secureTextEntry
              className="bg-gray-100 p-4 rounded-xl text-primary border border-gray-200"
            />

            {/* Link Olvidé Contraseña (Solo en Login) */}
            {!isRegistering && (
              <TouchableOpacity onPress={() => setShowForgotModal(true)} className="self-end">
                <Text className="text-blue-500 font-work-medium text-sm">¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              onPress={isRegistering ? handleRegister : handleLogin}
              disabled={loading}
              className={`py-4 rounded-xl items-center shadow-lg mt-4 ${isAdminMode ? 'bg-orange-600' : 'bg-primary'}`}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text className="text-white font-bold text-lg">
                  {isRegistering ? 'Registrarse' : 'Entrar'}
                </Text>
              )}
            </TouchableOpacity>

            {/* NAVEGACIÓN INFERIOR */}
            <View className="mt-6 space-y-3">
              <TouchableOpacity onPress={() => toggleMode(isRegistering ? 'login' : 'register')}>
                <Text className="text-center text-gray-500">
                  {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate aquí'}
                </Text>
              </TouchableOpacity>

              {!isRegistering && (
                <TouchableOpacity onPress={() => toggleMode(isAdminMode ? 'login' : 'admin')}>
                  <Text className={`text-center font-bold mt-2 ${isAdminMode ? 'text-primary' : 'text-gray-400 text-xs'}`}>
                    {isAdminMode ? '← Volver a Estudiantes' : 'Soy Administrador'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      {/* --- MODAL 1: ÉXITO REGISTRO --- */}
      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center shadow-2xl">
            <Ionicons name="mail-unread-outline" size={60} color="#2563EB" />
            <Text className="text-2xl font-bold text-primary mt-4 text-center">¡Casi listo!</Text>
            <Text className="text-gray-600 text-center mt-2 mb-6 leading-6">
              Hemos enviado un correo a <Text className="font-bold">{emailRegister}</Text>.{"\n"}
              Por favor confirma tu cuenta para poder iniciar sesión.
            </Text>
            <TouchableOpacity 
              onPress={() => setShowSuccessModal(false)}
              className="bg-primary w-full py-3 rounded-xl"
            >
              <Text className="text-white text-center font-bold">Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* --- MODAL 2: RECUPERAR CONTRASEÑA --- */}
      <Modal visible={showForgotModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white p-6 rounded-t-3xl shadow-2xl">
            <View className="flex-row justify-between items-center mb-4">
                <Text className="text-xl font-bold text-gray-800">Recuperar Cuenta</Text>
                <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                    <Ionicons name="close-circle" size={30} color="#ccc" />
                </TouchableOpacity>
            </View>
            <Text className="text-gray-500 mb-4">Ingresa tu correo y te enviaremos un enlace para restablecer tu contraseña.</Text>
            
            <TextInput
              placeholder="Tu correo electrónico"
              value={recoveryEmail}
              onChangeText={setRecoveryEmail}
              autoCapitalize="none"
              keyboardType="email-address"
              className="bg-gray-100 p-4 rounded-xl text-primary border border-gray-200 mb-4"
            />

            <TouchableOpacity 
              onPress={handleRecovery}
              disabled={loading}
              className="bg-primary w-full py-4 rounded-xl items-center"
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text className="text-white font-bold">Enviar Correo</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

    </SafeAreaView>
  );
}