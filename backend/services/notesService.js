const { OpenAI } = require('openai');

class NotesService {
  constructor() {
    this.openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });
  }

  async generateMeetingSummary(transcript) {
    try {
      const prompt = `You are an expert meeting assistant. Please provide a detailed summary of the following meeting transcript. 
      Include key discussion points, decisions made, and important context. Format the response in markdown with appropriate headings.
      
      Transcript:
      ${transcript}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "You are a helpful meeting assistant that provides clear, concise, and well-structured meeting summaries." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error generating meeting summary:', error);
      throw new Error('Failed to generate meeting summary');
    }
  }

  async extractActionItems(transcript) {
    try {
      const prompt = `Extract action items from the following meeting transcript. 
      For each action item, identify the person responsible and the task.
      Format the response as a markdown list with the following format:
      - [ ] **Task description** (Assigned to: Person, Due: Date if mentioned)
      
      Transcript:
      ${transcript}`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "You are an expert at identifying and extracting action items from meeting transcripts." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
      });

      return response.choices[0].message.content;
    } catch (error) {
      console.error('Error extracting action items:', error);
      throw new Error('Failed to extract action items');
    }
  }

  async generateMeetingTitle(transcript) {
    try {
      const prompt = `Generate a concise, descriptive title (maximum 5-7 words) for a meeting with the following transcript:
      
      ${transcript.substring(0, 500)}...`;

      const response = await this.openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [
          { role: "system", content: "You generate concise, descriptive titles for meetings based on their content." },
          { role: "user", content: prompt }
        ],
        temperature: 0.3,
        max_tokens: 30
      });

      // Clean up the response to ensure it's just the title
      let title = response.choices[0].message.content.trim();
      // Remove any quotes if present
      title = title.replace(/^["']|["']$/g, '');
      return title;
    } catch (error) {
      console.error('Error generating meeting title:', error);
      return 'Meeting Notes';
    }
  }
}

module.exports = new NotesService();
