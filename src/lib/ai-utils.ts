import { GoogleGenerativeAI } from '@google/generative-ai';
import { v4 as uuidv4 } from 'uuid';
import { getIndependenceQuestionnaireData } from './ai-scenarios';

// --- Environment Variables ---
const GOOGLE_API_KEY = process.env.GOOGLE_API_KEY;

if (!GOOGLE_API_KEY) {
  throw new Error('GOOGLE_API_KEY environment variable is not set');
}

// --- Google AI Configuration ---
const genAI = new GoogleGenerativeAI(GOOGLE_API_KEY);
const model = genAI.getGenerativeModel({ 
  model: 'gemini-1.5-flash',
  generationConfig: {
    responseMimeType: 'application/json'
  }
});

// --- Helper Functions ---
function safeJsonParse(text: string): any {
  try {
    return JSON.parse(text);
  } catch (error) {
    // Try to extract JSON from text
    const match = text.match(/\{[\s\S]*\}|\[[\s\S]*\]/);
    if (match) {
      try {
        return JSON.parse(match[0]);
      } catch (e) {
        console.warn('Failed to parse extracted JSON:', e);
      }
    }
    throw new Error('No valid JSON found in response');
  }
}

function normalizeAiResponse(parsedJson: any): any {
  const standardResponse: { type: string; messages: Array<{ content: string; character: string }> } = { 
    type: 'ai_turn', 
    messages: [] 
  };
  
  let messageList: any[] = [];
  if (Array.isArray(parsedJson)) {
    messageList = parsedJson;
  } else if (typeof parsedJson === 'object') {
    messageList = parsedJson.messages || parsedJson.dialogue || [];
  }
  
  for (const item of messageList) {
    if (typeof item === 'object' && item.content && item.character) {
      standardResponse.messages.push({
        content: String(item.content),
        character: String(item.character)
      });
    }
  }
  
  return standardResponse;
}

// --- AI Generation Functions ---
export async function generateDialogue(prompt: string, userName: string = 'کاربر', chatHistory: any[] = []): Promise<any> {
  try {
    // اضافه کردن تاریخچه چت به پرامپت
    let enhancedPrompt = prompt;
    if (chatHistory.length > 0) {
      const historyText = chatHistory.map(msg => `${msg.character}: ${msg.content}`).join('\n');
      enhancedPrompt = `تاریخچه چت قبلی:\n${historyText}\n\n${prompt}`;
    }
    
    const result = await model.generateContent(enhancedPrompt);
    const response = await result.response;
    const parsedResponse = safeJsonParse(response.text());
    
    return {
      dialogue: normalizeAiResponse(parsedResponse),
      rawAiResponse: response.text()
    };
  } catch (error: any) {
    console.error('AI Generation Error:', error);
    
    // Handle quota exceeded error
    if (error.status === 429) {
      console.warn('Google AI quota exceeded, using fallback response');
      return {
        dialogue: {
          type: 'ai_turn',
          messages: [
            { character: "آقای توحیدی", content: `دوستان، وقت بخیر. من فکر می‌کنم پروژه را باید دقیقاً مثل قبل اجرا کنیم، تغییر زیاد نیاز نیست.` },
            { character: "سارا", content: "ولی این یعنی درجا زدن. باید یک مسیر تازه امتحان کنیم که محصول را به‌روزتر کند." },
            { character: "احمد", content: `مسیر جدید یعنی ریسک بالا و هزینه بیشتر.` },
            { character: "خانم نوروزی", content: "با احمد موافقم. بودجه محدود است و نمی‌توانیم ریسک‌های غیرضروری بپذیریم." },
            { character: "سارا", content: "ولی اگر همیشه محافظه‌کار باشیم، هیچ‌وقت پیشرفت نمی‌کنیم!" },
            { character: "احمد", content: `شما، تو معمولاً روی ایده خودت می‌ایستی، حتی اگر همه مخالف باشن. این‌بار هم همین‌طور می‌کنی یا با اکثریت همراه می‌شی؟ چرا؟` }
          ]
        },
        rawAiResponse: "Fallback response due to quota exceeded"
      };
    }
    
    // Handle fetch failed error
    if (error.message && error.message.includes('fetch failed')) {
      console.warn('Network error, using fallback response');
      return {
        dialogue: {
          type: 'ai_turn',
          messages: [
            { character: "آقای توحیدی", content: `دوستان، وقت بخیر. من فکر می‌کنم پروژه را باید دقیقاً مثل قبل اجرا کنیم، تغییر زیاد نیاز نیست.` },
            { character: "سارا", content: "ولی این یعنی درجا زدن. باید یک مسیر تازه امتحان کنیم که محصول را به‌روزتر کند." },
            { character: "احمد", content: `مسیر جدید یعنی ریسک بالا و هزینه بیشتر.` },
            { character: "خانم نوروزی", content: "با احمد موافقم. بودجه محدود است و نمی‌توانیم ریسک‌های غیرضروری بپذیریم." },
            { character: "سارا", content: "ولی اگر همیشه محافظه‌کار باشیم، هیچ‌وقت پیشرفت نمی‌کنیم!" },
            { character: "احمد", content: `شما، تو معمولاً روی ایده خودت می‌ایستی، حتی اگر همه مخالف باشن. این‌بار هم همین‌طور می‌کنی یا با اکثریت همراه می‌شی؟ چرا؟` }
          ]
        },
        rawAiResponse: "Fallback response due to network error"
      };
    }
    
    return {
      dialogue: {
        type: 'ai_turn',
        messages: [{ character: 'System', content: 'متأسفانه خطایی رخ داد. لطفاً دوباره تلاش کنید.' }]
      },
      rawAiResponse: `ERROR: ${error}`
    };
  }
}

