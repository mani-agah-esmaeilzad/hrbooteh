import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import { chatRequestSchema } from '@/lib/validation';
import { ConversationManager } from '@/lib/ai-conversations';
import { generateResponse, checkAnalysisReadiness, analyzeConversation, formatSystemPrompt } from '@/lib/ai-gemini';
import { getConnectionWithRetry } from '@/lib/database';

export async function POST(request: NextRequest) {
  let connection = null;
  
  try {
    console.log('🚀 === STARTING MR. AHMADI CHAT API ===');

    // === Authentication ===
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || undefined);

    if (!token) {
      return NextResponse.json(
        { success: false, message: 'توکن احراز هویت ارائه نشده است' },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = authenticateToken(token);
    } catch (authError: any) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر یا منقضی شده است' },
        { status: 401 }
      );
    }

    // === Request Validation ===
    let body;
    try {
      body = await request.json();
    } catch (parseError: any) {
      return NextResponse.json(
        { success: false, message: 'خطا در خواندن داده‌های ورودی' },
        { status: 400 }
      );
    }

    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'داده‌های ورودی نامعتبر است'
        },
        { status: 400 }
      );
    }

    const { message, session_id } = validationResult.data;
    const userId = decodedToken.userId;

    // === Database Connection ===
    connection = await getConnectionWithRetry();
    if (!connection) {
      return NextResponse.json(
        { success: false, message: 'خطا در اتصال به دیتابیس' },
        { status: 500 }
      );
    }

    // === Get Mr. Ahmadi Conversation Session ===
    const session = ConversationManager.getSession(session_id);
    if (!session) {
      return NextResponse.json(
        { success: false, message: 'جلسه گفتگو یافت نشد یا منقضی شده است' },
        { status: 404 }
      );
    }

    if (session.analysis_sent) {
      return NextResponse.json(
        { success: false, message: 'این جلسه تکمیل شده است' },
        { status: 400 }
      );
    }

    // === Find Assessment ===
    const [assessments] = await connection.execute(
      'SELECT * FROM assessments WHERE user_id = ? AND questionnaire_id = ? AND completed_at IS NULL ORDER BY created_at DESC LIMIT 1',
      [userId, 1] // 1 = Independence questionnaire
    );
    
    if (!Array.isArray(assessments) || assessments.length === 0) {
      return NextResponse.json(
        { success: false, message: 'ارزیابی یافت نشد. لطفاً ابتدا آزمون را شروع کنید.' },
        { status: 404 }
      );
    }
    
    const assessment = assessments[0] as any;

    // === Save User Message ===
    await connection.execute(
      'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
      [assessment.id, userId, 'user', message, 'کاربر']
    );

    // === Add Message to Mr. Ahmadi Session ===
    ConversationManager.addMessage(session_id, 'user', message.trim());

    // === Prepare Conversation for AI API ===
    const systemMessage = { role: 'user' as const, parts: [formatSystemPrompt(session.userName)] };
    const aiIntroMessage = { role: 'model' as const, parts: ['باشه، من آقای احمدی هستم.'] };
    const conversationHistory = ConversationManager.getHistoryForGemini(session_id);
    
    const conversationForAPI = [systemMessage, aiIntroMessage, ...conversationHistory];

    let aiResponse;
    let shouldAnalyze = false;
    
    try {
      // === Generate AI Response ===
      aiResponse = await generateResponse(message, conversationForAPI);
      
      if (!aiResponse) {
        throw new Error('پاسخ خالی از هوش مصنوعی');
      }

      // === Add AI Response to Session ===
      ConversationManager.addMessage(session_id, 'model', aiResponse);

      // === Save AI Message to Database ===
      await connection.execute(
        'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [assessment.id, userId, 'ai', aiResponse, 'آقای احمدی']
      );

      // === Check if Analysis Should Be Triggered ===
      if (ConversationManager.shouldTriggerAnalysis(session_id)) {
        try {
          const historyJson = ConversationManager.getHistoryAsJson(session_id);
          const analysisReady = await checkAnalysisReadiness(historyJson);
          
          if (analysisReady) {
            ConversationManager.updateStatus(session_id, 'analyzing');
            shouldAnalyze = true;
            
            // === Trigger Analysis ===
            try {
              const analysisResult = await analyzeConversation(historyJson);
              
              // === Mark Analysis as Sent and Complete Assessment ===
              ConversationManager.markAnalysisSent(session_id);
              
              await connection.execute(
                'UPDATE assessments SET description = ?, completed_at = NOW() WHERE id = ?',
                [analysisResult, assessment.id]
              );
              
              // === Save Analysis Message ===
              await connection.execute(
                'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
                [assessment.id, userId, 'analysis', analysisResult, 'سیستم تحلیل']
              );
              
              return NextResponse.json({
                success: true,
                message: 'گفتگو تکمیل شد و تحلیل نهایی آماده است',
                data: {
                  type: "final_analysis",
                  aiResponse: 'متشکرم. اطلاعات کافی برای یک ارزیابی اولیه به دست آوردم. لطفاً چند لحظه صبر کنید تا تحلیل نهایی را آماده کنم',
                  analysis: analysisResult,
                  sessionId: session_id,
                  timestamp: new Date().toISOString()
                }
              });
              
            } catch (analysisError) {
              console.error('خطا در انجام تحلیل:', analysisError);
              // Continue with normal response if analysis fails
            }
          }
        } catch (readinessError) {
          console.error('خطا در بررسی آمادگی تحلیل:', readinessError);
        }
      }

      // === Return Normal Response ===
      return NextResponse.json({
        success: true,
        message: 'پاسخ دریافت شد',
        data: {
          type: "mr_ahmadi_response",
          aiResponse: aiResponse,
          sessionId: session_id,
          shouldAnalyze: shouldAnalyze,
          status: session.status,
          timestamp: new Date().toISOString()
        }
      });

    } catch (aiError: any) {
      console.error('خطا در تولید پاسخ هوش مصنوعی:', aiError);
      
      // === Fallback Response ===
      const fallbackResponse = 'متاسفانه در این لحظه مشکلی در ارتباط با هوش مصنوعی وجود دارد. لطفاً دوباره تلاش کنید.';
      
      return NextResponse.json({
        success: false,
        message: fallbackResponse,
        data: {
          type: "error_response",
          aiResponse: fallbackResponse,
          sessionId: session_id,
          timestamp: new Date().toISOString()
        }
      });
    }

  } catch (error: any) {
    console.error('💥 === CRITICAL ERROR ===');
    console.error('Error message:', error.message);

    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید',
        debug: process.env.NODE_ENV === 'development' ? {
          message: error.message
        } : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        connection.release();
      } catch (error) {
        console.error('❌ Connection release failed:', error);
      }
    }
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Chat Independence API is available',
    timestamp: new Date().toISOString()
  });
}