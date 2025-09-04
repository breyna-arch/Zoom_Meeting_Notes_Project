const axios = require('axios');
const querystring = require('querystring');

class ZoomService {
  constructor(accessToken) {
    this.baseUrl = 'https://api.zoom.us/v2';
    this.accessToken = accessToken;
    this.axios = axios.create({
      baseURL: this.baseUrl,
      headers: {
        'Authorization': `Bearer ${this.accessToken}`,
        'Content-Type': 'application/json'
      }
    });
  }

  // Get current user's profile
  async getUserProfile() {
    try {
      const response = await this.axios.get('/users/me');
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Create a meeting
  async createMeeting(userId, meetingData) {
    try {
      const response = await this.axios.post(`/users/${userId}/meetings`, meetingData);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get meeting details
  async getMeeting(meetingId) {
    try {
      const response = await this.axios.get(`/meetings/${meetingId}`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get meeting recordings
  async getMeetingRecordings(meetingId) {
    try {
      const response = await this.axios.get(`/meetings/${meetingId}/recordings`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Get webinars for user
  async getWebinars(userId) {
    try {
      const response = await this.axios.get(`/users/${userId}/webinars`);
      return response.data;
    } catch (error) {
      this.handleError(error);
    }
  }

  // Handle API errors
  handleError(error) {
    console.error('Zoom API Error:', error.response?.data || error.message);
    const status = error.response?.status;
    const message = error.response?.data?.message || 'Failed to connect to Zoom API';
    
    const errorObj = new Error(message);
    errorObj.status = status || 500;
    throw errorObj;
  }

  // Static method to get access token from auth code
  static async getAccessToken(code, redirectUri) {
    try {
      const response = await axios.post('https://zoom.us/oauth/token', 
        querystring.stringify({
          grant_type: 'authorization_code',
          code,
          redirect_uri: redirectUri
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`
          }
        });
      
      return response.data;
    } catch (error) {
      console.error('Error getting Zoom access token:', error.response?.data || error.message);
      throw new Error('Failed to authenticate with Zoom');
    }
  }
}

module.exports = ZoomService;
