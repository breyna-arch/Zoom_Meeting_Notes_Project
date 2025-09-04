import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, Container, Typography, Paper, CircularProgress, Alert } from '@mui/material';
import { styled } from '@mui/material/styles';
import ZoomInIcon from '@mui/icons-material/ZoomIn';

const LoginContainer = styled(Paper)(({ theme }) => ({
  maxWidth: 500,
  margin: '0 auto',
  padding: theme.spacing(4),
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  marginTop: theme.spacing(8),
}));

const LoginButton = styled(Button)(({ theme }) => ({
  marginTop: theme.spacing(3),
  padding: theme.spacing(1.5),
  textTransform: 'none',
  fontSize: '1rem',
  '& .MuiButton-startIcon': {
    marginRight: theme.spacing(1),
  },
}));

const Login = () => {
  const { loginWithZoom, isAuthenticated, loading } = useAuth();
  const [error, setError] = useState('');
  const [isLoggingIn, setIsLoggingIn] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Check for OAuth errors in URL params
  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const errorParam = params.get('error');
    
    if (errorParam === 'access_denied') {
      setError('You need to grant access to your Zoom account to continue.');
    } else if (errorParam) {
      setError('An error occurred during login. Please try again.');
    }
  }, [location]);

  // Redirect if already authenticated
  useEffect(() => {
    if (isAuthenticated) {
      // Check for redirectTo in location state
      const from = location.state?.from?.pathname || '/dashboard';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, location.state]);

  const handleZoomLogin = async () => {
    try {
      setError('');
      setIsLoggingIn(true);
      await loginWithZoom();
    } catch (error) {
      console.error('Login error:', error);
      setError('Failed to initiate login. Please try again.');
      setIsLoggingIn(false);
    }
  };

  if (loading) {
    return (
      <Box display="flex" justifyContent="center" alignItems="center" minHeight="60vh">
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Container component="main" maxWidth="sm">
      <LoginContainer elevation={3}>
        <Typography component="h1" variant="h4" align="center" gutterBottom>
          Welcome Back
        </Typography>
        
        <Typography variant="body1" color="text.secondary" align="center" sx={{ mb: 3 }}>
          Sign in with your Zoom account to access your meeting notes and recordings.
        </Typography>

        {error && (
          <Alert severity="error" sx={{ width: '100%', mb: 3 }}>
            {error}
          </Alert>
        )}

        <LoginButton
          variant="contained"
          color="primary"
          fullWidth
          onClick={handleZoomLogin}
          disabled={isLoggingIn}
          startIcon={<ZoomInIcon />}
        >
          {isLoggingIn ? 'Redirecting to Zoom...' : 'Continue with Zoom'}
        </LoginButton>

        <Box mt={4} textAlign="center">
          <Typography variant="body2" color="text.secondary">
            By signing in, you agree to our Terms of Service and Privacy Policy.
          </Typography>
        </Box>
      </LoginContainer>

      <Box mt={4} textAlign="center">
        <Typography variant="body2" color="text.secondary">
          Don't have a Zoom account?{' '}
          <Button
            href="https://zoom.us/signup"
            target="_blank"
            rel="noopener noreferrer"
            size="small"
            sx={{ textTransform: 'none' }}
          >
            Sign up for free
          </Button>
        </Typography>
      </Box>
    </Container>
  );
};

export default Login;
