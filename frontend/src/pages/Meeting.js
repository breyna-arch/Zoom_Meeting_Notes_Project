import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useMeeting } from '../contexts/MeetingContext';
import { useAuth } from '../contexts/AuthContext';
import {
  Box,
  Button,
  Typography,
  Paper,
  TextField,
  IconButton,
  Divider,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  AppBar,
  Toolbar,
  Grid,
  Card,
  CardContent,
  CardHeader,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip,
  Tooltip,
  Zoom,
  Fab,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  CheckCircle as CheckCircleIcon,
  Assignment as AssignmentIcon,
  Mic as MicIcon,
  MicOff as MicOffIcon,
  Videocam as VideocamIcon,
  VideocamOff as VideocamOffIcon,
  ScreenShare as ScreenShareIcon,
  StopScreenShare as StopScreenShareIcon,
  Chat as ChatIcon,
  MoreVert as MoreVertIcon,
  Close as CloseIcon,
  Check as CheckIcon,
  ContentCopy as ContentCopyIcon,
} from '@mui/icons-material';
import { styled } from '@mui/material/styles';
import { format } from 'date-fns';

// Styled components
const MeetingContainer = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  height: '100vh',
  overflow: 'hidden',
});

const Header = styled(AppBar)(({ theme }) => ({
  backgroundColor: theme.palette.background.paper,
  color: theme.palette.text.primary,
  boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
}));

const Content = styled(Box)({
  display: 'flex',
  flex: 1,
  overflow: 'hidden',
});

const VideoContainer = styled(Box)({
  flex: 1,
  backgroundColor: '#1a1a1a',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  position: 'relative',
  overflow: 'hidden',
});

const Video = styled('video')({
  width: '100%',
  height: '100%',
  objectFit: 'contain',
});

const Controls = styled(Paper)(({ theme }) => ({
  padding: theme.spacing(2),
  borderRadius: '12px 12px 0 0',
  display: 'flex',
  justifyContent: 'center',
  gap: theme.spacing(2),
  backgroundColor: theme.palette.background.paper,
  boxShadow: '0 -2px 10px rgba(0,0,0,0.1)',
}));

const Sidebar = styled(Paper)(({ theme }) => ({
  width: '350px',
  height: '100%',
  display: 'flex',
  flexDirection: 'column',
  borderRadius: 0,
  borderLeft: `1px solid ${theme.palette.divider}`,
  [theme.breakpoints.down('md')]: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    zIndex: 10,
    transform: 'translateX(100%)',
    transition: 'transform 0.3s ease-in-out',
    '&.open': {
      transform: 'translateX(0)',
    },
  },
}));

const TabPanel = (props) => {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`meeting-tabpanel-${index}`}
      aria-labelledby={`meeting-tab-${index}`}
      style={{ flex: 1, overflow: 'auto' }}
      {...other}
    >
      {value === index && <Box sx={{ p: 2, height: '100%' }}>{children}</Box>}
    </div>
  );
};

const a11yProps = (index) => ({
  id: `meeting-tab-${index}`,
  'aria-controls': `meeting-tabpanel-${index}`,
});

