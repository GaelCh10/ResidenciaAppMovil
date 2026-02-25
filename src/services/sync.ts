import { supabase } from "@/src/lib/supabase";
import NetInfo from "@react-native-community/netinfo";
import { getDB } from "./db";

const db = getDB();

export const sincronizarDatos = async (userId?: string) => {
  console.log("Iniciando ciclo de sincronización...");
  
  const state = await NetInfo.fetch();
  if (!state.isConnected) {
    console.log("Sin internet. Operando 100% Offline.");
    return;
  }

  console.log("Conexión detectada.");

  try {
    if (userId) {
      console.log("progreso local para subir.");
      const localProgress = await db.getAllAsync(
        "SELECT * FROM user_progress WHERE user_id = ?",
        [userId]
      );

      if (localProgress.length > 0) {
        console.log(` Encontrados ${localProgress.length} progresos locales para sincronizar`);
        const datosParaSubir = localProgress.map((row: any) => ({
          id: row.id, 
          user_id: row.user_id,
          course_id: row.course_id,
          is_completed: row.is_completed === 1, 
          quiz_score: row.quiz_score,
          last_accessed_at: new Date().toISOString() 
        }));

        const { error: pushError } = await supabase
          .from('user_progress')
          .upsert(datosParaSubir, { onConflict: 'user_id, course_id' });

        if (pushError) {
          console.error("rror subiendo progreso:", pushError.message);
        } else {
          console.log("Progreso subido exitosamente a la nube.");
        }
      } else {
        console.log("No hay progreso local para subir.");
      }
    }

    console.log("Iniciando descarga de contenido...");
    const syncTable = async (tableName: string, query: string, insertQuery: string, paramsMapper: (item: any) => any[]) => {
        const { data, error } = await query as any;
        if (error) {
            console.error(`Error en ${tableName}:`, error.message);
            return;
        }
        
        if (data && data.length > 0) {
            await db.runAsync(`DELETE FROM ${tableName}`); // Limpieza
            for (const item of data) {
                await db.runAsync(insertQuery, paramsMapper(item));
            }
        }
    };

    // 1. Categorías
    await syncTable(
        'categories', 
        supabase.from("categories").select("*"),
        "INSERT INTO categories (id, name, description, order_index) VALUES (?, ?, ?, ?)",
        (c) => [c.id, c.name, c.description, c.order_index]
    );

    // 2. Niveles
    await syncTable(
        'levels', 
        supabase.from("levels").select("*"),
        "INSERT INTO levels (id, category_id, name, order_index) VALUES (?, ?, ?, ?)",
        (l) => [l.id, l.category_id, l.name, l.order_index]
    );

    // 3. Cursos
    await syncTable(
        'courses', 
        supabase.from("courses").select("*"),
        "INSERT INTO courses (id, title, description, image_url, level_id, order_index) VALUES (?, ?, ?, ?, ?, ?)",
        (c) => [c.id, c.title, c.description, c.cover_image_url, c.level_id, c.order_index]
    );

    // 4. Lecciones
    await syncTable(
        'lessons', 
        supabase.from("lessons").select("*"),
        "INSERT INTO lessons (id, course_id, title, content_url, image_url, spanish_text, lsm_text_code, type, order_index) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)",
        (l) => [l.id, l.course_id, l.title, l.content_url, l.image_url, l.spanish_text, l.lsm_text_code, l.type, l.order_index]
    );

    // 5. Preguntas
    const { data: quiz } = await supabase.from("quiz_questions").select("*");
    if (quiz && quiz.length > 0) {
        await db.runAsync("DELETE FROM quiz_questions");
        for (const q of quiz) {
            const opts = typeof q.options === 'string' ? q.options : JSON.stringify(q.options);
            await db.runAsync(
                "INSERT INTO quiz_questions (id, course_id, question_text, media_url, options, correct_answer, question_type) VALUES (?, ?, ?, ?, ?, ?, ?)",
                [q.id, q.course_id, q.question_text, q.media_url, opts, q.correct_answer, q.question_type]
            );
        }
    }

    // 6. Diccionario
    await syncTable(
        'dictionary_categories',
        supabase.from("dictionary_categories").select("*"),
        "INSERT INTO dictionary_categories (id, name, image_url) VALUES (?, ?, ?)",
        (c) => [c.id, c.name, c.image_url]
    );

    await syncTable(
        'dictionary_entries',
        supabase.from("dictionary_entries").select("*"),
        "INSERT INTO dictionary_entries (id, category_id, word, media_url, media_type) VALUES (?, ?, ?, ?, ?)",
        (w) => [w.id, w.category_id, w.word, w.media_url, w.media_type]
    );


    if (userId) {

        const { data: progress } = await supabase
            .from("user_progress")
            .select("*")
            .eq("user_id", userId);

        if (progress && progress.length > 0) {
            await db.runAsync("DELETE FROM user_progress WHERE user_id = ?", [userId]);
            for (const p of progress) {
                await db.runAsync(
                    `INSERT INTO user_progress (id, user_id, course_id, is_completed, quiz_score, last_accessed_at) 
                     VALUES (?, ?, ?, ?, ?, ?)`,
                    [p.id, p.user_id, p.course_id, p.is_completed ? 1 : 0, p.quiz_score, p.last_accessed_at]
                );
            }
        }
    }

    console.log("sincronizacion completa");

  } catch (error) {
    console.error("error de sincronización", error);
  }
};