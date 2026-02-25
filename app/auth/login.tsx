import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import * as Linking from 'expo-linking';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Modal, Platform, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function LoginScreen() {

  const [identifier, setIdentifier] = useState(''); 
  const [loading, setLoading] = useState(false);
  const [emailRegister, setEmailRegister] = useState(''); 
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState(''); 
  const [username, setUsername] = useState('');
  const [nombre, setNombre] = useState('');
  const [apellidoPaterno, setApellidoPaterno] = useState(''); 
  const [apellidoMaterno, setApellidoMaterno] = useState(''); 
  const [fechaNacimiento, setFechaNacimiento] = useState(''); 
  const [sexo, setSexo] = useState<'M' | 'F' | 'O' | ''>(''); 
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isRegistering, setIsRegistering] = useState(false);
  const [isAdminMode, setIsAdminMode] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false); 
  const [showForgotModal, setShowForgotModal] = useState(false); 
  const [recoveryEmail, setRecoveryEmail] = useState(''); 
  const hasMinLength = password.length >= 8 && password.length <= 15;
  const hasUpperCase = /[A-Z]/.test(password);
  const hasNumber = /[0-9]/.test(password);
  const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
  const passwordsMatch = password !== '' && password === confirmPassword;

  const handleLogin = async () => {
    setLoading(true);
    try {
      let emailToLogin = identifier.trim();

      if (!emailToLogin.includes('@')) {
        const { data: foundEmail, error: lookupError } = await supabase
          .rpc('get_email_by_username', { username_input: emailToLogin });

        if (lookupError || !foundEmail) throw new Error("Usuario no encontrado.");
        emailToLogin = foundEmail;
      }

      const { data, error } = await supabase.auth.signInWithPassword({
        email: emailToLogin,
        password,
      });
      if (error) throw error;

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
      Alert.alert('Error', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username.trim() || !emailRegister.trim() || !password.trim() || !confirmPassword.trim() ||
        !nombre.trim() || !apellidoPaterno.trim() || !fechaNacimiento.trim() || !sexo) {
      return Alert.alert("Faltan datos", "Por favor llena todos los campos del perfil.");
    }

    if (!hasMinLength || !hasUpperCase || !hasNumber || !hasSpecialChar) {
      return Alert.alert("Contraseña Insegura", "Por favor cumple con todos los requisitos de la contraseña.");
    }

    if (!passwordsMatch) {
        return Alert.alert("Error", "Las contraseñas no coinciden.");
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signUp({
        email: emailRegister,
        password,
        options: {
          data: { 
            username: username,
            full_name: `${nombre} ${apellidoPaterno} ${apellidoMaterno}`.trim(),
            first_name: nombre,
            paternal_surname: apellidoPaterno,
            maternal_surname: apellidoMaterno,
            birth_date: fechaNacimiento, 
            gender: sexo
          } 
        }
      });
      if (error) throw error;
      
      setShowSuccessModal(true);
      setIsRegistering(false); 
      setIdentifier(emailRegister);
    } catch (error: any) {
      Alert.alert('Error de registro', error.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRecovery = async () => {
    if (!recoveryEmail.includes('@')) {
      return Alert.alert("Error", "Ingresa un correo válido");
    }
    setLoading(true);
    try {
      const redirectUrl = Linking.createURL('restablecer'); 
      const { error } = await supabase.auth.resetPasswordForEmail(recoveryEmail, {
        redirectTo: redirectUrl,
      });
      
      if (error) throw error;
      
      Alert.alert("Correo enviado", "Revisa tu bandeja de entrada o carpeta de Spam.");
      setShowForgotModal(false);
    } catch (error: any) {
      Alert.alert("Error", error.message);
    } finally {
      setLoading(false);
    }
  };

  const formatFecha = (text: string) => {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 2) cleaned = cleaned.slice(0, 2) + '/' + cleaned.slice(2);
    if (cleaned.length > 5) cleaned = cleaned.slice(0, 5) + '/' + cleaned.slice(5);
    if (cleaned.length > 10) cleaned = cleaned.slice(0, 10);
    setFechaNacimiento(cleaned);
  };

  const toggleMode = (mode: 'register' | 'admin' | 'login') => {
    setIdentifier(''); setPassword(''); setConfirmPassword(''); setUsername(''); setEmailRegister('');
    setNombre(''); setApellidoPaterno(''); setApellidoMaterno(''); setFechaNacimiento(''); setSexo('');
    
    if (mode === 'register') { setIsRegistering(true); setIsAdminMode(false); }
    else if (mode === 'admin') { setIsRegistering(false); setIsAdminMode(true); }
    else { setIsRegistering(false); setIsAdminMode(false); }
  };

  return (
    <SafeAreaView className="flex-1 bg-white">
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} className="flex-1">
        <ScrollView contentContainerStyle={{ flexGrow: 1, justifyContent: 'center', padding: 24 }} showsVerticalScrollIndicator={false}>
          
          <View className="items-center mb-6">
            <Ionicons 
              name={isAdminMode ? "shield-checkmark" : "school"} 
              size={50} 
              color={isAdminMode ? "#EA580C" : "#2563EB"} 
            />
            <Text className={`text-3xl font-work-black ${isAdminMode ? 'text-orange-600' : 'text-primary'}`}>
              {isAdminMode ? 'Admin' : 'Shbeey'}
            </Text>
          </View>

          <Text className="text-xl font-bold text-gray-800 mb-6 text-center">
            {isRegistering ? 'Crear Nuevo Perfil' : isAdminMode ? 'Acceso Administrativo' : 'Iniciar Sesión'}
          </Text>

          <View className="space-y-4">
            {isRegistering && (
              <>
                <View>
                    <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Nombre(s) *</Text>
                    <TextInput placeholder="Ej: Juan Carlos" value={nombre} onChangeText={setNombre} className="bg-gray-50 p-3 rounded-xl border border-gray-200" />
                </View>

                <View className="flex-row gap-2">
                    <View className="flex-1">
                        <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Apellido Paterno *</Text>
                        <TextInput placeholder="Ej: Pérez" value={apellidoPaterno} onChangeText={setApellidoPaterno} className="bg-gray-50 p-3 rounded-xl border border-gray-200" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Apellido Materno</Text>
                        <TextInput placeholder="Ej: López" value={apellidoMaterno} onChangeText={setApellidoMaterno} className="bg-gray-50 p-3 rounded-xl border border-gray-200" />
                    </View>
                </View>

                <View className="flex-row gap-2">
                    <View className="flex-1">
                        <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">F. de Nacimiento *</Text>
                        <TextInput placeholder="DD/MM/AAAA" value={fechaNacimiento} onChangeText={formatFecha} keyboardType="numeric" maxLength={10} className="bg-gray-50 p-3 rounded-xl border border-gray-200" />
                    </View>
                    <View className="flex-1">
                        <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Sexo *</Text>
                        <View className="flex-row flex-1 bg-gray-50 rounded-xl border border-gray-200 p-1">
                            <TouchableOpacity onPress={() => setSexo('M')} className={`flex-1 items-center justify-center rounded-lg ${sexo === 'M' ? 'bg-blue-100' : ''}`}><Text className={sexo === 'M' ? 'font-bold text-blue-700' : 'text-gray-400'}>H</Text></TouchableOpacity>
                            <TouchableOpacity onPress={() => setSexo('F')} className={`flex-1 items-center justify-center rounded-lg ${sexo === 'F' ? 'bg-pink-100' : ''}`}><Text className={sexo === 'F' ? 'font-bold text-pink-700' : 'text-gray-400'}>M</Text></TouchableOpacity>
                        </View>
                    </View>
                </View>

                <View className="h-[1px] bg-gray-100 my-2" />
                
                <View>
                    <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Nombre de Usuario *</Text>
                    <TextInput placeholder="Ej: juancho99" value={username} onChangeText={setUsername} autoCapitalize="none" className="bg-gray-50 p-3 rounded-xl border border-gray-200" />
                </View>
                
                <View>
                    <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Correo Electrónico *</Text>
                    <TextInput placeholder="correo@ejemplo.com" value={emailRegister} onChangeText={setEmailRegister} keyboardType="email-address" autoCapitalize="none" className="bg-gray-50 p-3 rounded-xl border border-gray-200" />
                </View>
              </>
            )}

            {!isRegistering && (
              <View>
                <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">{isAdminMode ? "Correo Administrador" : "Correo o Usuario"}</Text>
                <TextInput placeholder={isAdminMode ? "admin@shbeey.com" : "Escribe tu usuario o correo"} value={identifier} onChangeText={setIdentifier} autoCapitalize="none" className="bg-gray-50 p-4 rounded-xl text-primary border border-gray-200" />
              </View>
            )}

            <View>
                <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Contraseña {isRegistering && "*"}</Text>
                <View className="flex-row items-center bg-gray-50 rounded-xl border border-gray-200">
                    <TextInput 
                        placeholder="••••••••" 
                        value={password} 
                        onChangeText={setPassword} 
                        secureTextEntry={!showPassword} 
                        className="flex-1 p-4 text-primary" 
                    />
                    <TouchableOpacity onPress={() => setShowPassword(!showPassword)} className="p-4">
                        <Ionicons name={showPassword ? "eye-off" : "eye"} size={20} color="gray" />
                    </TouchableOpacity>
                </View>
            </View>

            {isRegistering && (
                <View className="bg-gray-50 p-3 rounded-xl border border-gray-100">
                    <Text className="text-xs text-gray-500 font-bold mb-2">Tu contraseña debe tener:</Text>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name={hasMinLength ? "checkmark-circle" : "ellipse-outline"} size={16} color={hasMinLength ? "green" : "gray"} />
                        <Text className={`text-xs ml-2 ${hasMinLength ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Entre 8 y 15 caracteres</Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name={hasUpperCase ? "checkmark-circle" : "ellipse-outline"} size={16} color={hasUpperCase ? "green" : "gray"} />
                        <Text className={`text-xs ml-2 ${hasUpperCase ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos una mayúscula</Text>
                    </View>
                    <View className="flex-row items-center mb-1">
                        <Ionicons name={hasNumber ? "checkmark-circle" : "ellipse-outline"} size={16} color={hasNumber ? "green" : "gray"} />
                        <Text className={`text-xs ml-2 ${hasNumber ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Al menos un número</Text>
                    </View>
                    <View className="flex-row items-center">
                        <Ionicons name={hasSpecialChar ? "checkmark-circle" : "ellipse-outline"} size={16} color={hasSpecialChar ? "green" : "gray"} />
                        <Text className={`text-xs ml-2 ${hasSpecialChar ? 'text-green-700 font-medium' : 'text-gray-500'}`}>Un carácter especial (!@#$%)</Text>
                    </View>
                </View>
            )}

            {isRegistering && (
                <View>
                    <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Confirmar Contraseña *</Text>
                    <View className={`flex-row items-center bg-gray-50 rounded-xl border ${password && !passwordsMatch ? 'border-red-300' : passwordsMatch ? 'border-green-300' : 'border-gray-200'}`}>
                        <TextInput 
                            placeholder="••••••••" 
                            value={confirmPassword} 
                            onChangeText={setConfirmPassword} 
                            secureTextEntry={!showConfirmPassword} 
                            className="flex-1 p-4 text-primary" 
                        />
                        <TouchableOpacity onPress={() => setShowConfirmPassword(!showConfirmPassword)} className="p-4">
                            <Ionicons name={showConfirmPassword ? "eye-off" : "eye"} size={20} color="gray" />
                        </TouchableOpacity>
                    </View>
                    {password !== '' && confirmPassword !== '' && !passwordsMatch && (
                        <Text className="text-red-500 text-xs ml-1 mt-1">Las contraseñas no coinciden</Text>
                    )}
                </View>
            )}

            {!isRegistering && (
              <TouchableOpacity onPress={() => setShowForgotModal(true)} className="self-end mt-2">
                <Text className="text-blue-500 font-medium text-sm">¿Olvidaste tu contraseña?</Text>
              </TouchableOpacity>
            )}

            <TouchableOpacity 
              onPress={isRegistering ? handleRegister : handleLogin}
              disabled={loading}
              className={`py-4 rounded-xl items-center shadow-md mt-6 ${isAdminMode ? 'bg-orange-600' : 'bg-primary'}`}
            >
              {loading ? <ActivityIndicator color="white" /> : (
                <Text className="text-white font-bold text-lg">{isRegistering ? 'Crear Cuenta' : 'Entrar'}</Text>
              )}
            </TouchableOpacity>

            <View className="mt-6 space-y-4">
              <TouchableOpacity onPress={() => toggleMode(isRegistering ? 'login' : 'register')} className="p-2">
                <Text className="text-center text-gray-600 font-medium">
                    {isRegistering ? '¿Ya tienes cuenta? Inicia sesión' : '¿No tienes cuenta? Regístrate gratis'}
                </Text>
              </TouchableOpacity>
              
              {!isRegistering && (
                <TouchableOpacity onPress={() => toggleMode(isAdminMode ? 'login' : 'admin')}>
                  <Text className={`text-center font-bold mt-2 ${isAdminMode ? 'text-primary' : 'text-gray-400 text-xs'}`}>
                      {isAdminMode ? 'Volver a modo Estudiante' : 'Acceso Docente'}
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <Modal visible={showSuccessModal} transparent animationType="fade">
        <View className="flex-1 bg-black/50 justify-center items-center px-6">
          <View className="bg-white p-8 rounded-3xl w-full items-center">
            <Ionicons name="mail-unread-outline" size={60} color="#2563EB" />
            <Text className="text-2xl font-bold text-primary mt-4">¡Registro Exitoso!</Text>
            <Text className="text-center mt-2 mb-6 text-gray-500">
                Hemos enviado un correo a <Text className="font-bold">{emailRegister}</Text>. Por favor, confirma tu cuenta para poder entrar.
            </Text>
            <TouchableOpacity onPress={() => setShowSuccessModal(false)} className="bg-primary w-full py-4 rounded-xl">
                <Text className="text-white text-center font-bold text-lg">Entendido</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      <Modal visible={showForgotModal} transparent animationType="slide">
        <View className="flex-1 bg-black/50 justify-end">
          <View className="bg-white p-6 rounded-t-3xl pb-10">
            <View className="flex-row justify-between items-center mb-6">
                <View>
                    <Text className="text-xl font-bold text-primary">Recuperar Cuenta</Text>
                    <Text className="text-gray-500 text-sm mt-1">Te enviaremos un enlace mágico</Text>
                </View>
                <TouchableOpacity onPress={() => setShowForgotModal(false)}>
                    <Ionicons name="close-circle" size={32} color="#ccc" />
                </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500 font-bold ml-1 mb-1">Correo Electrónico registrado</Text>
            <TextInput 
                placeholder="correo@ejemplo.com" 
                value={recoveryEmail} 
                onChangeText={setRecoveryEmail} 
                keyboardType="email-address"
                autoCapitalize="none" 
                className="bg-gray-50 p-4 rounded-xl mb-6 border border-gray-200" 
            />
            <TouchableOpacity onPress={handleRecovery} className="bg-primary w-full py-4 rounded-xl items-center shadow-sm">
              {loading ? <ActivityIndicator color="white" /> : <Text className="text-white font-bold text-lg">Enviar Enlace</Text>}
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}