const mongoose = require('mongoose');

const meetingSchema = new mongoose.Schema({
  zoomMeetingId: {
    type: String,
    required: true,
    index: true
  },
  hostId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  topic: {
    type: String,
    required: true
  },
  startTime: {
    type: Date,
    required: true
  },
  duration: {
    type: Number,
    required: true
  },
  joinUrl: String,
  password: String,
  status: {
    type: String,
    enum: ['scheduled', 'in_progress', 'completed', 'canceled'],
    default: 'scheduled'
  },
  participants: [{
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    name: String,
    email: String,
    joinTime: Date,
    leaveTime: Date
  }],
  transcript: [{
    speaker: String,
    text: String,
    timestamp: Date
  }],
  summary: String,
  actionItems: [{
    description: String,
    assignee: String,
    dueDate: Date,
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed'],
      default: 'pending'
    }
  }],
  recordingUrl: String,
  chatHistory: [{
    sender: String,
    message: String,
    timestamp: Date
  }]
}, {
  timestamps: true
});

// Add indexes for faster queries
meetingSchema.index({ zoomMeetingId: 1 });
meetingSchema.index({ hostId: 1 });
meetingSchema.index({ status: 1 });
meetingSchema.index({ startTime: 1 });

const Meeting = mongoose.model('Meeting', meetingSchema);

module.exports = Meeting;
