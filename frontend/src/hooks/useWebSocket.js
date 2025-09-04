import { useEffect, useRef, useCallback } from 'react';
import { io } from 'socket.io-client';

const SOCKET_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const useWebSocket = (eventHandlers = {}) => {
  const socketRef = useRef(null);
  const eventHandlersRef = useRef(eventHandlers);

  // Update event handlers if they change
  useEffect(() => {
    eventHandlersRef.current = eventHandlers;
  }, [eventHandlers]);

  // Initialize socket connection
  useEffect(() => {
    const socket = io(SOCKET_URL, {
      withCredentials: true,
      autoConnect: true,
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    // Set up event listeners
    socket.on('connect', () => {
      console.log('Connected to WebSocket server');
      if (eventHandlersRef.current.onConnect) {
        eventHandlersRef.current.onConnect();
      }
    });

    socket.on('disconnect', () => {
      console.log('Disconnected from WebSocket server');
      if (eventHandlersRef.current.onDisconnect) {
        eventHandlersRef.current.onDisconnect();
      }
    });

    socket.on('error', (error) => {
      console.error('WebSocket error:', error);
      if (eventHandlersRef.current.onError) {
        eventHandlersRef.current.onError(error);
      }
    });

    // Set up custom event handlers
    Object.entries(eventHandlersRef.current).forEach(([event, handler]) => {
      if (!['onConnect', 'onDisconnect', 'onError'].includes(event)) {
        socket.on(event, handler);
      }
    });

    socketRef.current = socket;

    // Cleanup on unmount
    return () => {
      socket.disconnect();
    };
  }, []);

  // Emit an event to the server
  const emit = useCallback((event, data, callback) => {
    if (!socketRef.current) {
      console.warn('Socket not connected');
      return;
    }
    
    if (callback) {
      socketRef.current.emit(event, data, callback);
    } else {
      socketRef.current.emit(event, data);
    }
  }, []);

  // Join a room
  const joinRoom = useCallback((roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('join_room', roomId);
    }
  }, []);

  // Leave a room
  const leaveRoom = useCallback((roomId) => {
    if (socketRef.current) {
      socketRef.current.emit('leave_room', roomId);
    }
  }, []);

  return {
    socket: socketRef.current,
    isConnected: socketRef.current?.connected || false,
    emit,
    joinRoom,
    leaveRoom,
  };
};

export default useWebSocket;
