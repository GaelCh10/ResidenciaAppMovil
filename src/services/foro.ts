import { supabase } from '../lib/supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles: { full_name: string; avatar_url: string };
  user_has_liked: boolean; // Campo calculado en el front
}

// 1. Obtener Posts
export const obtenerPosts = async () => {
  // Obtenemos el ID del usuario actual para saber si dio like
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user.id;

  const { data, error } = await supabase
    .from('posts')
    .select(`
  *,
  profiles!posts_user_id_fkey (full_name, avatar_url), 
  post_likes (user_id) 
`)
    .order('created_at', { ascending: false });

  if (error) throw error;

  // Procesamos para añadir la bandera "user_has_liked"
  const postsFormateados = data.map((post: any) => ({
    ...post,
    user_has_liked: post.post_likes.some((like: any) => like.user_id === currentUserId)
  }));

  return postsFormateados as Post[];
};

// 2. Crear Post
export const crearPost = async (content: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión");

  const { error } = await supabase
    .from('posts')
    .insert({ user_id: session.user.id, content });

  if (error) throw error;
};

// 3. Dar / Quitar Like (Toggle)
export const toggleLike = async (postId: string, yaDioLike: boolean) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const userId = session.user.id;

  if (yaDioLike) {
    // Si ya dio like, lo borramos (Dislike)
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    // Decrementamos contador (manualmente por ahora para simpleza)
    await supabase.rpc('decrement_likes', { post_id: postId }); 
  } else {
    // Insertamos like
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    // Incrementamos contador
    await supabase.rpc('increment_likes', { post_id: postId });
  }
};