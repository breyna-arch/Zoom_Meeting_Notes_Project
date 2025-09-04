require('dotenv').config();

module.exports = {
  sdk: {
    key: process.env.ZOOM_SDK_KEY,
    secret: process.env.ZOOM_SDK_SECRET,
  },
  api: {
    key: process.env.ZOOM_API_KEY,
    secret: process.env.ZOOM_API_SECRET,
    redirectUri: process.env.ZOOM_REDIRECT_URI,
  },
  // Meeting bot settings
  bot: {
    name: 'Meeting Notes Assistant',
    autoJoin: true,
    recordAudio: true,
    joinBeforeHost: false,
    // Maximum meeting duration in minutes (0 = no limit)
    maxDuration: 120,
  },
};

// Validate required environment variables
const requiredVars = [
  'ZOOM_SDK_KEY',
  'ZOOM_SDK_SECRET',
  'ZOOM_API_KEY',
  'ZOOM_API_SECRET',
  'ZOOM_REDIRECT_URI',
];

const missingVars = requiredVars.filter(varName => !process.env[varName]);
if (missingVars.length > 0) {
  console.warn('Warning: The following required environment variables are not set:');
  missingVars.forEach(varName => console.warn(`- ${varName}`));
  console.warn('Please update your .env file with these variables.');
}
