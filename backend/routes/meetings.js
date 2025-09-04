const express = require('express');
const router = express.Router();
const { io } = require('../server');
const zoomService = require('../services/zoom.service');
const aiService = require('../services/ai.service');
const Meeting = require('../models/Meeting');

// Middleware to check authentication
const requireAuth = (req, res, next) => {
  if (!req.session.userId) {
    return res.status(401).json({ error: 'Authentication required' });
  }
  next();
};

/**
 * @route   POST /api/meetings/join
 * @desc    Join a Zoom meeting and start processing
 * @access  Private
 */
router.post('/join', requireAuth, async (req, res) => {
  const { meetingId, password } = req.body;
  const userId = req.session.userId;
  
  if (!meetingId) {
    return res.status(400).json({ error: 'Meeting ID is required' });
  }

  try {
    // Join the meeting using Zoom service
    const joinResult = await zoomService.joinMeeting(meetingId, password);
    
    if (!joinResult.success) {
      return res.status(400).json({ 
        success: false,
        error: joinResult.error || 'Failed to join meeting'
      });
    }

    // Create a new meeting record
    const meeting = new Meeting({
      zoomMeetingId: meetingId,
      hostId: userId,
      topic: joinResult.topic || 'Untitled Meeting',
      startTime: new Date(joinResult.startTime) || new Date(),
      joinUrl: joinResult.joinUrl,
      password: password || '',
      status: 'in_progress',
      participants: [{
        userId: userId,
        name: req.session.userName || 'Meeting Bot',
        joinTime: new Date()
      }]
    });

    await meeting.save();

    // Notify all connected clients about the meeting join
    io.emit('meeting_update', {
      meetingId,
      status: 'in_progress',
      timestamp: new Date().toISOString(),
      meetingData: meeting
    });
    
    res.json({
      success: true,
      message: 'Successfully joined meeting',
      meetingId,
      joinUrl: joinResult.joinUrl,
      meeting: meeting
    });
  } catch (error) {
    console.error('Error joining meeting:', error);
    res.status(500).json({ 
      success: false,
      error: error.message || 'Failed to join meeting',
      details: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
});

/**
 * @route   POST /api/meetings/process
 * @desc    Process meeting transcript and generate notes
 * @access  Private
 */
router.post('/process', requireAuth, async (req, res) => {
  const { meetingId, transcript, audioFile } = req.body;
  const userId = req.session.userId;

  if (!meetingId || (!transcript && !audioFile)) {
    return res.status(400).json({ 
      success: false,
      error: 'Meeting ID and either transcript or audio file is required' 
    });
  }

  try {
    let meeting = await Meeting.findOne({ 
      zoomMeetingId: meetingId,
      $or: [
        { hostId: userId },
        { 'participants.userId': userId }
      ]
    });

    if (!meeting) {
      return res.status(404).json({ 
        success: false,
        error: 'Meeting not found or access denied' 
      });
    }

    let transcriptText = transcript;

    // If audio file is provided, transcribe it
    if (audioFile && !transcript) {
      const audioBuffer = Buffer.from(audioFile, 'base64');
      const transcription = await aiService.transcribeAudio(audioBuffer, `meeting-${meetingId}.wav`);
      
      if (!transcription.success) {
        throw new Error(transcription.error || 'Failed to transcribe audio');
      }
      
      transcriptText = transcription.text;
      
      // Save the transcript to the meeting
      meeting.transcript = transcriptText;
      await meeting.save();
    }

    // Generate meeting notes using AI
    const notes = await aiService.generateMeetingNotes(transcriptText);
    
    if (!notes.success) {
      throw new Error(notes.error || 'Failed to generate meeting notes');
    }

    // Update meeting with the generated notes
    meeting.summary = notes.summary;
    meeting.actionItems = notes.actionItems;
    meeting.status = 'completed';
    meeting.endTime = new Date();
    
    await meeting.save();

    // Notify all connected clients about the processed notes
    io.emit('meeting_processed', {
      meetingId,
      status: 'completed',
      timestamp: new Date().toISOString(),
      summary: notes.summary,
      actionItems: notes.actionItems
    });

    res.json({
      success: true,
      meetingId,
      summary: notes.summary,
      actionItems: notes.actionItems
    });
  } catch (error) {
    console.error('Error processing transcript:', error);
    res.status(500).json({ 
      error: 'Failed to process transcript',
      details: error.message 
    });
  }
});

// Get meeting details
router.get('/:meetingId', requireAuth, async (req, res) => {
  const { meetingId } = req.params;

  try {
    // In a real implementation, you would fetch meeting details from Zoom API
    // This is a placeholder
    const response = await axios.get(`https://api.zoom.us/v2/meetings/${meetingId}`, {
      headers: {
        'Authorization': `Bearer ${req.session.zoomAccessToken}`,
        'Content-Type': 'application/json'
      }
    });

    res.json(response.data);
  } catch (error) {
    console.error('Error fetching meeting details:', error);
    res.status(500).json({ 
      error: 'Failed to fetch meeting details',
      details: error.response?.data || error.message 
    });
  }
});

// End meeting
router.post('/:meetingId/end', requireAuth, async (req, res) => {
  const { meetingId } = req.params;

  try {
    // In a real implementation, you would end the meeting via Zoom API
    // This is a placeholder
    const meetingData = {
      meetingId,
      status: 'ended',
      timestamp: new Date().toISOString()
    };

    // Notify all connected clients
    io.emit('meeting_ended', meetingData);
    
    res.json({
      success: true,
      message: 'Meeting ended successfully',
      meetingId
    });
  } catch (error) {
    console.error('Error ending meeting:', error);
    res.status(500).json({ 
      error: 'Failed to end meeting',
      details: error.message 
    });
  }
});

module.exports = router;
