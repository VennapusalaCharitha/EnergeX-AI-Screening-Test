import React, { useState, useEffect } from 'react';
import { Post } from '../types';
import { postsAPI } from '../services/api';
import { io } from 'socket.io-client';

interface PostListProps {
  onCreatePost: () => void;
}

const PostList: React.FC<PostListProps> = ({ onCreatePost }) => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [cached, setCached] = useState(false);

  useEffect(() => {
    fetchPosts();
    
    // WebSocket connection for live updates
    const socket = io('http://localhost:3001');
    
    socket.on('newPost', (newPost: Post) => {
      setPosts(prevPosts => [newPost, ...prevPosts]);
    });
    
    socket.on('postDeleted', (postId: number) => {
      setPosts(prevPosts => prevPosts.filter(post => post.id !== postId));
    });
    
    return () => {
      socket.disconnect();
    };
  }, []);

  const fetchPosts = async () => {
    try {
      const response = await postsAPI.getPosts();
      setPosts(response.posts || []);
      setCached(response.cached || false);
    } catch (error) {
      console.error('Error fetching posts:', error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (window.confirm('Are you sure you want to delete this post?')) {
      try {
        console.log('Attempting to delete post:', id);
        const response = await postsAPI.deletePost(id);
        console.log('Delete response:', response);
        
        // Remove from local state immediately
        setPosts(posts.filter(post => post.id !== id));
        
        // Also refresh from server to ensure consistency
        setTimeout(async () => {
          await fetchPosts();
        }, 500);
        
        alert('Post deleted successfully!');
      } catch (error) {
        console.error('Error deleting post:', error);
        alert('Failed to delete post. Please try again.');
        // Refresh posts to show current state
        await fetchPosts();
      }
    }
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading posts...</div>;
  }

  return (
    <div style={{ maxWidth: '800px', margin: '0 auto', padding: '20px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Posts {cached && <span style={{ color: '#28a745', fontSize: '14px' }}>(Cached)</span>}</h2>
        <button
          onClick={onCreatePost}
          style={{
            padding: '10px 20px',
            backgroundColor: '#28a745',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer'
          }}
        >
          Create Post
        </button>
      </div>

      {posts.length === 0 ? (
        <p>No posts available. Create your first post!</p>
      ) : (
        <div>
          {posts.map((post) => (
            <div
              key={post.id}
              style={{
                border: '1px solid #ddd',
                borderRadius: '8px',
                padding: '20px',
                marginBottom: '15px',
                backgroundColor: '#f9f9f9'
              }}
            >
              <h3 style={{ margin: '0 0 10px 0' }}>{post.title}</h3>
              <p style={{ margin: '0 0 10px 0', color: '#666' }}>
                By: {post.user?.name || post.user_name} | 
                {new Date(post.created_at).toLocaleDateString()}
              </p>
              <p style={{ margin: '0 0 15px 0' }}>{post.content}</p>
              
              {/* Show delete button only for current user's posts */}
              {JSON.parse(localStorage.getItem('user') || '{}').id === post.user_id && (
                <button
                  onClick={() => handleDelete(post.id)}
                  style={{
                    padding: '5px 10px',
                    backgroundColor: '#dc3545',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor: 'pointer',
                    fontSize: '12px'
                  }}
                >
                  Delete
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default PostList;