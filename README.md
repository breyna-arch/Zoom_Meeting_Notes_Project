# Zoom Meeting Notes Agent

A bot that joins Zoom meetings as a participant, captures the transcript, and generates meeting summaries and action items using AI.

## Features

- Join Zoom meetings programmatically
- Capture meeting transcripts in real-time
- Generate concise meeting summaries
- Extract action items with assignees
- Simple web interface for interaction
- Secure OAuth authentication with Zoom

## Prerequisites

- Node.js 16+ and npm
- Zoom Developer Account with OAuth app
- OpenAI API key

## Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/zoom-meeting-notes-agent.git
   cd zoom-meeting-notes-agent
   ```

2. **Backend Setup**
   ```bash
   cd backend
   cp .env.example .env
   ```
   - Fill in your Zoom API credentials and OpenAI API key in the `.env` file

3. **Install Dependencies**
   ```bash
   npm install
   ```

4. **Frontend Setup**
   ```bash
   cd ../frontend
   cp .env.example .env
   ```
   - Update the environment variables in the `.env` file
   ```bash
   npm install
   ```

## Running the Application

1. **Start the backend server**
   ```bash
   cd backend
   npm run dev
   ```

2. **Start the frontend development server**
   ```bash
   cd ../frontend
   npm start
   ```

3. Open your browser and navigate to `http://localhost:3000`

## Environment Variables

### Backend (`.env`)

```
# Zoom API Configuration
ZOOM_API_KEY=your_zoom_api_key
ZOOM_API_SECRET=your_zoom_api_secret
ZOOM_REDIRECT_URI=http://localhost:3000/auth/zoom/callback

# OpenAI Configuration
OPENAI_API_KEY=your_openai_api_key

# Server Configuration
PORT=3001
NODE_ENV=development
SESSION_SECRET=your_session_secret
FRONTEND_URL=http://localhost:3000
```

## Usage

1. Click on "Login with Zoom" to authenticate
2. Enter the Zoom Meeting ID and password
3. The bot will join the meeting and start capturing the transcript
4. After the meeting, view the generated summary and action items

## Development

### Project Structure

```
zoom-meeting-notes-agent/
├── backend/               # Backend server
│   ├── config/            # Configuration files
│   ├── routes/            # API routes
│   ├── server.js          # Main server file
│   └── package.json
├── frontend/              # React frontend
│   ├── public/
│   ├── src/
│   └── package.json
└── README.md
```

## License

MIT

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
