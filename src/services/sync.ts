import { supabase } from '@/src/lib/supabase';
import NetInfo from '@react-native-community/netinfo';
import { getDB } from './db';

const db = getDB();

export const sincronizarDatos = async () => {
  // 1. Verificar si hay internet
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    console.log("Modo Offline: Usando datos locales");
    return; // Si no hay internet, no hacemos nada (usamos lo que ya hay)
  }

  console.log("Iniciando sincronización...");

  try {

    // 1. CATEGORÍAS (General, Básico...)
    const { data: ccats } = await supabase.from('categories').select('*');
    if (ccats) {
      await db.runAsync('DELETE FROM categories'); 
      for (const c of ccats) {
        await db.runAsync(
          'INSERT INTO categories (id, name, description, order_index) VALUES (?, ?, ?, ?)',
          [c.id, c.name, c.description, c.order_index]
        );
      }
    }

    // 2. NIVELES (Básico 1, Básico 2...)
    const { data: levels } = await supabase.from('levels').select('*');
    if (levels) {
      await db.runAsync('DELETE FROM levels');
      for (const l of levels) {
        await db.runAsync(
          'INSERT INTO levels (id, category_id, name, order_index) VALUES (?, ?, ?, ?)',
          [l.id, l.category_id, l.name, l.order_index]
        );
      }
    }
    // --- A. CURSOS ---
    const { data: courses } = await supabase.from('courses').select('*');
    if (courses) {
      await db.runAsync('DELETE FROM courses'); // Borramos viejo para evitar duplicados
      for (const c of courses) {
        await db.runAsync(
          'INSERT INTO courses (id, title, description, image_url, level_id) VALUES (?, ?, ?, ?, ?)',
          [c.id, c.title, c.description, c.cover_image_url, c.level_id]
        );
      }
    }

    // --- B. LECCIONES ---
    const { data: lessons } = await supabase.from('lessons').select('*');
    if (lessons) {
      await db.runAsync('DELETE FROM lessons');
      for (const l of lessons) {
        await db.runAsync(
          'INSERT INTO lessons (id, course_id, title, content_url, spanish_text, lsm_text_code, type, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?)',
          [l.id, l.course_id, l.title, l.content_url, l.spanish_text, l.lsm_text_code, l.type, l.order_index]
        );
      }
    }

    console.log("🔍 Buscando preguntas...");
    const { data: quiz, error: quizError } = await supabase.from('quiz_questions').select('*');
    
    if (quizError) {
        console.error("Error bajando preguntas:", quizError.message);
    } else if (quiz) {
      console.log(`Preguntas encontradas: ${quiz.length}`);
      await db.runAsync('DELETE FROM quiz_questions');
      
      for (const q of quiz) {
        // IMPORTANTE: Convertimos el JSON (array de opciones) a STRING para SQLite
        let optionsString = q.options;
        if (typeof q.options === 'object') {
            optionsString = JSON.stringify(q.options);
        }

        await db.runAsync(
          'INSERT INTO quiz_questions (id, course_id, question_text, media_url, options, correct_answer) VALUES (?, ?, ?, ?, ?, ?)',
          [q.id, q.course_id, q.question_text, q.media_url, optionsString, q.correct_answer]
        );
      }
    }

    // --- C. DICCIONARIO ---
    const { data: cats } = await supabase.from('dictionary_categories').select('*');
    if (cats) {
      await db.runAsync('DELETE FROM dictionary_categories');
      for (const c of cats) {
        await db.runAsync(
          'INSERT INTO dictionary_categories (id, name, image_url) VALUES (?, ?, ?)',
          [c.id, c.name, c.image_url]
        );
      }
    }

    const { data: words } = await supabase.from('dictionary_entries').select('*');
    if (words) {
      await db.runAsync('DELETE FROM dictionary_entries');
      for (const w of words) {
        await db.runAsync(
          'INSERT INTO dictionary_entries (id, category_id, word, media_url, media_type) VALUES (?, ?, ?, ?, ?)',
          [w.id, w.category_id, w.word, w.media_url, w.media_type]
        );
      }
    }

    console.log("Sincronización completada");

  } catch (error) {
    console.error("Error en sincronización:", error);
  }
};