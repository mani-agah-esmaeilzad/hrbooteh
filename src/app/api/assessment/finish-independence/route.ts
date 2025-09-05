import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import { ConversationManager } from '@/lib/ai-conversations';
import { analyzeConversation } from '@/lib/ai-gemini';
import { getConnectionWithRetry } from '@/lib/database';
import { z } from 'zod';

const finishRequestSchema = z.object({
  session_id: z.string(),
});

export async function POST(request: NextRequest) {
  let connection = null;
  
  try {
    console.log('🚀 === STARTING FINISH INDEPENDENCE API ===');

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

    const validationResult = finishRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'داده‌های ورودی نامعتبر است'
        },
        { status: 400 }
      );
    }

    const { session_id } = validationResult.data;
    const userId = decodedToken.userId;

    // === Database Connection ===
    connection = await getConnectionWithRetry();
    if (!connection) {
      return NextResponse.json(
        { success: false, message: 'خطا در اتصال به دیتابیس' },
        { status: 500 }
      );
    }

    // === Get Conversation Session ===
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

    // === Trigger Analysis ===
    try {
      const historyJson = ConversationManager.getHistoryAsJson(session_id);
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
          aiResponse: 'زمان شما به پایان رسید. تحلیل نهایی بر اساس مکالمات انجام شد.',
          analysis: analysisResult,
          sessionId: session_id,
          timestamp: new Date().toISOString()
        }
      });
      
    } catch (analysisError) {
      console.error('خطا در انجام تحلیل:', analysisError);
      return NextResponse.json(
        { success: false, message: 'خطا در انجام تحلیل' },
        { status: 500 }
      );
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
