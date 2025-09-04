import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { useMeeting } from '../contexts/MeetingContext';
import {
  Box,
  Button,
  Container,
  Typography,
  Paper,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  Alert,
  Grid,
  Card,
  CardContent,
  CardActions,
  Divider,
  IconButton,
  Menu,
  MenuItem,
  ListItemIcon,
  ListItemText,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  MoreVert as MoreVertIcon,
  VideoCall as VideoCallIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  ContentCopy as ContentCopyIcon,
  CheckCircle as CheckCircleIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import { styled } from '@mui/material/styles';

// Styled components
const DashboardContainer = styled(Box)({
  flexGrow: 1,
  padding: '24px',
});

const Header = styled(Box)(({ theme }) => ({
  marginBottom: theme.spacing(4),
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  flexWrap: 'wrap',
  gap: theme.spacing(2),
}));

const MeetingCard = styled(Card)(({ theme }) => ({
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  transition: 'transform 0.2s, box-shadow 0.2s',
  '&:hover': {
    transform: 'translateY(-4px)',
    boxShadow: theme.shadows[8],
  },
}));

const Dashboard = () => {
  const { currentUser, api } = useAuth();
  const { joinMeeting } = useMeeting();
  const navigate = useNavigate();
  
  // State
  const [meetings, setMeetings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [openJoinDialog, setOpenJoinDialog] = useState(false);
  const [meetingId, setMeetingId] = useState('');
  const [password, setPassword] = useState('');
  const [isJoining, setIsJoining] = useState(false);
  
  // Menu state
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedMeeting, setSelectedMeeting] = useState(null);
  const [copiedId, setCopiedId] = useState('');

  // Fetch user's meetings
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setLoading(true);
        // In a real app, this would fetch from your API
        // const response = await api.get('/meetings');
        // setMeetings(response.data);
        
        // Mock data for now
        setMeetings([
          {
            id: '1234567890',
            topic: 'Weekly Team Sync',
            startTime: '2023-11-15T10:00:00Z',
            duration: 60,
            hasNotes: true,
            actionItems: 3,
          },
          {
            id: '2345678901',
            topic: 'Project Kickoff',
            startTime: '2023-11-10T14:30:00Z',
            duration: 90,
            hasNotes: true,
            actionItems: 5,
          },
        ]);
      } catch (err) {
        console.error('Error fetching meetings:', err);
        setError('Failed to load meetings. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    fetchMeetings();
  }, [api]);

  // Handle menu open
  const handleMenuOpen = (event, meeting) => {
    setAnchorEl(event.currentTarget);
    setSelectedMeeting(meeting);
  };

  // Handle menu close
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedMeeting(null);
  };

  // Handle copy meeting ID
  const handleCopyId = (id) => {
    navigator.clipboard.writeText(id);
    setCopiedId(id);
    setTimeout(() => setCopiedId(''), 2000);
    handleMenuClose();
  };

  // Handle delete meeting
  const handleDeleteMeeting = async () => {
    if (!selectedMeeting) return;
    
    try {
      // In a real app, this would call your API
      // await api.delete(`/meetings/${selectedMeeting.id}`);
      setMeetings(meetings.filter(m => m.id !== selectedMeeting.id));
    } catch (err) {
      console.error('Error deleting meeting:', err);
      setError('Failed to delete meeting. Please try again.');
    } finally {
      handleMenuClose();
    }
  };

  // Handle join meeting
  const handleJoinMeeting = async () => {
    if (!meetingId.trim()) {
      setError('Please enter a meeting ID');
      return;
    }

    try {
      setIsJoining(true);
      setError('');
      
      await joinMeeting({
        meetingId: meetingId.trim(),
        password: password.trim() || undefined,
      });
      
      // Navigate to meeting page
      navigate(`/meeting/${meetingId}`);
      
      // Reset form
      setMeetingId('');
      setPassword('');
      setOpenJoinDialog(false);
    } catch (err) {
      console.error('Error joining meeting:', err);
      setError(err.message || 'Failed to join meeting. Please check the ID and password and try again.');
    } finally {
      setIsJoining(false);
    }
  };

  // Handle start instant meeting
  const handleStartInstantMeeting = async () => {
    try {
      setIsJoining(true);
      setError('');
      
      // In a real app, this would create a new meeting via your API
      // const response = await api.post('/meetings', { type: 'instant' });
      // const { meetingId } = response.data;
      
      // For demo, use a mock meeting ID
      const mockMeetingId = `mock-${Math.random().toString(36).substr(2, 9)}`;
      
      await joinMeeting({
        meetingId: mockMeetingId,
        isInstant: true,
      });
      
      navigate(`/meeting/${mockMeetingId}`);
    } catch (err) {
      console.error('Error starting instant meeting:', err);
      setError('Failed to start instant meeting. Please try again.');
    } finally {
      setIsJoining(false);
    }
  };

  return (
    <DashboardContainer>
      <Container maxWidth="xl">
        <Header>
          <Box>
            <Typography variant="h4" component="h1" gutterBottom>
              My Meetings
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Welcome back, {currentUser?.first_name || 'User'}! Here are your recent meetings.
            </Typography>
          </Box>
          <Box display="flex" gap={2} flexWrap="wrap">
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenJoinDialog(true)}
            >
              Join Meeting
            </Button>
            <Button
              variant="outlined"
              color="primary"
              startIcon={<VideoCallIcon />}
              onClick={handleStartInstantMeeting}
              disabled={isJoining}
            >
              {isJoining ? 'Starting...' : 'New Meeting'}
            </Button>
          </Box>
        </Header>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        {loading ? (
          <Box display="flex" justifyContent="center" my={8}>
            <CircularProgress />
          </Box>
        ) : meetings.length === 0 ? (
          <Paper sx={{ p: 4, textAlign: 'center' }}>
            <Typography variant="h6" gutterBottom>
              No meetings found
            </Typography>
            <Typography color="text.secondary" paragraph>
              Join a meeting or start a new one to get started.
            </Typography>
            <Button
              variant="contained"
              color="primary"
              startIcon={<AddIcon />}
              onClick={() => setOpenJoinDialog(true)}
              sx={{ mt: 2 }}
            >
              Join a Meeting
            </Button>
          </Paper>
        ) : (
          <Grid container spacing={3}>
            {meetings.map((meeting) => (
              <Grid item xs={12} sm={6} md={4} key={meeting.id}>
                <MeetingCard>
                  <CardContent sx={{ flexGrow: 1 }}>
                    <Box display="flex" justifyContent="space-between" alignItems="flex-start">
                      <Typography variant="h6" component="h2" gutterBottom>
                        {meeting.topic}
                      </Typography>
                      <IconButton
                        size="small"
                        onClick={(e) => handleMenuOpen(e, meeting)}
                        aria-label="meeting options"
                      >
                        <MoreVertIcon />
                      </IconButton>
                    </Box>
                    
                    <Box display="flex" alignItems="center" mb={1.5}>
                      <Typography variant="body2" color="text.secondary">
                        {format(new Date(meeting.startTime), 'MMM d, yyyy • h:mm a')}
                      </Typography>
                      <Box mx={1}>•</Box>
                      <Typography variant="body2" color="text.secondary">
                        {meeting.duration} min
                      </Typography>
                    </Box>
                    
                    <Box display="flex" gap={2} mt={2}>
                      {meeting.hasNotes && (
                        <Box display="flex" alignItems="center">
                          <CheckCircleIcon color="success" fontSize="small" sx={{ mr: 0.5 }} />
                          <Typography variant="body2" color="text.secondary">
                            Notes available
                          </Typography>
                        </Box>
                      )}
                      {meeting.actionItems > 0 && (
                        <Typography variant="body2" color="primary">
                          {meeting.actionItems} action items
                        </Typography>
                      )}
                    </Box>
                  </CardContent>
                  
                  <CardActions sx={{ p: 2, pt: 0 }}>
                    <Button
                      size="small"
                      color="primary"
                      onClick={() => navigate(`/meeting/${meeting.id}`)}
                    >
                      View Details
                    </Button>
                  </CardActions>
                </MeetingCard>
              </Grid>
            ))}
          </Grid>
        )}
      </Container>

      {/* Join Meeting Dialog */}
      <Dialog open={openJoinDialog} onClose={() => setOpenJoinDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Join a Meeting</DialogTitle>
        <DialogContent>
          <Box mb={3}>
            <TextField
              autoFocus
              margin="dense"
              id="meetingId"
              label="Meeting ID"
              type="text"
              fullWidth
              variant="outlined"
              value={meetingId}
              onChange={(e) => setMeetingId(e.target.value)}
              placeholder="Enter meeting ID"
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              id="password"
              label="Password (optional)"
              type="password"
              fullWidth
              variant="outlined"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter password if required"
            />
          </Box>
          {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenJoinDialog(false)} disabled={isJoining}>
            Cancel
          </Button>
          <Button
            onClick={handleJoinMeeting}
            variant="contained"
            color="primary"
            disabled={!meetingId.trim() || isJoining}
          >
            {isJoining ? <CircularProgress size={24} /> : 'Join'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Meeting Options Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        anchorOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
      >
        <MenuItem onClick={() => {
          handleCopyId(selectedMeeting?.id);
          handleMenuClose();
        }}>
          <ListItemIcon>
            {copiedId === selectedMeeting?.id ? (
              <CheckCircleIcon fontSize="small" color="success" />
            ) : (
              <ContentCopyIcon fontSize="small" />
            )}
          </ListItemIcon>
          <ListItemText>
            {copiedId === selectedMeeting?.id ? 'Copied!' : 'Copy Meeting ID'}
          </ListItemText>
        </MenuItem>
        <MenuItem onClick={handleMenuClose}>
          <ListItemIcon>
            <EditIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Edit</ListItemText>
        </MenuItem>
        <Divider />
        <MenuItem onClick={handleDeleteMeeting} sx={{ color: 'error.main' }}>
          <ListItemIcon sx={{ color: 'error.main' }}>
            <DeleteIcon fontSize="small" />
          </ListItemIcon>
          <ListItemText>Delete</ListItemText>
        </MenuItem>
      </Menu>
    </DashboardContainer>
  );
};

export default Dashboard;
