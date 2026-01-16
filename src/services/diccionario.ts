import { supabase } from '../lib/supabase';

export interface CategoriaDiccionario {
  id: string;
  name: string;
  image_url: string | null;
}

export interface EntradaDiccionario {
  id: string;
  word: string;
  media_url: string;
  media_type: 'video' | 'image';
  definition?: string;
}

// 1. Obtener todas las categorías
export const obtenerCategoriasDiccionario = async () => {
  const { data, error } = await supabase
    .from('dictionary_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as CategoriaDiccionario[];
};

// 2. Obtener palabras de una categoría específica
export const obtenerPalabrasPorCategoria = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('dictionary_entries')
    .select('*')
    .eq('category_id', categoryId)
    .order('word', { ascending: true }); // Orden alfabético

  if (error) throw error;
  return data as EntradaDiccionario[];
};