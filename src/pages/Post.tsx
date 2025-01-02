import React, { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Post {
  id: string;
  title: string;
  content: string;
  created_at: string;
  profiles: {
    username: string;
    avatar_url: string | null;
  };
}

export function Post() {
  const { id } = useParams<{ id: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchPost() {
      if (!id) return;

      try {
        const { data, error: fetchError } = await supabase
          .from('posts')
          .select(`
            id,
            title,
            content,
            created_at,
            profiles (
              username,
              avatar_url
            )
          `)
          .eq('id', id)
          .single();

        if (fetchError) throw fetchError;
        if (data) setPost(data);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchPost();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!post) return <div>Post not found</div>;

  return (
    <article className="max-w-4xl mx-auto">
      <h1 className="text-4xl font-bold mb-4">{post.title}</h1>
      <div className="flex items-center space-x-2 text-sm text-gray-500 mb-8">
        <span>{post.profiles.username}</span>
        <span>•</span>
        <time>{format(new Date(post.created_at), 'MMM d, yyyy')}</time>
      </div>
      <div 
        className="prose max-w-none"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    </article>
  );
}