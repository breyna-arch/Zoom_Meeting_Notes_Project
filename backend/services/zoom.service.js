const axios = require('axios');
const { v4: uuidv4 } = require('uuid');
const zoomConfig = require('../config/zoom.config');

class ZoomService {
  constructor() {
    this.zoomApi = axios.create({
      baseURL: 'https://api.zoom.us/v2',
      timeout: 10000,
    });
  }

  /**
   * Generate a JWT token for Zoom API authentication
   */
  generateJWT() {
    const { v4: uuidv4 } = require('uuid');
    const jwt = require('jsonwebtoken');
    
    const payload = {
      iss: zoomConfig.sdk.key,
      exp: ((new Date()).getTime() + 5000),
    };
    
    return jwt.sign(payload, zoomConfig.sdk.secret);
  }

  /**
   * Join a Zoom meeting
   * @param {string} meetingId - The Zoom meeting ID
   * @param {string} [password] - Meeting password if required
   * @returns {Object} Meeting join information
   */
  async joinMeeting(meetingId, password = '') {
    try {
      const token = this.generateJWT();
      const response = await this.zoomApi.get(`/meetings/${meetingId}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      const meetingData = response.data;
      
      // Return the join URL and other meeting details
      return {
        success: true,
        meetingId: meetingData.id,
        topic: meetingData.topic,
        startTime: meetingData.start_time,
        joinUrl: `${meetingData.join_url}?pwd=${password}`,
        passwordRequired: !!password,
      };
    } catch (error) {
      console.error('Error joining meeting:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to join meeting',
        code: error.response?.status || 500,
      };
    }
  }

  /**
   * Get meeting recording if available
   * @param {string} meetingId - The Zoom meeting ID
   * @returns {Object} Recording information
   */
  async getMeetingRecording(meetingId) {
    try {
      const token = this.generateJWT();
      const response = await this.zoomApi.get(`/meetings/${meetingId}/recordings`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        recording: response.data,
      };
    } catch (error) {
      console.error('Error getting meeting recording:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get meeting recording',
        code: error.response?.status || 500,
      };
    }
  }

  /**
   * Get meeting transcript if available
   * @param {string} meetingId - The Zoom meeting ID
   * @returns {Object} Transcript information
   */
  async getMeetingTranscript(meetingId) {
    try {
      const token = this.generateJWT();
      const response = await this.zoomApi.get(`/meetings/${meetingId}/recordings/transcripts`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
      });

      return {
        success: true,
        transcript: response.data,
      };
    } catch (error) {
      console.error('Error getting meeting transcript:', error.response?.data || error.message);
      return {
        success: false,
        error: error.response?.data?.message || 'Failed to get meeting transcript',
        code: error.response?.status || 500,
      };
    }
  }
}

module.exports = new ZoomService();
