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

export const obtenerCategoriasDiccionario = async () => {
  const { data, error } = await supabase
    .from('dictionary_categories')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return data as CategoriaDiccionario[];
};

export const obtenerPalabrasPorCategoria = async (categoryId: string) => {
  const { data, error } = await supabase
    .from('dictionary_entries')
    .select('*')
    .eq('category_id', categoryId)
    .order('word', { ascending: true }); 

  if (error) throw error;
  return data as EntradaDiccionario[];
};