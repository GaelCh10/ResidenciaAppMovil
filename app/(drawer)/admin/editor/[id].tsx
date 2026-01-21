import { supabase } from '@/src/lib/supabase';
import { Ionicons } from '@expo/vector-icons';
import { Stack, useLocalSearchParams } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { Alert, Modal, ScrollView, Text, TextInput, TouchableOpacity, View } from 'react-native';

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
  const [tempQuiz, setTempQuiz] = useState<any>({ options: ['','',''] });

  useEffect(() => { cargarTodo(); }, [id]);

  const cargarTodo = async () => {
    setLoading(true);
    // 1. Curso
    const { data: c } = await supabase.from('courses').select('*').eq('id', id).single();
    if (c) setCourse(c);
    // 2. Lecciones (lessons)
    const { data: l } = await supabase.from('lessons').select('*').eq('course_id', id).order('order_index');
    if (l) setLessons(l);
    // 3. Quiz (quiz_questions)
    const { data: q } = await supabase.from('quiz_questions').select('*').eq('course_id', id);
    if (q) setQuestions(q);
    setLoading(false);
  };

  // --- LECCIONES ---
  const guardarLeccion = async () => {
    const payload = {
        course_id: id,
        title: tempLesson.title || 'Sin título',
        type: tempLesson.type || 'video',
        content_url: tempLesson.content_url,
        spanish_text: tempLesson.spanish_text,   // <--- Campo específico solicitado
        lsm_text_code: tempLesson.lsm_text_code, // <--- Campo específico solicitado
        order_index: tempLesson.order_index || lessons.length + 1
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
    await supabase.from('lessons').delete().eq('id', lid);
    cargarTodo();
  };

  // --- QUIZ ---
  const guardarQuiz = async () => {
    if (!tempQuiz.question_text || !tempQuiz.correct_answer) return Alert.alert("Faltan datos");
    const payload = {
        course_id: id,
        question_text: tempQuiz.question_text,
        media_url: tempQuiz.media_url,
        options: tempQuiz.options, // Enviamos el Array JSON
        correct_answer: tempQuiz.correct_answer
    };

    if (tempQuiz.id) {
        await supabase.from('quiz_questions').update(payload).eq('id', tempQuiz.id);
    } else {
        await supabase.from('quiz_questions').insert(payload);
    }
    setQuizModal(false);
    cargarTodo();
  };

  const borrarQuiz = async (qid: string) => {
    await supabase.from('quiz_questions').delete().eq('id', qid);
    cargarTodo();
  };

  return (
    <View className="flex-1 bg-gray-50">
      <Stack.Screen options={{ title: course ? `Editando: ${course.title}` : 'Editor', headerBackTitle: 'Cursos' }} />

      <ScrollView className="p-4">
        {/* LECCIONES */}
        <View className="mb-8">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-lg text-gray-800">Lecciones</Text>
                <TouchableOpacity onPress={() => { setTempLesson({type:'video'}); setLessonModal(true); }} className="bg-green-100 px-3 py-1 rounded-full"><Text className="text-green-700 font-bold">+ Agregar</Text></TouchableOpacity>
            </View>
            {lessons.map((l, idx) => (
                <View key={l.id} className="bg-white p-3 rounded-lg mb-2 border border-gray-200 flex-row justify-between">
                    <TouchableOpacity onPress={() => { setTempLesson(l); setLessonModal(true); }} className="flex-1">
                        <Text className="font-bold">Pag {idx+1}. {l.spanish_text || 'Sin texto'}</Text>
                        <Text className="text-xs text-gray-400">{l.type} - {l.lsm_text_code}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => borrarLeccion(l.id)}><Ionicons name="trash-outline" size={20} color="red" /></TouchableOpacity>
                </View>
            ))}
        </View>

        {/* QUIZ */}
        <View className="mb-20">
            <View className="flex-row justify-between items-center mb-3">
                <Text className="font-bold text-lg text-gray-800">Preguntas</Text>
                <TouchableOpacity onPress={() => { setTempQuiz({options:['','','']}); setQuizModal(true); }} className="bg-orange-100 px-3 py-1 rounded-full"><Text className="text-orange-700 font-bold">+ Agregar</Text></TouchableOpacity>
            </View>
            {questions.map((q, idx) => (
                <View key={q.id} className="bg-white p-3 rounded-lg mb-2 border border-gray-200 flex-row justify-between">
                    <TouchableOpacity onPress={() => { setTempQuiz(q); setQuizModal(true); }} className="flex-1">
                        <Text className="font-bold">{idx+1}. {q.question_text}</Text>
                        <Text className="text-xs text-green-600">R: {q.correct_answer}</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => borrarQuiz(q.id)}><Ionicons name="trash-outline" size={20} color="red" /></TouchableOpacity>
                </View>
            ))}
        </View>
      </ScrollView>

      {/* MODAL LECCIÓN */}
      <Modal visible={lessonModal} animationType="slide">
        <View className="flex-1 bg-gray-50 p-6 pt-12">
            <Text className="text-xl font-bold mb-4">Editar Lección</Text>
            
            <Text className="text-xs text-gray-500 mb-1">Texto en Español</Text>
            <TextInput value={tempLesson.spanish_text} onChangeText={t => setTempLesson({...tempLesson, spanish_text: t})} className="bg-white p-3 rounded-lg mb-3 border border-gray-200" />
            
            <Text className="text-xs text-gray-500 mb-1">Código LSM (Fuente Vulpy)</Text>
            <TextInput value={tempLesson.lsm_text_code} onChangeText={t => setTempLesson({...tempLesson, lsm_text_code: t})} className="bg-white p-3 rounded-lg mb-3 border border-gray-200" />
            
            <Text className="text-xs text-gray-500 mb-1">URL Contenido (Video/Img)</Text>
            <TextInput value={tempLesson.content_url} onChangeText={t => setTempLesson({...tempLesson, content_url: t})} className="bg-white p-3 rounded-lg mb-3 border border-gray-200" />
            
            <View className="flex-row mb-4">
                <TouchableOpacity onPress={() => setTempLesson({...tempLesson, type: 'video'})} className={`p-2 mr-2 rounded border ${tempLesson.type === 'video' ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}><Text>Video</Text></TouchableOpacity>
                <TouchableOpacity onPress={() => setTempLesson({...tempLesson, type: 'image'})} className={`p-2 rounded border ${tempLesson.type === 'image' ? 'bg-blue-100 border-blue-500' : 'bg-white'}`}><Text>Imagen</Text></TouchableOpacity>
            </View>

            <TouchableOpacity onPress={guardarLeccion} className="bg-green-600 p-4 rounded-xl"><Text className="text-white text-center font-bold">Guardar Lección</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setLessonModal(false)} className="p-4"><Text className="text-center text-red-500">Cancelar</Text></TouchableOpacity>
        </View>
      </Modal>

      {/* MODAL QUIZ */}
      <Modal visible={quizModal} animationType="slide">
        <ScrollView className="flex-1 bg-gray-50 p-6 pt-12">
            <Text className="text-xl font-bold mb-4">Editar Pregunta</Text>
            <TextInput placeholder="Pregunta" value={tempQuiz.question_text} onChangeText={t => setTempQuiz({...tempQuiz, question_text: t})} className="bg-white p-3 rounded-lg mb-3" />
            
            <Text className="mb-2 font-bold text-xs">OPCIONES (3 Opciones)</Text>
            {tempQuiz.options?.map((opt: string, idx: number) => (
                <TextInput key={idx} placeholder={`Opción ${idx+1}`} value={opt} onChangeText={t => {
                    const newOpts = [...tempQuiz.options]; newOpts[idx] = t; setTempQuiz({...tempQuiz, options: newOpts});
                }} className="bg-white p-3 rounded-lg mb-2" />
            ))}

            <Text className="mb-2 mt-2 font-bold text-xs text-green-600">RESPUESTA CORRECTA (Copia exacta)</Text>
            <TextInput value={tempQuiz.correct_answer} onChangeText={t => setTempQuiz({...tempQuiz, correct_answer: t})} className="bg-green-50 border border-green-200 p-3 rounded-lg mb-4" />

            <TouchableOpacity onPress={guardarQuiz} className="bg-orange-600 p-4 rounded-xl"><Text className="text-white text-center font-bold">Guardar Pregunta</Text></TouchableOpacity>
            <TouchableOpacity onPress={() => setQuizModal(false)} className="p-4"><Text className="text-center text-red-500">Cancelar</Text></TouchableOpacity>
        </ScrollView>
      </Modal>
    </View>
  );
}