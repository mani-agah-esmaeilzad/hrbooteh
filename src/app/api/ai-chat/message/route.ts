/**
 * API route for handling Mr. Ahmadi AI chat messages
 * Equivalent to the Python bot's message processing and response generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationManager } from '@/lib/ai-conversations';
import { generateResponse, checkAnalysisReadiness, formatSystemPrompt } from '@/lib/ai-gemini';

export async function POST(request: NextRequest) {
  console.log('Message API called');
  
  try {
    const body = await request.json();
    const { sessionId, message } = body;

    console.log('Request data:', { sessionId, message });

    // Validate input
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'شناسه جلسه الزامی است' },
        { status: 400 }
      );
    }

    if (!message || typeof message !== 'string') {
      return NextResponse.json(
        { error: 'پیام الزامی است' },
        { status: 400 }
      );
    }

    // Get session
    const session = ConversationManager.getSession(sessionId);
    if (!session) {
      console.log('Session not found:', sessionId);
      return NextResponse.json(
        { error: 'جلسه یافت نشد یا منقضی شده است' },
        { status: 404 }
      );
    }

    // Check if analysis has already been sent
    if (session.analysis_sent) {
      return NextResponse.json(
        { error: 'این جلسه تکمیل شده است' },
        { status: 400 }
      );
    }

    // Add user message to history
    ConversationManager.addMessage(sessionId, 'user', message.trim());
    console.log('Added user message to history');

    // Prepare conversation for AI API
    const systemMessage = { role: 'user' as const, parts: [formatSystemPrompt(session.userName)] };
    const aiIntroMessage = { role: 'model' as const, parts: ["باشه، من آقای احمدی هستم."] };
    const conversationHistory = ConversationManager.getHistoryForGemini(sessionId);
    
    const conversationForAPI = [systemMessage, aiIntroMessage, ...conversationHistory];
    console.log('Conversation for API:', conversationForAPI.length, 'messages');

    try {
      console.log('Generating AI response...');
      // Generate AI response
      const aiResponse = await generateResponse(message, conversationForAPI);
      
      if (!aiResponse) {
        throw new Error('پاسخ خالی از هوش مصنوعی');
      }

      console.log('AI response generated successfully');
      
      // Add AI response to history
      ConversationManager.addMessage(sessionId, 'model', aiResponse);

      // Check if we should trigger analysis
      let shouldAnalyze = false;
      if (ConversationManager.shouldTriggerAnalysis(sessionId)) {
        try {
          const historyJson = ConversationManager.getHistoryAsJson(sessionId);
          const analysisReady = await checkAnalysisReadiness(historyJson);
          
          if (analysisReady) {
            ConversationManager.updateStatus(sessionId, 'analyzing');
            shouldAnalyze = true;
            console.log('Analysis triggered');
          }
        } catch (analysisError) {
          console.error('Error checking analysis readiness:', analysisError);
          // Continue without analysis if there's an error
        }
      }

      return NextResponse.json({
        success: true,
        message: aiResponse,
        sessionId,
        timestamp: new Date().toISOString(),
        shouldAnalyze,
        status: session.status
      });

    } catch (aiError: any) {
      console.error('Error generating AI response:', aiError);
      
      // Return a fallback response
      const fallbackResponse = "متاسفانه در این لحظه مشکلی در ارتباط با هوش مصنوعی وجود دارد. لطفاً دوباره تلاش کنید.";
      
      // Add fallback to history too
      ConversationManager.addMessage(sessionId, 'model', fallbackResponse);
      
      return NextResponse.json({
        success: true, // Keep success true so frontend doesn't show error
        message: fallbackResponse,
        sessionId,
        timestamp: new Date().toISOString(),
        shouldAnalyze: false,
        status: session.status
      });
    }

  } catch (error: any) {
    console.error('Error processing message:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'خطا در پردازش پیام',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle GET request - simplified for debugging
export async function GET(request: NextRequest) {
  return NextResponse.json({
    message: 'GET method temporarily disabled for debugging',
    timestamp: new Date().toISOString()
  });
}

