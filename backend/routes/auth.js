const express = require('express');
const router = express.Router();
const axios = require('axios');
const querystring = require('querystring');
const { v4: uuidv4 } = require('uuid');

// Generate a random state parameter for OAuth
const generateState = () => uuidv4();

// Redirect to Zoom OAuth page
router.get('/zoom', (req, res) => {
  const state = generateState();
  req.session.state = state;
  
  const params = {
    response_type: 'code',
    client_id: process.env.ZOOM_API_KEY,
    redirect_uri: process.env.ZOOM_REDIRECT_URI,
    state: state
  };

  const zoomAuthUrl = `https://zoom.us/oauth/authorize?${querystring.stringify(params)}`;
  res.redirect(zoomAuthUrl);
});

// Handle Zoom OAuth callback
router.get('/zoom/callback', async (req, res) => {
  const { code, state } = req.query;
  
  // Verify state to prevent CSRF attacks
  if (state !== req.session.state) {
    return res.status(400).json({ error: 'Invalid state parameter' });
  }

  try {
    // Exchange authorization code for access token
    const tokenResponse = await axios.post('https://zoom.us/oauth/token', 
      querystring.stringify({
        grant_type: 'authorization_code',
        code: code,
        redirect_uri: process.env.ZOOM_REDIRECT_URI
      }), {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`
        }
      });

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    
    // Store tokens in session
    req.session.zoomAccessToken = access_token;
    req.session.zoomRefreshToken = refresh_token;
    req.session.tokenExpiresAt = Date.now() + (expires_in * 1000);

    // Get user info
    const userResponse = await axios.get('https://api.zoom.us/v2/users/me', {
      headers: {
        'Authorization': `Bearer ${access_token}`
      }
    });

    req.session.user = userResponse.data;
    
    // Redirect to frontend with success status
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/dashboard`);
  } catch (error) {
    console.error('OAuth error:', error.response?.data || error.message);
    res.redirect(`${process.env.FRONTEND_URL || 'http://localhost:3000'}/login?error=oauth_failed`);
  }
});

// Get current user session
router.get('/me', (req, res) => {
  if (!req.session.user) {
    return res.status(401).json({ error: 'Not authenticated' });
  }
  res.json({
    user: req.session.user,
    isAuthenticated: true
  });
});

// Logout
router.post('/logout', (req, res) => {
  req.session.destroy(err => {
    if (err) {
      console.error('Error destroying session:', err);
      return res.status(500).json({ error: 'Logout failed' });
    }
    res.clearCookie('connect.sid');
    res.json({ success: true });
  });
});

// Check if token needs refresh
router.get('/check-token', async (req, res) => {
  if (!req.session.zoomAccessToken) {
    return res.json({ needsRefresh: true });
  }

  // Check if token is expired or about to expire (within 5 minutes)
  if (Date.now() >= (req.session.tokenExpiresAt - 300000)) {
    try {
      const tokenResponse = await axios.post('https://zoom.us/oauth/token', 
        querystring.stringify({
          grant_type: 'refresh_token',
          refresh_token: req.session.zoomRefreshToken
        }), {
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${Buffer.from(`${process.env.ZOOM_API_KEY}:${process.env.ZOOM_API_SECRET}`).toString('base64')}`
          }
        });

      const { access_token, refresh_token, expires_in } = tokenResponse.data;
      
      // Update session with new tokens
      req.session.zoomAccessToken = access_token;
      req.session.zoomRefreshToken = refresh_token || req.session.zoomRefreshToken;
      req.session.tokenExpiresAt = Date.now() + (expires_in * 1000);
      
      return res.json({ needsRefresh: false, tokenRefreshed: true });
    } catch (error) {
      console.error('Token refresh failed:', error.response?.data || error.message);
      return res.json({ needsRefresh: true, error: 'Token refresh failed' });
    }
  }

  res.json({ needsRefresh: false });
});

module.exports = router;