export async function analyzeResponse(prompt: string, userName: string = 'کاربر'): Promise<any> {
  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return safeJsonParse(response.text());
  } catch (error: any) {
    console.error('AI Analysis Error:', error);
    
    // Handle quota exceeded error with fallback analysis
    if (error.status === 429) {
      console.warn('Google AI quota exceeded, using fallback analysis');
      return {
        analysis: [
          { question_id: 1, score: 2, reasoning: `تحلیل خودکار: موافقت با تغییر و نوآوری` },
          { question_id: 2, score: 2, reasoning: `تحلیل خودکار: پافشاری روی نظر شخصی` }
        ]
      };
    }
    
    return { analysis: [] };
  }
}

// --- Session Management ---
export function generateSessionId(): string {
  return uuidv4();
}

// --- Re-export from ai-scenarios ---
export { getIndependenceQuestionnaireData } from './ai-scenarios';

// --- Final Analysis Function ---
export function generateFinalAnalysis(score: number, answers: Record<string, { score: number; reasoning: string }>, config: any) {
  const finalAssessment = { level: "Completed", description: `امتیاز نهایی شما: ${score}` };
  
  const interpretation = config.score_interpretation;
  if (interpretation) {
    for (const [key, value] of Object.entries(interpretation)) {
      try {
        if (key.includes("-")) {
          const [minS, maxS] = key.split("-").map(Number);
          if (score >= minS && score <= maxS) {
            finalAssessment.level = value as string;
            finalAssessment.description = value as string;
            break;
          }
        } else if (key.includes("+")) {
          const minS = parseInt(key.replace("+", ""));
          if (score >= minS) {
            finalAssessment.level = value as string;
            finalAssessment.description = value as string;
            break;
          }
        }
      } catch (error) {
        continue;
      }
    }
  }
  
  const questions = config.original_questions;
  
      // اگر answers خالی باشه، سوالات پیش‌فرض رو نشون بده
    let questionAnalysis: Array<{ question: string; score: number; reasoning: string }> = [];
    
    if (Object.keys(answers).length > 0) {
      const sortedItems = Object.entries(answers).sort(([a], [b]) => parseInt(a) - parseInt(b));
      questionAnalysis = sortedItems.map(([k, v]) => ({
        question: questions[parseInt(k) - 1]?.text || `سوال ${k}`,
        score: v.score,
        reasoning: v.reasoning
      }));
    } else {
      // نمایش سوالات پیش‌فرض با امتیاز ۰
      questionAnalysis = questions.map((q: any, index: number) => ({
        question: q.text,
        score: 0,
        reasoning: "پاسخ داده نشده"
      }));
    }
  
  const maxScore = config.scoring_rules.max_score;
  
  return {
    analysis: {
      totalScore: score,
      maxScore,
      questionAnalysis,
      assessment: finalAssessment
    }
  };
}
