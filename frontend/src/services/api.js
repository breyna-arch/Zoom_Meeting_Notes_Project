import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:3001';

const api = axios.create({
  baseURL: `${API_URL}/api`,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token to requests
api.interceptors.request.use(
  (config) => {
    // You can add auth headers here if needed
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // Handle 401 Unauthorized responses
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        // Try to refresh the token
        await axios.get(`${API_URL}/api/auth/check-token`, {
          withCredentials: true,
        });
        
        // Retry the original request with the new token
        return api(originalRequest);
      } catch (refreshError) {
        // If refresh fails, redirect to login
        if (window.location.pathname !== '/login') {
          window.location.href = '/login';
        }
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export const authAPI = {
  // Check authentication status
  checkAuth: () => api.get('/auth/me'),
  
  // Logout
  logout: () => api.post('/auth/logout'),
  
  // Get Zoom OAuth URL
  getZoomAuthUrl: () => api.get('/auth/zoom/url'),
};

export const meetingsAPI = {
  // Get all meetings
  getMeetings: (params = {}) => api.get('/meetings', { params }),
  
  // Get meeting by ID
  getMeeting: (id) => api.get(`/meetings/${id}`),
  
  // Create a new meeting
  createMeeting: (data) => api.post('/meetings', data),
  
  // Update a meeting
  updateMeeting: (id, data) => api.put(`/meetings/${id}`, data),
  
  // Delete a meeting
  deleteMeeting: (id) => api.delete(`/meetings/${id}`),
  
  // Join a meeting
  joinMeeting: (meetingId, data) => api.post(`/meetings/${meetingId}/join`, data),
  
  // End a meeting
  endMeeting: (meetingId) => api.post(`/meetings/${meetingId}/end`),
  
  // Process meeting transcript
  processTranscript: (meetingId, transcript) => 
    api.post(`/meetings/${meetingId}/process-transcript`, { transcript }),
};

export const recordingsAPI = {
  // Get meeting recordings
  getRecordings: (meetingId) => api.get(`/recordings/${meetingId}`),
  
  // Process recording
  processRecording: (recordingId) => api.post(`/recordings/${recordingId}/process`),
};

export const usersAPI = {
  // Get current user profile
  getProfile: () => api.get('/users/me'),
  
  // Update user profile
  updateProfile: (data) => api.put('/users/me', data),
  
  // Get user settings
  getSettings: () => api.get('/users/me/settings'),
  
  // Update user settings
  updateSettings: (data) => api.put('/users/me/settings', data),
};

export default api;
