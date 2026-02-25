import { useEffect, useState } from "react";
import { getDB } from "../services/db";
import { sincronizarDatos } from "../services/sync";

const db = getDB();


export const useCategoriasOffline = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      sincronizarDatos().then(() => fetchLocal());
      await fetchLocal(); 
    };
    load();
  }, []);

  const fetchLocal = async () => {
    try {
      const cats = await db.getAllAsync(
        "SELECT * FROM categories ORDER BY order_index",
      );
      const levels = await db.getAllAsync(
        "SELECT * FROM levels ORDER BY order_index",
      );

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


export const useCursosOffline = (levelId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {

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


export const usePreguntasOffline = (courseId: string) => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      const rawQuestions = await db.getAllAsync(
        "SELECT * FROM quiz_questions WHERE course_id = ?",
        [courseId],
      );

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

export const useDiccionarioCategoriasOffline = () => {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {

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

export const buscarPalabraOffline = async (texto: string) => {
  try {
    const db = getDB();
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


export const getPalabrasAleatoriasOffline = async (cantidad: number = 4) => {
  try {
    const db = getDB();
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


export const getPalabrasJuegoOffline = async (
  categoryId: string,
  cantidad: number,
) => {
  try {
    const db = getDB();
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


      const categorias = await db.getAllAsync(
        "SELECT * FROM categories ORDER BY order_index",
      );
      const niveles = await db.getAllAsync(
        "SELECT * FROM levels ORDER BY order_index",
      );
      const cursos = await db.getAllAsync("SELECT * FROM courses");

      const progreso = await db.getAllAsync(
        "SELECT * FROM user_progress WHERE user_id = ?",
        [userId],
      );


      const progresoMap = new Map();
      progreso.forEach((p: any) => progresoMap.set(p.course_id, p));


      let totalCursosApp = 0;
      let totalCompletadosApp = 0;
      let sumaScores = 0;
      //arbol de datos: categorias > niveles > cursos con progreso
      const datosProcesados = categorias.map((cat: any) => {
        const nivelesDeCat = niveles.filter(
          (n: any) => n.category_id === cat.id,
        );

        const nivelesProcesados = nivelesDeCat.map((niv: any) => {
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
          totalCat > 0 ? Math.round((complCat / totalCat) * 10) : 0;

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
