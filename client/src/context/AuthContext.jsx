import React, { createContext, useContext, useEffect, useState } from 'react';
import axios from 'axios';

const AuthContext = createContext(null);
const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadProfile = async () => {
      const token = localStorage.getItem('token');

      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get('/auth/profile');
        setUser(response.data);
      } catch (error) {
        localStorage.removeItem('token');
        setUser(null);
      } finally {
        setLoading(false);
      }
    };

    loadProfile();
  }, []);

  const persistAuth = (payload) => {
    const { token, ...profile } = payload;
    localStorage.setItem('token', token);
    setUser(profile);
  };

  const getAuthErrorMessage = (error, fallback) => {
    if (error.response?.data?.message) {
      return error.response.data.message;
    }

    if (error.code === 'ERR_NETWORK') {
      return 'http://localhost:5000 серверімен байланысу мүмкін болмады. Бэкендті іске қосып, қайта көріңіз.';
    }

    return fallback;
  };

  const register = async (name, email, password) => {
    try {
      const response = await api.post('/auth/register', { name, email, password });
      persistAuth(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error, 'Тіркелу сәтсіз аяқталды.')
      };
    }
  };

  const login = async (email, password) => {
    try {
      const response = await api.post('/auth/login', { email, password });
      persistAuth(response.data);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error, 'Кіру сәтсіз аяқталды.')
      };
    }
  };

  const updateProfile = async (payload) => {
    try {
      const response = await api.put('/auth/profile', payload);
      setUser(response.data);
      return { success: true, user: response.data };
    } catch (error) {
      return {
        success: false,
        message: getAuthErrorMessage(error, 'Профильді жаңарту сәтсіз аяқталды.')
      };
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setUser(null);
  };

  const value = {
    api,
    user,
    loading,
    register,
    login,
    updateProfile,
    logout
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
