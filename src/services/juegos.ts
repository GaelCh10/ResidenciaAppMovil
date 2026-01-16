import { supabase } from '../lib/supabase';
import { EntradaDiccionario } from './diccionario';

// Función para obtener palabras aleatorias para el Memorama
export const obtenerPalabrasMemorama = async (categoryId: string, cantidadPares: number = 6) => {
  const { data, error } = await supabase
    .from('dictionary_entries')
    .select('*')
    .eq('category_id', categoryId);

  if (error) throw error;

  if (!data || data.length < cantidadPares) {
    // Si hay muy pocas palabras, devolvemos lo que haya
    return barajarArray(data || []) as EntradaDiccionario[];
  }

  // Barajamos todo el diccionario y tomamos solo las necesarias (ej. 6)
  const barajadas = barajarArray(data);
  return barajadas.slice(0, cantidadPares) as EntradaDiccionario[];
};

// Función auxiliar para desordenar (Fisher-Yates Shuffle)
const barajarArray = (array: any[]) => {
  let currentIndex = array.length, randomIndex;
  while (currentIndex !== 0) {
    randomIndex = Math.floor(Math.random() * currentIndex);
    currentIndex--;
    [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
  }
  return array;
};