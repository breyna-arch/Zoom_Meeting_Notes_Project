import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Box, Button, Container, Typography, Paper, Grid } from '@mui/material';
import { styled } from '@mui/material/styles';
import MeetingRoomIcon from '@mui/icons-material/MeetingRoom';
import NotesIcon from '@mui/icons-material/Notes';
import GroupIcon from '@mui/icons-material/Group';

const FeatureCard = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(4),
  textAlign: 'center',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  transition: 'transform 0.3s ease-in-out',
  '&:hover': {
    transform: 'translateY(-5px)',
  },
}));

const FeatureIcon = styled('div')(({ theme }) => ({
  width: 80,
  height: 80,
  borderRadius: '50%',
  backgroundColor: theme.palette.primary.light,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  marginBottom: theme.spacing(2),
  color: theme.palette.primary.contrastText,
  '& svg': {
    fontSize: 40,
  },
}));

const Home = () => {
  const { isAuthenticated, loginWithZoom } = useAuth();
  const navigate = useNavigate();

  const handleGetStarted = () => {
    if (isAuthenticated) {
      navigate('/dashboard');
    } else {
      loginWithZoom();
    }
  };

  return (
    <Box sx={{ py: 8 }}>
      <Container maxWidth="lg">
        {/* Hero Section */}
        <Box sx={{ textAlign: 'center', mb: 8 }}>
          <Typography
            variant="h2"
            component="h1"
            gutterBottom
            sx={{ fontWeight: 700, mb: 3 }}
          >
            Zoom Meeting Notes Agent
          </Typography>
          <Typography
            variant="h5"
            color="text.secondary"
            paragraph
            sx={{ maxWidth: '700px', mx: 'auto', mb: 4 }}
          >
            Automatically generate meeting summaries and action items from your Zoom meetings.
            Save time and stay organized with AI-powered meeting notes.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{ py: 1.5, px: 4, fontSize: '1.1rem' }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started with Zoom'}
          </Button>
        </Box>

        {/* Features Section */}
        <Box sx={{ mt: 12 }}>
          <Typography
            variant="h4"
            component="h2"
            align="center"
            gutterBottom
            sx={{ mb: 6 }}
          >
            How It Works
          </Typography>
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <FeatureCard elevation={3}>
                <FeatureIcon>
                  <MeetingRoomIcon />
                </FeatureIcon>
                <Typography variant="h6" component="h3" gutterBottom>
                  Join Meetings
                </Typography>
                <Typography color="text.secondary">
                  Our bot joins your Zoom meetings as a participant to capture everything that's said.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard elevation={3}>
                <FeatureIcon>
                  <NotesIcon />
                </FeatureIcon>
                <Typography variant="h6" component="h3" gutterBottom>
                  Generate Notes
                </Typography>
                <Typography color="text.secondary">
                  AI analyzes the conversation and creates concise meeting summaries and action items.
                </Typography>
              </FeatureCard>
            </Grid>
            <Grid item xs={12} md={4}>
              <FeatureCard elevation={3}>
                <FeatureIcon>
                  <GroupIcon />
                </FeatureIcon>
                <Typography variant="h6" component="h3" gutterBottom>
                  Stay Organized
                </Typography>
                <Typography color="text.secondary">
                  Keep track of all your meeting notes and action items in one place.
                </Typography>
              </FeatureCard>
            </Grid>
          </Grid>
        </Box>

        {/* CTA Section */}
        <Box sx={{ mt: 12, textAlign: 'center' }}>
          <Typography variant="h4" component="h2" gutterBottom>
            Ready to transform your meetings?
          </Typography>
          <Typography variant="body1" color="text.secondary" sx={{ mb: 4, maxWidth: '600px', mx: 'auto' }}>
            Join thousands of professionals who are already saving hours every week with automated meeting notes.
          </Typography>
          <Button
            variant="contained"
            size="large"
            onClick={handleGetStarted}
            sx={{ py: 1.5, px: 6, fontSize: '1.1rem' }}
          >
            {isAuthenticated ? 'Go to Dashboard' : 'Get Started for Free'}
          </Button>
        </Box>
      </Container>
    </Box>
  );
};

export default Home;
