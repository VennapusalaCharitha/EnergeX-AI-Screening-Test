import React, { useState, useEffect } from 'react';
import Auth from './components/Auth';
import PostList from './components/PostList';
import CreatePost from './components/CreatePost';
import { authAPI } from './services/api';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showCreatePost, setShowCreatePost] = useState(false);
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshKey, setRefreshKey] = useState(0);

  useEffect(() => {
    const token = localStorage.getItem('token');
    const userData = localStorage.getItem('user');
    
    if (token && userData) {
      setIsAuthenticated(true);
      setUser(JSON.parse(userData));
    }
    setLoading(false);
  }, []);

  const handleLogin = (token: string) => {
    setIsAuthenticated(true);
    const userData = localStorage.getItem('user');
    if (userData) {
      setUser(JSON.parse(userData));
    }
  };

  const handleLogout = async () => {
    try {
      await authAPI.logout();
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      setIsAuthenticated(false);
      setUser(null);
      setShowCreatePost(false);
    }
  };

  const handlePostCreated = () => {
    setShowCreatePost(false);
    // Force refresh by updating a key
    setRefreshKey(Date.now());
  };

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '50px' }}>
        Loading...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Auth onLogin={handleLogin} />;
  }

  return (
    <div>
      {/* Header */}
      <header style={{
        backgroundColor: '#007bff',
        color: 'white',
        padding: '15px 20px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <h1 style={{ margin: 0 }}>EnergeX Posts</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '15px' }}>
          <span>Welcome, {user?.name}!</span>
          <button
            onClick={handleLogout}
            style={{
              padding: '8px 16px',
              backgroundColor: '#dc3545',
              color: 'white',
              border: 'none',
              borderRadius: '4px',
              cursor: 'pointer'
            }}
          >
            Logout
          </button>
        </div>
      </header>

      {/* Main Content */}
      <main>
        {showCreatePost ? (
          <CreatePost
            onPostCreated={handlePostCreated}
            onCancel={() => setShowCreatePost(false)}
          />
        ) : (
          <PostList 
            key={refreshKey}
            onCreatePost={() => setShowCreatePost(true)} 
          />
        )}
      </main>
    </div>
  );
}

export default App;