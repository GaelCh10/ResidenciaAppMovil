import { useEffect, useState } from 'react';
import { getDB } from '../services/db';
import { sincronizarDatos } from '../services/sync';

const db = getDB();

// 1. Hook para CATEGORÍAS con NIVELES (Para cursos/index.tsx)
export const useCategoriasOffline = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Intentamos sincronizar (bajar cambios nuevos) en segundo plano
      sincronizarDatos().then(() => fetchLocal()); 
      await fetchLocal(); // Cargamos lo local inmediatamente
    };
    load();
  }, []);

  const fetchLocal = async () => {
    try {
      // Necesitamos unir Categorias y Niveles manualmente
      const cats = await db.getAllAsync('SELECT * FROM categories ORDER BY order_index');
      const levels = await db.getAllAsync('SELECT * FROM levels ORDER BY order_index');

      // Reconstruimos la jerarquía (Categoría tiene array de Levels)
      const categoriasFormateadas = cats.map((c: any) => ({
        ...c,
        levels: levels.filter((l: any) => l.category_id === c.id)
      }));

      setData(categoriasFormateadas);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  return { data, loading };
};

// 2. Hook para CURSOS por Nivel (Para cursos/categoria/[id].tsx)
export const useCursosOffline = (levelId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Como ya sincronizamos en el index, aquí solo leemos, 
      // pero por seguridad podríamos llamar a sync si quisiéramos.
      const result = await db.getAllAsync(
        'SELECT * FROM courses WHERE level_id = ? ORDER BY order_index', 
        [levelId]
      );
      setData(result);
      setLoading(false);
    };
    if (levelId) load();
  }, [levelId]);

  return { data, loading };
};

// 3. Hook para LECCIONES (Para cursos/curso/tema/[id].tsx)
export const useLeccionesOffline = (courseId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await db.getAllAsync(
        'SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC', 
        [courseId]
      );
      setData(result);
      setLoading(false);
    };
    if (courseId) load();
  }, [courseId]);

  return { data, loading };
};

// 4. Hook para PREGUNTAS (Para cursos/curso/evaluacion/[id].tsx)
export const usePreguntasOffline = (courseId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const rawQuestions = await db.getAllAsync(
        'SELECT * FROM quiz_questions WHERE course_id = ?', 
        [courseId]
      );

      // IMPORTANTE: SQLite guarda arrays como texto string. Hay que hacer JSON.parse
      const preguntasFormateadas = rawQuestions.map((q: any) => ({
        ...q,
        options: typeof q.options === 'string' ? JSON.parse(q.options) : q.options
      }));

      setData(preguntasFormateadas);
      setLoading(false);
    };
    if (courseId) load();
  }, [courseId]);

  return { data, loading };
};

// 5. Hook para CATEGORÍAS DEL DICCIONARIO
export const useDiccionarioCategoriasOffline = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      // Intentamos sincronizar todo (Cursos y Diccionario se sincronizan juntos en sync.ts)
      sincronizarDatos().then(() => fetchLocal());
      await fetchLocal();
    };
    load();
  }, []);

  const fetchLocal = async () => {
    try {
      const result = await db.getAllAsync('SELECT * FROM dictionary_categories ORDER BY name ASC');
      setData(result);
    } catch (e) { console.error(e); } 
    finally { setLoading(false); }
  };

  return { data, loading };
};

// 6. Hook para PALABRAS POR CATEGORÍA
export const useDiccionarioPalabrasOffline = (categoryId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const result = await db.getAllAsync(
        'SELECT * FROM dictionary_entries WHERE category_id = ? ORDER BY word ASC', 
        [categoryId]
      );
      setData(result);
      setLoading(false);
    };
    if (categoryId) load();
  }, [categoryId]);

  return { data, loading };
};

// 7. PODER PARA EL TRADUCTOR (Buscar palabra por texto)
export const buscarPalabraOffline = async (texto: string) => {
  try {
    const db = getDB();
    // Buscamos palabras que coincidan (insensible a mayúsculas/minúsculas)
    const result = await db.getAllAsync(
      `SELECT * FROM dictionary_entries WHERE word LIKE ? LIMIT 5`,
      [`%${texto}%`]
    );
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
};

// 8. PODER PARA LOS JUEGOS (Obtener palabras aleatorias)
// Útil para: Memorama, Adivina la Seña, Quiz de Vocabulario
export const getPalabrasAleatoriasOffline = async (cantidad: number = 4) => {
  try {
    const db = getDB();
    // ORDER BY RANDOM() es nativo de SQLite y muy rápido
    const result = await db.getAllAsync(
      `SELECT * FROM dictionary_entries ORDER BY RANDOM() LIMIT ?`,
      [cantidad]
    );
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
};