const Meeting = () => {
  const { meetingId } = useParams();
  const navigate = useNavigate();
  const { currentUser } = useAuth();
  const {
    transcript,
    summary,
    actionItems,
    isProcessing,
    error,
    endMeeting,
  } = useMeeting();
  
  // State
  const [tabValue, setTabValue] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOn, setIsVideoOn] = useState(true);
  const [isScreenSharing, setIsScreenSharing] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [isLeaving, setIsLeaving] = useState(false);
  const [copied, setCopied] = useState(false);
  
  const videoRef = useRef(null);
  const shareLink = `${window.location.origin}/meeting/${meetingId}`;

  // Handle tab change
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  // Toggle mute
  const toggleMute = () => {
    setIsMuted(!isMuted);
    // In a real app, this would control the actual audio track
  };

  // Toggle video
  const toggleVideo = () => {
    setIsVideoOn(!isVideoOn);
    // In a real app, this would control the actual video track
  };

  // Toggle screen share
  const toggleScreenShare = async () => {
    try {
      if (!isScreenSharing) {
        // Request screen share
        const stream = await navigator.mediaDevices.getDisplayMedia({
          video: true,
          audio: true,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        // Handle when screen sharing is stopped by the browser
        stream.getVideoTracks()[0].onended = () => {
          setIsScreenSharing(false);
        };
      } else {
        // Stop screen share
        const stream = videoRef.current?.srcObject;
        if (stream) {
          const tracks = stream.getTracks();
          tracks.forEach(track => track.stop());
          if (videoRef.current) {
            videoRef.current.srcObject = null;
          }
        }
      }
      
      setIsScreenSharing(!isScreenSharing);
    } catch (err) {
      console.error('Error toggling screen share:', err);
    }
  };

  // Handle leave meeting
  const handleLeaveMeeting = async () => {
    try {
      setIsLeaving(true);
      await endMeeting();
      navigate('/dashboard');
    } catch (err) {
      console.error('Error leaving meeting:', err);
      setIsLeaving(false);
    }
  };

  // Copy meeting link to clipboard
  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Set up video stream (simulated in this example)
  useEffect(() => {
    // In a real app, this would set up the actual video stream
    // For demo purposes, we'll just show a placeholder
    const setupMedia = async () => {
      try {
        const stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true,
        });
        
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }
        
        return () => {
          stream.getTracks().forEach(track => track.stop());
        };
      } catch (err) {
        console.error('Error accessing media devices:', err);
      }
    };
    
    setupMedia();
    
    return () => {
      const stream = videoRef.current?.srcObject;
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  return (
    <MeetingContainer>
      <Header position="static" color="default">
        <Toolbar>
          <IconButton
            edge="start"
            color="inherit"
            aria-label="back"
            onClick={() => navigate('/dashboard')}
            sx={{ mr: 2 }}
          >
            <ArrowBackIcon />
          </IconButton>
          
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" noWrap>
              {meetingId}
            </Typography>
            <Tooltip title={copied ? 'Copied!' : 'Copy meeting link'} arrow>
              <Button
                size="small"
                startIcon={copied ? <CheckIcon /> : <ContentCopyIcon />}
                onClick={copyToClipboard}
                sx={{ textTransform: 'none' }}
              >
                {copied ? 'Copied!' : 'Copy link'}
              </Button>
            </Tooltip>
          </Box>
          
          <IconButton
            color="inherit"
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            sx={{ display: { xs: 'flex', md: 'none' } }}
          >
            {isSidebarOpen ? <CloseIcon /> : <MoreVertIcon />}
          </IconButton>
        </Toolbar>
      </Header>
      
      <Content>
        <VideoContainer>
          {isVideoOn ? (
            <Video
              ref={videoRef}
              autoPlay
              playsInline
              muted={isMuted}
            />
          ) : (
            <Box
              sx={{
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#2d2d2d',
                color: 'white',
              }}
            >
              <Box textAlign="center">
                <Typography variant="h6">
                  {currentUser?.display_name || 'User'}'s video is off
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  They'll see you when the video is turned on
                </Typography>
              </Box>
            </Box>
          )}
          
          <Controls elevation={3}>
            <Tooltip title={isMuted ? 'Unmute' : 'Mute'} arrow>
              <IconButton
                color={isMuted ? 'error' : 'default'}
                onClick={toggleMute}
                sx={{ backgroundColor: 'background.paper' }}
              >
                {isMuted ? <MicOffIcon /> : <MicIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isVideoOn ? 'Turn off video' : 'Turn on video'} arrow>
              <IconButton
                color={!isVideoOn ? 'error' : 'default'}
                onClick={toggleVideo}
                sx={{ backgroundColor: 'background.paper' }}
              >
                {isVideoOn ? <VideocamIcon /> : <VideocamOffIcon />}
              </IconButton>
            </Tooltip>
            
            <Tooltip title={isScreenSharing ? 'Stop sharing' : 'Share screen'} arrow>
              <IconButton
                color={isScreenSharing ? 'primary' : 'default'}
                onClick={toggleScreenShare}
                sx={{ backgroundColor: 'background.paper' }}
              >
                {isScreenSharing ? <ScreenShareIcon /> : <StopScreenShareIcon />}
              </IconButton>
            </ToolTip>
            
            <Button
              variant="contained"
              color="error"
              onClick={handleLeaveMeeting}
              disabled={isLeaving}
              startIcon={isLeaving ? <CircularProgress size={20} color="inherit" /> : null}
              sx={{ ml: 2, textTransform: 'none' }}
            >
              {isLeaving ? 'Leaving...' : 'Leave'}
            </Button>
          </Controls>
        </VideoContainer>
        
        <Sidebar className={isSidebarOpen ? 'open' : ''}>
          <AppBar position="static" color="default" elevation={0}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              variant="fullWidth"
              aria-label="meeting tabs"
              sx={{ borderBottom: 1, borderColor: 'divider' }}
            >
              <Tab label="Chat" {...a11yProps(0)} />
              <Tab label="Notes" {...a11yProps(1)} />
              <Tab label="People" {...a11yProps(2)} />
            </Tabs>
          </AppBar>
          
          <TabPanel value={tabValue} index={0}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              <Box sx={{ flexGrow: 1, overflow: 'auto', mb: 2 }}>
                <Typography variant="body2" color="text.secondary" align="center" sx={{ my: 4 }}>
                  Chat messages will appear here
                </Typography>
              </Box>
              <Box sx={{ display: 'flex', gap: 1 }}>
                <TextField
                  fullWidth
                  size="small"
                  placeholder="Type a message..."
                  variant="outlined"
                />
                <Button variant="contained" color="primary">
                  Send
                </Button>
              </Box>
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            <Box sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
              {isProcessing ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 4 }}>
                  <CircularProgress />
                </Box>
              ) : error ? (
                <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>
              ) : (
                <>
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>
                      Meeting Summary
                    </Typography>
                    {summary ? (
                      <Paper variant="outlined" sx={{ p: 2, bgcolor: 'background.default' }}>
                        <Typography variant="body1" whiteSpace="pre-line">
                          {summary}
                        </Typography>
                      </Paper>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        The meeting summary will appear here after processing.
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="h6" gutterBottom>
                      Action Items
                    </Typography>
                    {actionItems.length > 0 ? (
                      <List dense>
                        {actionItems.map((item, index) => (
                          <ListItem key={index} divider>
                            <ListItemIcon>
                              <AssignmentIcon color="primary" />
                            </ListItemIcon>
                            <ListItemText
                              primary={item.task}
                              secondary={`Assigned to: ${item.assignedTo || 'Unassigned'}`}
                            />
                          </ListItem>
                        ))}
                      </List>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        Action items will appear here as they are identified.
                      </Typography>
                    )}
                  </Box>
                  
                  <Box sx={{ mt: 3, pt: 2, borderTop: 1, borderColor: 'divider' }}>
                    <Typography variant="subtitle2" gutterBottom>
                      Transcript
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, maxHeight: '200px', overflow: 'auto' }}>
                      {transcript ? (
                        <Typography variant="body2" whiteSpace="pre-line">
                          {transcript}
                        </Typography>
                      ) : (
                        <Typography variant="body2" color="text.secondary">
                          The meeting transcript will appear here in real-time.
                        </Typography>
                      )}
                    </Paper>
                  </Box>
                </>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <List>
              <ListItem>
                <Box sx={{ display: 'flex', alignItems: 'center', width: '100%' }}>
                  <Box
                    sx={{
                      width: 40,
                      height: 40,
                      borderRadius: '50%',
                      backgroundColor: 'primary.main',
                      color: 'primary.contrastText',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      mr: 2,
                      fontWeight: 'bold',
                    }}
                  >
                    {currentUser?.display_name?.[0] || 'U'}
                  </Box>
                  <Box sx={{ flexGrow: 1 }}>
                    <Typography variant="subtitle1">
                      {currentUser?.display_name || 'You'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Meeting host
                    </Typography>
                  </Box>
                  <Chip
                    label="You"
                    size="small"
                    color="primary"
                    variant="outlined"
                  />
                </Box>
              </ListItem>
              <Divider />
              <ListItem>
                <Typography variant="body2" color="text.secondary">
                  Other participants will appear here
                </Typography>
              </ListItem>
            </List>
          </TabPanel>
        </Sidebar>
      </Content>
    </MeetingContainer>
  );
};

export default Meeting;
