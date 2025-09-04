import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import Box from '@mui/material/Box';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Dashboard from './pages/Dashboard';
import Meeting from './pages/Meeting';
import Login from './pages/Login';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { MeetingProvider } from './contexts/MeetingContext';

// Create a theme instance
const theme = createTheme({
  palette: {
    primary: {
      main: '#2D8CFF',
    },
    secondary: {
      main: '#19857b',
    },
    background: {
      default: '#f5f7fa',
    },
  },
  typography: {
    fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontWeight: 600,
    },
    h2: {
      fontWeight: 600,
    },
    h3: {
      fontWeight: 600,
    },
  },
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          padding: '8px 20px',
        },
      },
    },
  },
});

// Private route component
const PrivateRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>; // Show loading state
  }
  
  return isAuthenticated ? children : <Navigate to="/login" />;
};

function App() {
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [loading, setLoading] = useState(true);

  // Check if user is authenticated on initial load
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/api/auth/me`, {
          withCredentials: true,
        });
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  const authContextValue = {
    isAuthenticated,
    setIsAuthenticated,
    loading,
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider value={authContextValue}>
        <MeetingProvider>
          <Router>
            <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
              <Navbar isDarkMode={isDarkMode} onThemeToggle={() => setIsDarkMode(!isDarkMode)} />
              <Box component="main" sx={{ flexGrow: 1, p: 3, pt: 8 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route
                    path="/dashboard"
                    element={
                      <PrivateRoute>
                        <Dashboard />
                      </PrivateRoute>
                    }
                  />
                  <Route
                    path="/meeting/:meetingId"
                    element={
                      <PrivateRoute>
                        <Meeting />
                      </PrivateRoute>
                    }
                  />
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </Box>
            </Box>
          </Router>
        </MeetingProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
