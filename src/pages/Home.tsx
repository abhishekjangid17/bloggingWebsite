import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
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

export function Home() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchPosts() {
      const { data, error } = await supabase
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
        .eq('published', true)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPosts(data);
      }
      setLoading(false);
    }

    fetchPosts();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="space-y-8">
      {posts.map((post) => (
        <article key={post.id} className="bg-white rounded-lg shadow-sm p-6">
          <Link to={`/post/${post.id}`}>
            <h2 className="text-2xl font-bold text-gray-900 mb-2">{post.title}</h2>
          </Link>
          <div className="flex items-center space-x-2 text-sm text-gray-500 mb-4">
            <span>{post.profiles.username}</span>
            <span>•</span>
            <time>{format(new Date(post.created_at), 'MMM d, yyyy')}</time>
          </div>
          <p className="text-gray-600 line-clamp-3">{post.content}</p>
          <Link
            to={`/post/${post.id}`}
            className="inline-block mt-4 text-indigo-600 hover:text-indigo-500"
          >
            Read more →
          </Link>
        </article>
      ))}
    </div>
  );
}