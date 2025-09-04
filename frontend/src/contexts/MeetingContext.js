import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { io } from 'socket.io-client';
import { useAuth } from './AuthContext';

const MeetingContext = createContext();

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

export const useMeeting = () => {
  return useContext(MeetingContext);
};

export const MeetingProvider = ({ children }) => {
  const [socket, setSocket] = useState(null);
  const [isConnected, setIsConnected] = useState(false);
  const [currentMeeting, setCurrentMeeting] = useState(null);
  const [transcript, setTranscript] = useState('');
  const [summary, setSummary] = useState('');
  const [actionItems, setActionItems] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState(null);
  const { api } = useAuth();
  const navigate = useNavigate();

  // Initialize socket connection
  useEffect(() => {
    const newSocket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: false,
    });

    setSocket(newSocket);

    return () => {
      newSocket.disconnect();
    };
  }, []);

  // Set up socket event listeners
  useEffect(() => {
    if (!socket) return;

    const onConnect = () => {
      console.log('Connected to WebSocket server');
      setIsConnected(true);
    };

    const onDisconnect = () => {
      console.log('Disconnected from WebSocket server');
      setIsConnected(false);
    };

    const onTranscriptUpdate = (data) => {
      setTranscript(prev => prev + '\n' + data.text);
    };

    const onTranscriptProcessed = (data) => {
      setSummary(data.summary);
      setActionItems(data.actionItems || []);
      setIsProcessing(false);
    };

    const onMeetingUpdate = (data) => {
      setCurrentMeeting(prev => ({
        ...prev,
        ...data,
      }));
    };

    const onMeetingEnded = () => {
      setCurrentMeeting(null);
      navigate('/dashboard');
    };

    socket.on('connect', onConnect);
    socket.on('disconnect', onDisconnect);
    socket.on('transcript_update', onTranscriptUpdate);
    socket.on('transcript_processed', onTranscriptProcessed);
    socket.on('meeting_update', onMeetingUpdate);
    socket.on('meeting_ended', onMeetingEnded);

    // Connect socket
    socket.connect();

    return () => {
      socket.off('connect', onConnect);
      socket.off('disconnect', onDisconnect);
      socket.off('transcript_update', onTranscriptUpdate);
      socket.off('transcript_processed', onTranscriptProcessed);
      socket.off('meeting_update', onMeetingUpdate);
      socket.off('meeting_ended', onMeetingEnded);
      socket.disconnect();
    };
  }, [socket, navigate]);

  // Join a meeting
  const joinMeeting = useCallback(async (meetingData) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      const response = await api.post('/meetings/join', meetingData);
      
      if (socket) {
        socket.emit('join_meeting', response.data.meetingId);
      }
      
      setCurrentMeeting({
        id: response.data.meetingId,
        status: 'joining',
        ...meetingData,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error joining meeting:', error);
      setError(error.response?.data?.error || 'Failed to join meeting');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [api, socket]);

  // Process transcript
  const processTranscript = useCallback(async (transcriptText) => {
    try {
      setError(null);
      setIsProcessing(true);
      
      const response = await api.post('/meetings/process-transcript', {
        transcript: transcriptText,
        meetingId: currentMeeting?.id,
      });
      
      return response.data;
    } catch (error) {
      console.error('Error processing transcript:', error);
      setError(error.response?.data?.error || 'Failed to process transcript');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [api, currentMeeting?.id]);

  // End meeting
  const endMeeting = useCallback(async () => {
    try {
      setError(null);
      setIsProcessing(true);
      
      if (currentMeeting?.id) {
        await api.post(`/meetings/${currentMeeting.id}/end`);
      }
      
      setCurrentMeeting(null);
      setTranscript('');
      setSummary('');
      setActionItems([]);
    } catch (error) {
      console.error('Error ending meeting:', error);
      setError(error.response?.data?.error || 'Failed to end meeting');
      throw error;
    } finally {
      setIsProcessing(false);
    }
  }, [api, currentMeeting?.id]);

  const value = {
    socket,
    isConnected,
    currentMeeting,
    transcript,
    summary,
    actionItems,
    isProcessing,
    error,
    joinMeeting,
    processTranscript,
    endMeeting,
    setTranscript,
    setSummary,
    setActionItems,
  };

  return (
    <MeetingContext.Provider value={value}>
      {children}
    </MeetingContext.Provider>
  );
};

export default MeetingContext;
