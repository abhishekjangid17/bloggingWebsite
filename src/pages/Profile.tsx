import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { format } from 'date-fns';

interface Profile {
  username: string;
  full_name: string;
  avatar_url: string | null;
}

interface Post {
  id: string;
  title: string;
  created_at: string;
  published: boolean;
}

export function Profile() {
  const { id } = useParams<{ id: string }>();
  const [profile, setProfile] = useState<Profile | null>(null);
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchProfileAndPosts() {
      if (!id) return;

      try {
        // Fetch profile
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('username, full_name, avatar_url')
          .eq('id', id)
          .single();

        if (profileError) throw profileError;
        setProfile(profileData);

        // Fetch posts
        const { data: postsData, error: postsError } = await supabase
          .from('posts')
          .select('id, title, created_at, published')
          .eq('author_id', id)
          .order('created_at', { ascending: false });

        if (postsError) throw postsError;
        setPosts(postsData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    }

    fetchProfileAndPosts();
  }, [id]);

  if (loading) return <div>Loading...</div>;
  if (error) return <div className="text-red-600">{error}</div>;
  if (!profile) return <div>Profile not found</div>;

  return (
    <div className="max-w-4xl mx-auto">
      <div className="bg-white rounded-lg shadow-sm p-6 mb-8">
        <h1 className="text-3xl font-bold mb-2">{profile.full_name}</h1>
        <p className="text-gray-600">@{profile.username}</p>
      </div>

      <h2 className="text-2xl font-bold mb-4">Posts</h2>
      <div className="space-y-4">
        {posts.map((post) => (
          <div key={post.id} className="bg-white rounded-lg shadow-sm p-6">
            <Link to={`/post/${post.id}`}>
              <h3 className="text-xl font-semibold mb-2">{post.title}</h3>
            </Link>
            <div className="flex items-center space-x-2 text-sm text-gray-500">
              <time>{format(new Date(post.created_at), 'MMM d, yyyy')}</time>
              {!post.published && (
                <>
                  <span>•</span>
                  <span className="text-yellow-600">Draft</span>
                </>
              )}
            </div>
          </div>
        ))}
        {posts.length === 0 && (
          <p className="text-gray-500">No posts yet.</p>
        )}
      </div>
    </div>
  );
}