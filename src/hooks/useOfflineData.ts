import { useEffect, useState } from "react";
import { getDB } from "../services/db";
import { sincronizarDatos } from "../services/sync";

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
      const cats = await db.getAllAsync(
        "SELECT * FROM categories ORDER BY order_index",
      );
      const levels = await db.getAllAsync(
        "SELECT * FROM levels ORDER BY order_index",
      );

      // Reconstruimos la jerarquía (Categoría tiene array de Levels)
      const categoriasFormateadas = cats.map((c: any) => ({
        ...c,
        levels: levels.filter((l: any) => l.category_id === c.id),
      }));

      setData(categoriasFormateadas);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        "SELECT * FROM courses WHERE level_id = ? ORDER BY order_index",
        [levelId],
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
        "SELECT * FROM lessons WHERE course_id = ? ORDER BY order_index ASC",
        [courseId],
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
        "SELECT * FROM quiz_questions WHERE course_id = ?",
        [courseId],
      );

      // IMPORTANTE: SQLite guarda arrays como texto string. Hay que hacer JSON.parse
      const preguntasFormateadas = rawQuestions.map((q: any) => ({
        ...q,
        options:
          typeof q.options === "string" ? JSON.parse(q.options) : q.options,
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
      const result = await db.getAllAsync(
        "SELECT * FROM dictionary_categories ORDER BY name ASC",
      );
      setData(result);
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
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
        "SELECT * FROM dictionary_entries WHERE category_id = ? ORDER BY word ASC",
        [categoryId],
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
      [`%${texto}%`],
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
      [cantidad],
    );
    return result;
  } catch (e) {
    console.error(e);
    return [];
  }
};

// 9. PODER PARA JUEGOS POR CATEGORÍA
export const getPalabrasJuegoOffline = async (
  categoryId: string,
  cantidad: number,
) => {
  try {
    const db = getDB();
    // Seleccionamos palabras de la categoría específica, ordenadas al azar
    const result = await db.getAllAsync(
      `SELECT * FROM dictionary_entries WHERE category_id = ? ORDER BY RANDOM() LIMIT ?`,
      [categoryId, cantidad],
    );
    return result;
  } catch (e) {
    console.error("Error en getPalabrasJuegoOffline:", e);
    return [];
  }
};

// 10. PODER DE ESTADÍSTICAS
export const useAvanceUsuario = (userId: string) => {
  const [estadisticas, setEstadisticas] = useState<any[]>([]);
  const [resumenGeneral, setResumenGeneral] = useState({
    totalCursos: 0,
    completados: 0,
    promedio: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (userId) calcularAvance();
  }, [userId]);

  const calcularAvance = async () => {
    try {
      const db = getDB();

      const progresoRaw = await db.getAllAsync("SELECT * FROM user_progress");
      console.log("DUMP TABLA PROGRESO:", JSON.stringify(progresoRaw, null, 2));

      const progresoUsuario = await db.getAllAsync(
        "SELECT * FROM user_progress WHERE user_id = ?",
        [userId],
      );
      console.log(`Progreso para usuario ${userId}:`, progresoUsuario.length);

      // 1. Obtener estructura base
      const categorias = await db.getAllAsync(
        "SELECT * FROM categories ORDER BY order_index",
      );
      const niveles = await db.getAllAsync(
        "SELECT * FROM levels ORDER BY order_index",
      );
      const cursos = await db.getAllAsync("SELECT * FROM courses");

      // 2. Obtener progreso del usuario
      const progreso = await db.getAllAsync(
        "SELECT * FROM user_progress WHERE user_id = ?",
        [userId],
      );

      // 3. Mapear progreso para búsqueda rápida { course_id: info }
      const progresoMap = new Map();
      progreso.forEach((p: any) => progresoMap.set(p.course_id, p));

      // VARIABLES GLOBALES
      let totalCursosApp = 0;
      let totalCompletadosApp = 0;
      let sumaScores = 0;

      // 4. CONSTRUIR ÁRBOL DE DATOS
      const datosProcesados = categorias.map((cat: any) => {
        // Filtramos niveles de esta categoría
        const nivelesDeCat = niveles.filter(
          (n: any) => n.category_id === cat.id,
        );

        const nivelesProcesados = nivelesDeCat.map((niv: any) => {
          // Filtramos cursos de este nivel
          const cursosDeNivel = cursos.filter(
            (c: any) => c.level_id === niv.id,
          );

          let completadosNivel = 0;

          const cursosConStatus = cursosDeNivel.map((curso: any) => {
            const status = progresoMap.get(curso.id);
            const completado = status?.is_completed === 1;
            const score = status?.quiz_score || 0;

            if (completado) {
              completadosNivel++;
              totalCompletadosApp++;
              sumaScores += score;
            }
            totalCursosApp++;

            return { ...curso, completado, score };
          });

          const porcentajeNivel =
            cursosDeNivel.length > 0
              ? Math.round((completadosNivel / cursosDeNivel.length) * 100)
              : 0;

          return {
            ...niv,
            cursos: cursosConStatus,
            totalCursos: cursosDeNivel.length,
            completados: completadosNivel,
            porcentaje: porcentajeNivel,
          };
        });

        // Calcular porcentaje de la Categoría
        const totalCat = nivelesProcesados.reduce(
          (acc: number, curr: any) => acc + curr.totalCursos,
          0,
        );
        const complCat = nivelesProcesados.reduce(
          (acc: number, curr: any) => acc + curr.completados,
          0,
        );
        const porcCat =
          totalCat > 0 ? Math.round((complCat / totalCat) * 100) : 0;

        return {
          ...cat,
          niveles: nivelesProcesados,
          porcentaje: porcCat,
        };
      });

      setEstadisticas(datosProcesados);
      setResumenGeneral({
        totalCursos: totalCursosApp,
        completados: totalCompletadosApp,
        promedio:
          totalCompletadosApp > 0
            ? Math.round(sumaScores / totalCompletadosApp)
            : 0,
      });
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  return { estadisticas, resumenGeneral, loading, recargar: calcularAvance };
};
