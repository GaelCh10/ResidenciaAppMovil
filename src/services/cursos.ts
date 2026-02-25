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
  levels: Nivel[]; // niveles anidados
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
  image_url: string;
  spanish_text: string;
  lsm_text_code: string; 
  order_index: number;
}

export interface Pregunta {
  id: string;
  question_text: string;
  media_url: string | null;
  options: string[]; 
  correct_answer: string;
}

// Función para obtener Categorías con sus Niveles dentro
export const obtenerCategoriasConNiveles = async () => {
  const { data, error } = await supabase
    .from("categories")
    .select("*, levels(*)")
    .order("order_index", { ascending: true }); 

  if (error) {
    console.error("Error obteniendo categorías:", error);
    throw error;
  }

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
    .eq("level_id", nivelId)
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
    .order("order_index", { ascending: true }); 

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
    const nuevoUUID = Crypto.randomUUID();

    // gtardado en local sqlite
    await db.runAsync(
      `
            INSERT OR REPLACE INTO user_progress (id, user_id, course_id, is_completed, quiz_score, last_accessed_at)
            VALUES (
                COALESCE((SELECT id FROM user_progress WHERE user_id = ? AND course_id = ?), ?), 
                ?, ?, 1, ?, ?
            )`,
      [userId, courseId, nuevoUUID, userId, courseId, score, timestamp], 
    );
    console.log("Progreso guardado localmente");

    // guardado en Supabase (si hay conexión)
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
      else console.log("Progreso sincronizado");
    }
  } catch (e) {
    console.error("Error guardando progreso:", e);
  }
};
