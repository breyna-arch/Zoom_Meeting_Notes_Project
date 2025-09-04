import React, { createContext, useContext, useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Check if user is authenticated on mount
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await api.get('/auth/me', { withCredentials: true });
        if (response.data.isAuthenticated) {
          setCurrentUser(response.data.user);
          setIsAuthenticated(true);
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  // Login with Zoom
  const loginWithZoom = () => {
    window.location.href = `${process.env.REACT_APP_API_URL}/auth/zoom`;
  };

  // Logout
  const logout = async () => {
    try {
      await api.post('/auth/logout', {}, { withCredentials: true });
      setCurrentUser(null);
      setIsAuthenticated(false);
      navigate('/login');
    } catch (error) {
      console.error('Logout failed:', error);
      setError(error.message);
    }
  };

  // API instance with interceptors
  const api = axios.create({
    baseURL: `${process.env.REACT_APP_API_URL}/api`,
    withCredentials: true,
  });

  // Add a request interceptor to handle token refresh
  api.interceptors.response.use(
    (response) => response,
    async (error) => {
      const originalRequest = error.config;

      // If the error status is 401 and we haven't tried to refresh yet
      if (error.response?.status === 401 && !originalRequest._retry) {
        originalRequest._retry = true;

        try {
          // Try to refresh the token
          await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/check-token`, {
            withCredentials: true,
          });
          
          // Retry the original request with the new token
          return api(originalRequest);
        } catch (refreshError) {
          // If refresh fails, log the user out
          console.error('Token refresh failed:', refreshError);
          logout();
          return Promise.reject(refreshError);
        }
      }

      return Promise.reject(error);
    }
  );

  const value = {
    currentUser,
    isAuthenticated,
    loading,
    error,
    loginWithZoom,
    logout,
    api,
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
