import React, { createContext, useState, useContext, useEffect } from 'react';
import { io } from 'socket.io-client';
import api from '../config/api';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

const SOCKET_URL = import.meta.env.VITE_SOCKET_URL || 'http://localhost:5000';

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [socket, setSocket] = useState(null);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [unreadChatCount, setUnreadChatCount] = useState(0);

  // Initialize Socket.io
  useEffect(() => {
    const newSocket = io(SOCKET_URL);
    setSocket(newSocket);

    newSocket.on('connect', () => {
      console.log('✅ Connected to server');
    });

    newSocket.on('disconnect', () => {
      console.log('❌ Disconnected from server');
    });

    // Real-time listeners
    newSocket.on('new-post', (post) => {
      console.log('📬 New post received:', post);
      setPosts(prev => [post, ...prev]);
    });

    newSocket.on('post-liked', (updatedPost) => {
      setPosts(prev => prev.map(p => 
        (p._id || p.id) === (updatedPost._id || updatedPost.id) ? updatedPost : p
      ));
    });

    newSocket.on('post-updated', (updatedPost) => {
      setPosts(prev => prev.map(p => 
        (p._id || p.id) === (updatedPost._id || updatedPost.id) ? updatedPost : p
      ));
    });

    newSocket.on('new-comment', (updatedPost) => {
      setPosts(prev => prev.map(p => 
        (p._id || p.id) === (updatedPost._id || updatedPost.id) ? updatedPost : p
      ));
    });

    newSocket.on('post-deleted', (postId) => {
      setPosts(prev => prev.filter(p => (p._id || p.id) !== postId));
    });

    // Online users tracking
    newSocket.on('online-users', (userIds) => {
      setOnlineUsers(userIds);
    });

    // Chat message — update unread count
    newSocket.on('chat-message', () => {
      loadUnreadCount();
    });

    return () => newSocket.close();
  }, []);

  // Emit user-online when currentUser changes
  useEffect(() => {
    if (socket && currentUser) {
      socket.emit('user-online', currentUser.id);
      loadUnreadCount();
    }
  }, [socket, currentUser]);

  // Load initial data
  useEffect(() => {
    loadInitialData();
  }, []);

  const loadUnreadCount = async () => {
    try {
      const res = await api.get('/chat/unread-count');
      setUnreadChatCount(res.data.count);
    } catch {
      // silently fail
    }
  };

  const loadInitialData = async () => {
    try {
      setLoading(true);
      
      // Check for saved user
      const savedUser = localStorage.getItem('currentUser');
      if (savedUser) {
        setCurrentUser(JSON.parse(savedUser));
      }

      // Load users
      try {
        const usersRes = await api.get('/users');
        setUsers(usersRes.data);
      } catch (err) {
        console.log('Users endpoint not available yet');
        setUsers([]);
      }

      // Load posts
      try {
        const postsRes = await api.get('/posts');
        setPosts(postsRes.data);
      } catch (err) {
        console.log('Posts endpoint not available yet');
        setPosts([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      
      return true;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const signup = async (name, email, password, role = 'student') => {
    try {
      const response = await api.post('/auth/register', { name, email, password, role });
      const { token, user } = response.data;
      
      localStorage.setItem('token', token);
      localStorage.setItem('currentUser', JSON.stringify(user));
      setCurrentUser(user);
      
      return true;
    } catch (error) {
      console.error('Signup error:', error);
      return false;
    }
  };

  const logout = () => {
    setCurrentUser(null);
    setUnreadChatCount(0);
    localStorage.removeItem('token');
    localStorage.removeItem('currentUser');
  };

  const createPost = async (postData) => {
    try {
      const response = await api.post('/posts', {
        ...postData,
        userId: currentUser.id
      });
      return response.data;
    } catch (error) {
      console.error('Create post error:', error);
      throw error;
    }
  };

  const likePost = async (postId) => {
    if (!currentUser) return;
    try {
      await api.put(`/posts/${postId}/like`, {
        userId: currentUser.id
      });
    } catch (error) {
      console.error('Like post error:', error);
    }
  };

  const addComment = async (postId, content) => {
    if (!currentUser) return;
    try {
      await api.post(`/posts/${postId}/comment`, {
        userId: currentUser.id,
        content
      });
    } catch (error) {
      console.error('Add comment error:', error);
    }
  };

  const getUserById = (userId) => {
    if (!userId) return null;
    const user = users.find(u => (u._id || u.id) === userId || u._id === userId || u.id === userId);
    return user || currentUser;
  };

  const getPostById = (postId) => {
    return posts.find(p => (p._id || p.id) === postId);
  };

  const joinPostRoom = (postId) => {
    if (socket) {
      socket.emit('join-post', postId);
    }
  };

  const leavePostRoom = (postId) => {
    if (socket) {
      socket.emit('leave-post', postId);
    }
  };

  const value = {
    currentUser,
    users,
    posts,
    loading,
    socket,
    onlineUsers,
    unreadChatCount,
    login,
    signup,
    logout,
    createPost,
    likePost,
    addComment,
    getUserById,
    getPostById,
    joinPostRoom,
    leavePostRoom,
    refreshPosts: loadInitialData,
    loadUnreadCount,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};