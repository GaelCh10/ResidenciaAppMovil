import { supabase } from "@/src/lib/supabase";
import NetInfo from "@react-native-community/netinfo";
import { getDB } from "./db";

const db = getDB();

export const sincronizarDatos = async (userId?: string) => {
  console.log("🔄 [Sync] Verificando conexión a internet...");
  
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    console.log("📴 [Sync] Modo Offline: No hay internet, se usarán datos locales.");
    return;
  }

  console.log("🌐 [Sync] Conexión detectada. Iniciando descarga de Supabase...");

  try {
    // --- 1. CATEGORÍAS ---
    console.log("📥 [Sync] Descargando Categorías...");
    const { data: ccats, error: errCat } = await supabase.from("categories").select("*");
    
    if (errCat) console.error("❌ [Sync] Error Categorías:", errCat.message);
    else if (ccats) {
      console.log(`📦 [Sync] Categorías recibidas: ${ccats.length}`);
      await db.runAsync("DELETE FROM categories");
      for (const c of ccats) {
        await db.runAsync(
          "INSERT INTO categories (id, name, description, order_index) VALUES (?, ?, ?, ?)",
          [c.id, c.name, c.description, c.order_index]
        );
      }
      console.log("💾 [Sync] Categorías guardadas en SQLite.");
    }

    // --- 2. NIVELES ---
    console.log("📥 [Sync] Descargando Niveles...");
    const { data: levels, error: errLvl } = await supabase.from("levels").select("*");
    
    if (errLvl) console.error("❌ [Sync] Error Niveles:", errLvl.message);
    else if (levels) {
      console.log(`📦 [Sync] Niveles recibidos: ${levels.length}`);
      await db.runAsync("DELETE FROM levels");
      for (const l of levels) {
        await db.runAsync(
          "INSERT INTO levels (id, category_id, name, order_index) VALUES (?, ?, ?, ?)",
          [l.id, l.category_id, l.name, l.order_index]
        );
      }
      console.log("💾 [Sync] Niveles guardados en SQLite.");
    }

    // --- 3. CURSOS ---
    console.log("📥 [Sync] Descargando Cursos...");
    const { data: courses, error: errCur } = await supabase.from("courses").select("*");
    
    if (errCur) console.error("❌ [Sync] Error Cursos:", errCur.message);
    else if (courses) {
      console.log(`📦 [Sync] Cursos recibidos: ${courses.length}`);
      await db.runAsync("DELETE FROM courses");
      for (const c of courses) {
        await db.runAsync(
          "INSERT INTO courses (id, title, description, image_url, level_id, order_index) VALUES (?, ?, ?, ?, ?, ?)",
          [c.id, c.title, c.description, c.cover_image_url, c.level_id, c.order_index] // Asegúrate de incluir order_index aquí
        );
      }
      console.log("💾 [Sync] Cursos guardados en SQLite.");
    }

    // --- 4. LECCIONES ---
    console.log("📥 [Sync] Descargando Lecciones...");
    const { data: lessons, error: errLes } = await supabase.from("lessons").select("*");
    
    if (errLes) console.error("❌ [Sync] Error Lecciones:", errLes.message);
    else if (lessons) {
      console.log(`📦 [Sync] Lecciones recibidas: ${lessons.length}`);
      await db.runAsync("DELETE FROM lessons");
      for (const l of lessons) {
        // Log individual para ver si llegan los datos correctos
        // console.log(`   -> Guardando lección: ${l.title} (Img: ${l.image_url ? 'Sí' : 'No'})`);
        await db.runAsync(
          "INSERT INTO lessons (id, course_id, title, content_url, image_url, spanish_text, lsm_text_code, type, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
          [
            l.id,
            l.course_id,
            l.title,
            l.content_url,
            l.image_url,
            l.spanish_text,
            l.lsm_text_code,
            l.type,
            l.order_index,
          ],
        );
      }
      console.log("💾 [Sync] Lecciones guardadas en SQLite.");
    }

    // --- 5. PREGUNTAS (QUIZ) ---
    console.log("📥 [Sync] Descargando Preguntas...");
    const { data: quiz, error: quizError } = await supabase.from("quiz_questions").select("*");

    if (quizError) {
      console.error("❌ [Sync] Error Preguntas:", quizError.message);
    } else if (quiz) {
      console.log(`📦 [Sync] Preguntas recibidas: ${quiz.length}`);
      await db.runAsync("DELETE FROM quiz_questions");

      for (const q of quiz) {
        let optionsString = q.options;
        if (typeof q.options === "object") {
          optionsString = JSON.stringify(q.options);
        }

        await db.runAsync(
          "INSERT INTO quiz_questions (id, course_id, question_text, media_url, options, correct_answer) VALUES (?, ?, ?, ?, ?, ?)",
          [q.id, q.course_id, q.question_text, q.media_url, optionsString, q.correct_answer]
        );
      }
      console.log("💾 [Sync] Preguntas guardadas en SQLite.");
    }

    // --- 6. DICCIONARIO ---
    console.log("📥 [Sync] Descargando Diccionario (Categorías)...");
    const { data: cats, error: errDictCat } = await supabase.from("dictionary_categories").select("*");
    
    if(errDictCat) console.error("❌ [Sync] Error Diccionario Cats:", errDictCat.message);
    else if (cats) {
      await db.runAsync("DELETE FROM dictionary_categories");
      for (const c of cats) {
        await db.runAsync(
          "INSERT INTO dictionary_categories (id, name, image_url) VALUES (?, ?, ?)",
          [c.id, c.name, c.image_url]
        );
      }
      console.log(`💾 [Sync] ${cats.length} Categorías de Diccionario guardadas.`);
    }

    console.log("📥 [Sync] Descargando Diccionario (Palabras)...");
    const { data: words, error: errWords } = await supabase.from("dictionary_entries").select("*");
    
    if(errWords) console.error("❌ [Sync] Error Diccionario Words:", errWords.message);
    else if (words) {
      await db.runAsync("DELETE FROM dictionary_entries");
      for (const w of words) {
        await db.runAsync(
          "INSERT INTO dictionary_entries (id, category_id, word, media_url, media_type) VALUES (?, ?, ?, ?, ?)",
          [w.id, w.category_id, w.word, w.media_url, w.media_type]
        );
      }
      console.log(`💾 [Sync] ${words.length} Palabras guardadas en SQLite.`);
    }

    console.log("✅ [Sync] Sincronización GENERAL completada con éxito.");

    // --- 7. PROGRESO DE USUARIO ---
    if (userId) {
      console.log(`👤 [Sync] Sincronizando progreso para usuario: ${userId}...`);
      const { data: progress } = await supabase
        .from("user_progress")
        .select("*")
        .eq("user_id", userId);

      if (progress) {
        await db.runAsync("DELETE FROM user_progress WHERE user_id = ?", [userId]);
        for (const p of progress) {
          await db.runAsync(
            `INSERT INTO user_progress (id, user_id, course_id, is_completed, quiz_score, last_accessed_at) 
             VALUES (?, ?, ?, ?, ?, ?)`,
            [p.id, p.user_id, p.course_id, p.is_completed ? 1 : 0, p.quiz_score, p.last_accessed_at]
          );
        }
        console.log(`💾 [Sync] ${progress.length} registros de progreso sincronizados.`);
      }
    }

  } catch (error) {
    console.error("❌❌❌ [Sync] Error CRÍTICO en la sincronización:", error);
  }
};