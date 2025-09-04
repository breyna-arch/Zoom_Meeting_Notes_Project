const { Configuration, OpenAIApi } = require('openai');
require('dotenv').config();

class AIService {
  constructor() {
    const configuration = new Configuration({
      apiKey: process.env.OPENAI_API_KEY,
    });
    this.openai = new OpenAIApi(configuration);
  }

  /**
   * Generate meeting summary and action items from transcript
   * @param {string} transcript - The meeting transcript text
   * @returns {Promise<Object>} - Object containing summary and action items
   */
  async generateMeetingNotes(transcript) {
    try {
      const prompt = `You are a meeting assistant. Analyze the following meeting transcript and provide:
      1. A concise summary (5-7 bullet points)
      2. Action items in the format "Person → Task"
      
      Transcript:
      ${transcript}
      
      Format your response as a JSON object with the following structure:
      {
        "summary": ["point 1", "point 2", ...],
        "actionItems": ["Person → Task", ...]
      }`;

      const response = await this.openai.createChatCompletion({
        model: 'gpt-3.5-turbo',
        messages: [
          {
            role: 'system',
            content: 'You are a helpful meeting assistant that summarizes meetings and extracts action items.'
          },
          {
            role: 'user',
            content: prompt
          }
        ],
        temperature: 0.3,
        max_tokens: 1000,
      });

      // Parse the response content
      const content = response.data.choices[0]?.message?.content;
      if (!content) {
        throw new Error('No content in AI response');
      }

      // Try to parse the JSON response
      try {
        const result = JSON.parse(content);
        return {
          success: true,
          summary: result.summary || [],
          actionItems: result.actionItems || []
        };
      } catch (e) {
        console.error('Failed to parse AI response:', e);
        // Fallback to extracting content from text
        return this.extractNotesFromText(content);
      }
    } catch (error) {
      console.error('Error generating meeting notes:', error);
      return {
        success: false,
        error: error.message || 'Failed to generate meeting notes',
      };
    }
  }

  /**
   * Fallback method to extract notes from text if JSON parsing fails
   * @param {string} text - The AI response text
   * @returns {Object} - Extracted notes
   */
  extractNotesFromText(text) {
    const summary = [];
    const actionItems = [];
    
    // Split into lines and process
    const lines = text.split('\n').map(line => line.trim()).filter(line => line);
    
    let currentSection = null;
    
    for (const line of lines) {
      if (line.toLowerCase().includes('summary:') || line.toLowerCase().includes('summary')) {
        currentSection = 'summary';
      } else if (line.toLowerCase().includes('action') && line.toLowerCase().includes('item')) {
        currentSection = 'actionItems';
      } else if (currentSection === 'summary' && line.match(/^\d+[.)]/)) {
        summary.push(line.replace(/^\d+[.)]\s*/, '').trim());
      } else if (currentSection === 'actionItems' && line.includes('→')) {
        actionItems.push(line.trim());
      }
    }

    return {
      success: true,
      summary: summary.length > 0 ? summary : ['No summary could be generated.'],
      actionItems: actionItems.length > 0 ? actionItems : ['No action items could be identified.']
    };
  }

  /**
   * Transcribe audio using OpenAI's Whisper API
   * @param {Buffer} audioBuffer - Audio file buffer
   * @param {string} fileName - Name of the audio file
   * @returns {Promise<Object>} - Transcription result
   */
  async transcribeAudio(audioBuffer, fileName) {
    try {
      // Note: In a real implementation, you would use the OpenAI API to transcribe the audio
      // This is a placeholder for the actual implementation
      // const response = await this.openai.createTranscription(
      //   audioBuffer,
      //   'whisper-1',
      //   'The transcript of the meeting',
      //   'json'
      // );
      // return { success: true, text: response.data.text };
      
      // For now, return a mock response
      return {
        success: true,
        text: 'This is a placeholder for the actual transcription. In a real implementation, this would be the transcribed text from the audio.'
      };
    } catch (error) {
      console.error('Error transcribing audio:', error);
      return {
        success: false,
        error: error.message || 'Failed to transcribe audio',
      };
    }
  }
}

module.exports = new AIService();
