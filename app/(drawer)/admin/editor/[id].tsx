import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

export default function AdminEditor() {
  const { id } = useLocalSearchParams(); // Course ID
  const [course, setCourse] = useState<any>(null);
  const [lessons, setLessons] = useState<any[]>([]);
  const [questions, setQuestions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Modales
  const [lessonModal, setLessonModal] = useState(false);
  const [quizModal, setQuizModal] = useState(false);
  
  // Datos Temporales
  const [tempLesson, setTempLesson] = useState<any>({});
  const [tempQuiz, setTempQuiz] = useState<any>({ options: ['','',''], media_url: '' });

  useEffect(() => { cargarTodo(); }, [id]);

  const cargarTodo = async () => {
    setLoading(true);
    // 1. Curso
    const { data: c } = await supabase.from('courses').select('*').eq('id', id).single();
    if (c) setCourse(c);
    // 2. Lecciones (Ordenadas por índice)
    const { data: l } = await supabase.from('lessons').select('*').eq('course_id', id).order('order_index');
    if (l) setLessons(l);
    // 3. Quiz
    const { data: q } = await supabase.from('quiz_questions').select('*').eq('course_id', id);
    if (q) setQuestions(q);
    setLoading(false);
  };

  // --- LECCIONES ---
  const guardarLeccion = async () => {
    if (!tempLesson.spanish_text) {
        return Alert.alert("Falta información", "Debes escribir el texto en español.");
    }
    const payload = {
        course_id: id,
        title: tempLesson.spanish_text || 'Sin título',
        type: tempLesson.type || 'video',
        content_url: tempLesson.content_url,
        image_url: tempLesson.image_url,
        spanish_text: tempLesson.spanish_text,
        lsm_text_code: tempLesson.lsm_text_code,
        // Convertimos el string del input a número. Si está vacío, lo pone al final.
        order_index: parseInt(tempLesson.order_index) || lessons.length + 1
    };
    
    if (tempLesson.id) {
        await supabase.from('lessons').update(payload).eq('id', tempLesson.id);
    } else {
        await supabase.from('lessons').insert(payload);
    }
    setLessonModal(false);
    cargarTodo();
  };

  const borrarLeccion = async (lid: string) => {
    Alert.alert("Confirmar", "¿Borrar lección?", [
        { text: "Cancelar" },
        { text: "Borrar", style: 'destructive', onPress: async () => {
            await supabase.from('lessons').delete().eq('id', lid);
            cargarTodo();
        }}
    ]);
  };

  // --- QUIZ ---
  const guardarQuiz = async () => {
    if (!tempQuiz.question_text) return Alert.alert("Falta la pregunta");
    if (tempQuiz.options.some((opt: string) => opt.trim() === '')) return Alert.alert("Completa las 3 opciones");
    if (!tempQuiz.correct_answer) return Alert.alert("Selecciona la respuesta correcta (toca una opción)");

    const payload = {
        course_id: id,
        question_text: tempQuiz.question_text,
        media_url: tempQuiz.media_url,
        options: tempQuiz.options,
        correct_answer: tempQuiz.correct_answer
    };

    const { error } = tempQuiz.id 
        ? await supabase.from('quiz_questions').update(payload).eq('id', tempQuiz.id)
        : await supabase.from('quiz_questions').insert(payload);

    if (error) Alert.alert("Error", error.message);
    else {
        setQuizModal(false);
        cargarTodo();
    }
  };

  const borrarQuiz = async (qid: string) => {
    Alert.alert("Confirmar", "¿Borrar pregunta?", [
        { text: "Cancelar" },
        { text: "Borrar", style: 'destructive', onPress: async () => {
            await supabase.from('quiz_questions').delete().eq('id', qid);
            cargarTodo();
        }}
    ]);
  };

  const seleccionarCorrecta = (opcion: string) => {
      setTempQuiz({ ...tempQuiz, correct_answer: opcion });
  };

  if (loading) return <View className="flex-1 justify-center items-center"><ActivityIndicator /></View>;

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: course ? `Editando: ${course.title}` : 'Editor', headerBackTitle: 'Cursos' }} />

      <ScrollView className="p-4" contentContainerStyle={{ paddingBottom: 50 }}>
        
        {/* SECCIÓN LECCIONES */}
        <View className="mb-8">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-lg text-gray-800">Lecciones ({lessons.length})</Text>
                <TouchableOpacity 
                    onPress={() => { 
                        // Al crear, sugerimos el siguiente número de orden
                        setTempLesson({ type: 'video', order_index: (lessons.length + 1).toString() }); 
                        setLessonModal(true); 
                    }} 
                    className="bg-blue-100 px-3 py-1 rounded-full"
                >
                    <Text className="text-blue-700 font-bold">+ Lección</Text>
                </TouchableOpacity>
            </View>
            
            {lessons.map((l, idx) => (
                <View key={l.id} className="bg-white p-3 rounded-lg mb-2 border border-gray-200 flex-row justify-between items-center shadow-sm">
                    <TouchableOpacity 
                        onPress={() => { 
                            // Al editar, convertimos el número order_index a string para el input
                            setTempLesson({ ...l, order_index: l.order_index?.toString() || '' }); 
                            setLessonModal(true); 
                        }} 
                        className="flex-1"
                    >
                        <Text className="font-bold text-gray-700">
                           {l.order_index}. {l.spanish_text || 'Sin texto'}
                        </Text>
                        <Text className="text-xs text-gray-400 mt-1">{l.type.toUpperCase()} • {l.lsm_text_code}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => borrarLeccion(l.id)} className="p-2 bg-red-50 rounded-full">
                        <Ionicons name="trash-outline" size={18} color="red" />
                    </TouchableOpacity>
                </View>
            ))}
        </View>

        {/* SECCIÓN QUIZ */}
        <View className="mb-20">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-lg text-gray-800">Evaluación ({questions.length})</Text>
                <TouchableOpacity onPress={() => { setTempQuiz({options:['','',''], media_url: ''}); setQuizModal(true); }} className="bg-orange-100 px-3 py-1 rounded-full"><Text className="text-orange-700 font-bold">+ Pregunta</Text></TouchableOpacity>
            </View>
            {questions.map((q, idx) => (
                <View key={q.id} className="bg-white p-4 rounded-xl mb-3 border border-gray-200 shadow-sm">
                    <View className="flex-row justify-between mb-2">
                        <Text className="font-bold text-gray-800 flex-1 mr-2">#{idx+1} {q.question_text}</Text>
                        <TouchableOpacity onPress={() => borrarQuiz(q.id)}><Ionicons name="trash-outline" size={20} color="red" /></TouchableOpacity>
                    </View>
                    
                    {q.media_url && (
                        <View className="flex-row items-center mb-2 bg-gray-50 p-1 rounded self-start">
                            <Ionicons name="image-outline" size={14} color="gray" />
                            <Text className="text-xs text-gray-500 ml-1">Con Multimedia</Text>
                        </View>
                    )}

                    <View className="flex-row flex-wrap gap-2">
                        {q.options.map((opt: string, i: number) => (
                            <View key={i} className={`px-2 py-1 rounded border ${opt === q.correct_answer ? 'bg-green-100 border-green-300' : 'bg-gray-50 border-gray-100'}`}>
                                <Text className={`text-xs ${opt === q.correct_answer ? 'text-green-700 font-bold' : 'text-gray-500'}`}>
                                    {opt} {opt === q.correct_answer && '✓'}
                                </Text>
                            </View>
                        ))}
                    </View>
                    
                    <TouchableOpacity onPress={() => { setTempQuiz(q); setQuizModal(true); }} className="mt-3 border-t border-gray-100 pt-2">
                        <Text className="text-blue-500 text-center font-bold">Editar</Text>
                    </TouchableOpacity>
                </View>
            ))}
        </View>
      </ScrollView>

      {/* --- MODAL LECCIÓN --- */}
      <Modal visible={lessonModal} animationType="slide" presentationStyle="pageSheet">
        <View className="flex-1 bg-gray-50 p-6">
            <Text className="text-xl font-bold mb-6 text-center">Editar Lección</Text>
            
            {/* INPUT DE ORDEN (NUEVO) */}
            <View className="flex-row gap-2 mb-3">
                <View className="flex-1">
                    <Text className="label">Orden</Text>
                    <TextInput 
                        value={tempLesson.order_index} 
                        onChangeText={t => setTempLesson({...tempLesson, order_index: t})} 
                        keyboardType="numeric" 
                        className="input bg-white text-center font-bold" 
                    />
                </View>
                <View className="flex-[3]">
                    <Text className="label">Texto en Español</Text>
                    <TextInput value={tempLesson.spanish_text} onChangeText={t => setTempLesson({...tempLesson, spanish_text: t})} className="input" placeholder="Ej: Buenos días" />
                </View>
            </View>
            
            <Text className="label">Querologia</Text>
            <TextInput value={tempLesson.lsm_text_code} onChangeText={t => setTempLesson({...tempLesson, lsm_text_code: t})} className="input" placeholder="a b c..." />
            
            <Text className="label">URL Multimedia Principal (Video/Seña)</Text>
            <TextInput 
                value={tempLesson.content_url} 
                onChangeText={t => setTempLesson({...tempLesson, content_url: t})} 
                className="input mb-2" 
                placeholder="https://... (Video/Imagen de la seña)" 
                autoCapitalize='none' 
            />

            {/* IMAGEN ILUSTRATIVA */}
            <Text className="label">URL Imagen Ilustrativa </Text>
            <TextInput 
                value={tempLesson.image_url} 
                onChangeText={t => setTempLesson({...tempLesson, image_url: t})} 
                className="input mb-4 border-dashed border-2 border-gray-300" 
                placeholder="https://... (Dibujo/Icono)" 
                autoCapitalize='none' 
            />
            
            <View className="flex-row mb-6 justify-center gap-4 mt-2">
                <TouchableOpacity onPress={() => setTempLesson({...tempLesson, type: 'video'})} className={`option-btn ${tempLesson.type === 'video' ? 'selected' : ''}`}><Text className={tempLesson.type === 'video' ? 'text-blue-600 font-bold' : 'text-gray-500'}>Video</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setTempLesson({...tempLesson, type: 'image'})} className={`option-btn ${tempLesson.type === 'image' ? 'selected' : ''}`}><Text className={tempLesson.type === 'image' ? 'text-blue-600 font-bold' : 'text-gray-500'}>Imagen</Text></TouchableOpacity>
            </View>

            <View className="flex-row gap-4">
                <TouchableOpacity onPress={() => setLessonModal(false)} className="flex-1 bg-gray-200 p-4 rounded-xl"><Text className="text-center font-bold text-gray-700">Cancelar</Text></TouchableOpacity>
                <TouchableOpacity onPress={guardarLeccion} className="flex-1 bg-blue-600 p-4 rounded-xl"><Text className="text-center font-bold text-white">Guardar</Text></TouchableOpacity>
            </View>
        </View>
      </Modal>

      {/* --- MODAL QUIZ --- */}
      <Modal visible={quizModal} animationType="slide" presentationStyle="pageSheet">
        <ScrollView className="flex-1 bg-gray-50 p-6">
            <Text className="text-xl font-bold mb-6 text-center">Configurar Pregunta</Text>
            
            <Text className="label">Pregunta</Text>
            <TextInput 
                placeholder="Ej: ¿Qué significa esta seña?" 
                value={tempQuiz.question_text} 
                onChangeText={t => setTempQuiz({...tempQuiz, question_text: t})} 
                className="input font-bold text-lg" 
            />
            
            <Text className="label">URL de Imagen/Video de Apoyo (Opcional)</Text>
            <TextInput 
                placeholder="https://..." 
                value={tempQuiz.media_url} 
                onChangeText={t => setTempQuiz({...tempQuiz, media_url: t})} 
                className="input text-sm text-blue-600" 
                autoCapitalize='none'
            />
            {tempQuiz.media_url ? (
                <View className="w-full h-32 bg-gray-200 rounded-lg mb-4 items-center justify-center overflow-hidden border border-gray-300">
                    <Image source={{ uri: tempQuiz.media_url }} style={{ width: '100%', height: '100%', resizeMode: 'contain' }} />
                </View>
            ) : null}

            <Text className="label mt-2">OPCIONES DE RESPUESTA</Text>
            <Text className="text-xs text-gray-400 mb-2">Escribe las 3 opciones y luego TOCA la correcta.</Text>
            
            {tempQuiz.options?.map((opt: string, idx: number) => (
                <View key={idx} className="flex-row items-center mb-2">
                    <TextInput 
                        placeholder={`Opción ${idx+1}`} 
                        value={opt} 
                        onChangeText={t => {
                            const newOpts = [...tempQuiz.options]; 
                            newOpts[idx] = t; 
                            let newCorrect = tempQuiz.correct_answer;
                            if (tempQuiz.correct_answer === opt) newCorrect = t;
                            setTempQuiz({...tempQuiz, options: newOpts, correct_answer: newCorrect});
                        }} 
                        className={`flex-1 p-3 rounded-lg border ${opt === tempQuiz.correct_answer && opt !== '' ? 'bg-green-50 border-green-500' : 'bg-white border-gray-200'}`} 
                    />
                    <TouchableOpacity 
                        onPress={() => seleccionarCorrecta(opt)}
                        className={`ml-2 w-10 h-10 rounded-full items-center justify-center border ${opt === tempQuiz.correct_answer && opt !== '' ? 'bg-green-500 border-green-500' : 'bg-white border-gray-300'}`}
                    >
                        {opt === tempQuiz.correct_answer && opt !== '' && <Ionicons name="checkmark" size={24} color="white" />}
                    </TouchableOpacity>
                </View>
            ))}

            <View className="bg-orange-50 p-3 rounded-lg mb-6 mt-2 border border-orange-100">
                <Text className="text-xs text-orange-800 font-bold text-center">
                    Respuesta Correcta: {tempQuiz.correct_answer || "(Ninguna seleccionada)"}
                </Text>
            </View>

            <View className="flex-row gap-4 mb-10">
                <TouchableOpacity onPress={() => setQuizModal(false)} className="flex-1 bg-gray-200 p-4 rounded-xl"><Text className="text-center font-bold text-gray-700">Cancelar</Text></TouchableOpacity>
                <TouchableOpacity onPress={guardarQuiz} className="flex-1 bg-orange-600 p-4 rounded-xl"><Text className="text-center font-bold text-white">Guardar</Text></TouchableOpacity>
            </View>
        </ScrollView>
      </Modal>
    </View>
  );
}