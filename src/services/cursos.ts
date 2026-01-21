import NetInfo from "@react-native-community/netinfo";
import * as Crypto from "expo-crypto";
import { supabase } from "../lib/supabase";
import { getDB } from "./db";
// Definicion de las interfaces segun la Base de Datos
export interface Nivel {
  id: string;
  name: string;
  category_id: string;
  order_index: number;
}

export interface Categoria {
  id: string;
  name: string;
  description: string;
  order_index: number;
  levels: Nivel[]; // Aquí guardaremos los niveles anidados
}

export interface Curso {
  id: string;
  title: string;
  description: string;
  cover_image_url: string;
  level_id: string;
  order_index: number;
}

export interface Leccion {
  id: string;
  title: string;
  type: "video" | "image" | "none";
  content_url: string; // URL de supabase
  spanish_text: string;
  lsm_text_code: string; // Texto para la fuente lsmvulpy
  order_index: number;
}

export interface Pregunta {
  id: string;
  question_text: string;
  media_url: string | null;
  options: string[]; // Supabase convierte el JSONB automáticamente a arreglo
  correct_answer: string;
}

// Función para obtener Categorías con sus Niveles dentro
export const obtenerCategoriasConNiveles = async () => {
  // Supabase permite hacer "joins" sencillos usando la sintaxis: tabla_hija(*)
  const { data, error } = await supabase
    .from("categories")
    .select("*, levels(*)")
    .order("order_index", { ascending: true }); // Ordenamos las categorías

  if (error) {
    console.error("Error obteniendo categorías:", error);
    throw error;
  }
  // Opcional: Ordenar los niveles dentro de cada categoría (si no vienen ordenados)
  const dataOrdenada = data?.map((cat: any) => ({
    ...cat,
    levels: cat.levels.sort(
      (a: Nivel, b: Nivel) => a.order_index - b.order_index,
    ),
  }));
  return dataOrdenada as Categoria[];
};

export const obtenerCursosPorNivel = async (nivelId: string) => {
  const { data, error } = await supabase
    .from("courses")
    .select("*")
    .eq("level_id", nivelId) // Filtramos donde el nivel coincida
    .order("order_index", { ascending: true });

  if (error) {
    console.error("Error al obtener cursos del nivel:", error);
    throw error;
  }
  return data as Curso[];
};

export const obtenerLeccionesPorCurso = async (cursoId: string) => {
  const { data, error } = await supabase
    .from("lessons")
    .select("*")
    .eq("course_id", cursoId)
    .order("order_index", { ascending: true }); // Importante: ordenamos por secuencia

  if (error) {
    console.error("Error al obtener lecciones:", error);
    throw error;
  }
  return data as Leccion[];
};

export const obtenerPreguntas = async (cursoId: string) => {
  const { data, error } = await supabase
    .from("quiz_questions")
    .select("*")
    .eq("course_id", cursoId);

  if (error) {
    console.error("Error al obtener preguntas:", error);
    throw error;
  }
  return data as Pregunta[];
};

export const guardarProgresoCurso = async (
  userId: string,
  courseId: string,
  score: number,
) => {
  const db = getDB();
  const timestamp = new Date().toISOString();

  try {
    // Generamos el ID usando la librería de Expo
    const nuevoUUID = Crypto.randomUUID(); // <--- 2. USAR ESTO

    // 1. GUARDAR EN LOCAL (SQLite)
    await db.runAsync(
      `
            INSERT OR REPLACE INTO user_progress (id, user_id, course_id, is_completed, quiz_score, last_accessed_at)
            VALUES (
                COALESCE((SELECT id FROM user_progress WHERE user_id = ? AND course_id = ?), ?), 
                ?, ?, 1, ?, ?
            )`,
      [userId, courseId, nuevoUUID, userId, courseId, score, timestamp], // <--- Pasamos la variable aquí
    );
    console.log("✅ Progreso guardado localmente");

    // 2. INTENTAR GUARDAR EN NUBE
    const state = await NetInfo.fetch();
    if (state.isConnected) {
      const { error } = await supabase.from("user_progress").upsert(
        {
          user_id: userId,
          course_id: courseId,
          is_completed: true,
          quiz_score: score,
          last_accessed_at: timestamp,
        },
        { onConflict: "user_id, course_id" },
      );

      if (error) console.error("Error subiendo progreso:", error);
      else console.log("☁️ Progreso sincronizado");
    }
  } catch (e) {
    console.error("Error guardando progreso:", e);
  }
};
