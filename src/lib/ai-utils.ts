import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';

// --- Environment Variables ---
const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

if (!GEMINI_API_KEY) {
  throw new Error('GEMINI_API_KEY environment variable is not set');
}

// --- Google AI Configuration ---
const genAI = new GoogleGenerativeAI(GEMINI_API_KEY);
const model = genAI.getGenerativeModel({
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json'
  }
});

const softSkillsForAnalysis = [
    "ارتباطات",
    "کار تیمی",
    "حل مسئله",
    "رهبری",
    "اخلاق کاری",
    "سازگاری",
    "هوش هیجانی",
    "تفکر انتقادی"
];

// --- Helper Functions ---
function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (error) {
    const match = text.match(/```json\n([\s\S]*?)\n```/);
    if (match && match[1]) {
      try {
        return JSON.parse(match[1]);
      } catch (e) {
        console.warn('Failed to parse extracted JSON from markdown:', e);
      }
    }
    const broaderMatch = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (broaderMatch) {
      try {
        return JSON.parse(broaderMatch[0]);
      } catch (e) {
         console.warn('Failed to parse extracted JSON with broad match:', e);
      }
    }
    console.error("No valid JSON found in the AI response text:", text);
    throw new Error('No valid JSON found in response');
  }
}

// --- AI Generation Functions ---
export async function getMultiTurnAIResponse(
  characters: any[],
  userName: string,
  rawChatHistory: any[],
  userResponseCount: number
): Promise<{ messages: { character: string; content: string }[] }> {

  const fullHistoryText = rawChatHistory.map(msg => `${msg.character}: ${msg.content}`).join('\n');

  const systemPrompt = `
    You are an AI assistant managing a business meeting simulation.
    Characters:
    - آقای توحیدی (مدیر بخش): Practical, cautious, focused on budget and timeline.
    - سارا (طراح تیم): Creative, idea-driven, focused on user experience and innovation.
    - احمد (مسئول کیفیت): Detail-oriented, risk-averse, focused on standards and stability.
    - The user's name in this scenario is "${userName}".

    Rules:
    1. Continue the conversation dynamically and naturally based on the user's last response. Characters should react to each other and to the user.
    2. The conversation flow should be natural. Avoid having multiple characters ask the user a question at the same time.
    3. Keep the conversation focused on the main scenario topic (deciding on a product update).
    4. At the end of your response, ONE character must ask a direct question to the user ("${userName}").
    5. User has responded ${userResponseCount} times. The conversation should conclude after 3 user responses.

    Full conversation history so far:
    ---
    ${fullHistoryText}
    ---

    Your Task:
    Generate the next part of the conversation as a JSON object. Your response should contain between 1 to 3 messages from the AI characters.
    The output must be a valid JSON object with a single key "messages".
    Example format: { "messages": [{ "character": "Character Name", "content": "Message text" }] }
  `;
  
  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    const parsedJson = safeJsonParse(text);

    let responseMessages = [];

    if (parsedJson && Array.isArray(parsedJson.messages)) {
        responseMessages = parsedJson.messages;
    } else if (parsedJson && Array.isArray(parsedJson.conversation)) { // Fallback
        responseMessages = parsedJson.conversation.map((msg: any) => ({
            character: msg.speaker || 'ناشناس',
            content: msg.utterance || ''
        }));
    } else if (parsedJson && Array.isArray(parsedJson.dialogue)) { // Fallback
         responseMessages = parsedJson.dialogue.map((msg: any) => ({
            character: msg.character || 'ناشناس',
            content: msg.content || ''
        }));
    }

    if (responseMessages.length > 0) {
      return {
        messages: responseMessages
      };
    }
    
    console.warn('AI response did not match any expected format:', parsedJson);
    return { messages: [{ character: 'System', content: 'خطا در پردازش پاسخ AI.' }] };

  } catch (error) {
    console.error('AI Generation Error in getDynamicMultiTurnAIResponse:', error);
    return { messages: [{ character: 'System', content: 'خطای ارتباط با هوش مصنوعی.' }] };
  }
}

export async function analyzeSoftSkills(chatHistoryText: string): Promise<{ analysis: { subject: string; score: number; reasoning: string }[] }> {
    const systemPrompt = `
    You are a senior HR analyst. Your task is to analyze the full transcript of a business meeting and score the user's performance based on 8 key soft skills.
    Scoring must be on a scale of -5 (very poor) to +5 (excellent) for each skill.

    Full conversation transcript:
    ---
    ${chatHistoryText}
    ---

    Skills to analyze:
    1.  "ارتباطات" (Communication): How clearly and logically does the user express their ideas?
    2.  "کار تیمی" (Teamwork): How well does the user collaborate and respect others' opinions?
    3.  "حل مسئله" (Problem-Solving): Does the user offer practical and logical solutions?
    4.  "رهبری" (Leadership): Does the user take initiative, persuade, or guide the conversation?
    5.  "اخلاق کاری" (Work Ethic): How responsible and committed is the user to the meeting's goals?
    6.  "سازگاری" (Adaptability): How well does the user adapt to new ideas or changing circumstances?
    7.  "هوش هیجانی" (Emotional Intelligence): Does the user show awareness of their own and others' emotions?
    8.  "تفکر انتقادی" (Critical Thinking): Does the user analyze issues deeply and question assumptions?

    Your Task:
    For each of the 8 skills above, provide a numerical score between -5 and +5 and a short explanation (maximum 20 words) in Persian for the reason behind that score.

    The output must be **only** a JSON object with the key "analysis", whose value is an array of 8 objects. Each object must contain "subject", "score", and "reasoning".
  `;
  try {
    const result = await model.generateContent(systemPrompt);
    const response = await result.response;
    const text = response.text();
    const parsedJson = safeJsonParse(text);
    if (parsedJson && Array.isArray(parsedJson.analysis) && parsedJson.analysis.length === 8) {
      return parsedJson;
    }
    console.warn('Final analysis response did not match expected format:', parsedJson);
    return {
      analysis: softSkillsForAnalysis.map(skill => ({
        subject: skill,
        score: 0,
        reasoning: "خطا در تحلیل هوش مصنوعی."
      }))
    };
  } catch (error) {
    console.error('AI Final Analysis Error:', error);
    return {
      analysis: softSkillsForAnalysis.map(skill => ({
        subject: skill,
        score: 0,
        reasoning: "خطا در تحلیل هوش مصنوعی."
      }))
    };
  }
}

// --- Session Management ---
export function generateSessionId(): string {
  return uuidv4();
}

