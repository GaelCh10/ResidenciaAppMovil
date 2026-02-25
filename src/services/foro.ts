import { supabase } from '../lib/supabase';

export interface Post {
  id: string;
  user_id: string;
  content: string;
  likes_count: number;
  created_at: string;
  profiles: { full_name: string; avatar_url: string };
  user_has_liked: boolean; 
}

export const obtenerPosts = async () => {
  const { data: { session } } = await supabase.auth.getSession();
  const currentUserId = session?.user.id;
  const { data, error } = await supabase
    .from('posts')
    .select(`
      *,
      profiles!posts_author_fkey (full_name, avatar_url),
      post_likes!post_likes_post_fkey (user_id)
    `)
    .order('created_at', { ascending: false });

  if (error) {
    console.error("Error detallado obteniendo posts:", error);
    throw error;
  }

  const postsFormateados = data.map((post: any) => ({
    ...post,
    user_has_liked: post.post_likes.some((like: any) => like.user_id === currentUserId)
  }));

  return postsFormateados as Post[];
};

export const crearPost = async (content: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión");

  const { error } = await supabase
    .from('posts')
    .insert({ user_id: session.user.id, content });

  if (error) throw error;
};

export const toggleLike = async (postId: string, yaDioLike: boolean) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) return;
  const userId = session.user.id;

  if (yaDioLike) {
    await supabase.from('post_likes').delete().eq('post_id', postId).eq('user_id', userId);
    await supabase.rpc('decrement_likes', { post_id: postId }); 
  } else {
    await supabase.from('post_likes').insert({ post_id: postId, user_id: userId });
    await supabase.rpc('increment_likes', { post_id: postId });
  }
};

export interface Comment {
  id: string;
  post_id: string;
  user_id: string;
  content: string;
  created_at: string;
  profiles: { full_name: string; avatar_url: string };
}

export const obtenerComentarios = async (postId: string) => {
  const { data, error } = await supabase
    .from('post_comments')
    .select(`
      *,
      profiles!post_comments_author_fkey (full_name, avatar_url)
    `)
    .eq('post_id', postId)
    .order('created_at', { ascending: true }); 

  if (error) throw error;
  return data as Comment[];
};

export const enviarComentario = async (postId: string, content: string) => {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session) throw new Error("No hay sesión activa");

  const { error } = await supabase
    .from('post_comments')
    .insert({
      post_id: postId,
      user_id: session.user.id,
      content: content
    });

  if (error) throw error;
};