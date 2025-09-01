import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import { 
  getIndependenceQuestionnaireData, 
  generateSessionId,
  generateDialogue
} from '@/lib/ai-utils';
import pool, { getConnectionWithRetry } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // استخراج و تایید توکن
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || undefined);

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'توکن احراز هویت ارائه نشده است' 
        },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = authenticateToken(token);
    } catch (error) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'توکن نامعتبر یا منقضی شده است' 
        },
        { status: 401 }
      );
    }

    const userId = decodedToken.userId;
    
        // دریافت اطلاعات کاربر برای شخصی‌سازی
    const connection = await getConnectionWithRetry();
    if (!connection) {
      throw new Error('Failed to get database connection');
    }
    
    try {
      const [users] = await connection.execute(
        'SELECT first_name, last_name FROM users WHERE id = ?',
        [userId]
      );
      
      const userData = Array.isArray(users) && users.length > 0 ? users[0] as any : null;
      const userName = userData ? `${userData.first_name} ${userData.last_name}`.trim() : 'کاربر';
      
      const questionnaireData = getIndependenceQuestionnaireData();
      
      // ایجاد session ID جدید
      const sessionId = generateSessionId();
      
      // استفاده از دیالوگ‌های از پیش تعریف شده
      const firstPart = questionnaireData.scenario_parts[0];
      
      // ایجاد ارزیابی جدید در دیتابیس
      const [result] = await connection.execute(
        'INSERT INTO assessments (user_id, questionnaire_id, score, max_score) VALUES (?, ?, ?, ?)',
        [userId, 1, 0, questionnaireData.scoring_rules.max_score]
      );

      const insertResult = result as any;
      const assessmentId = insertResult.insertId;

      // DEBUG LOGGING
      console.log(`[DEBUG] Created assessment with ID: ${assessmentId}. Fetching it back to check completed_at.`);
      const [debugResult] = await connection.execute('SELECT * FROM assessments WHERE id = ?', [assessmentId]);
      console.log('[DEBUG] Fetched assessment:', debugResult);

      // ذخیره وضعیت اولیه در دیتابیس
      const initialState = {
        type: 'independence_scenario',
        score: 0,
        current_question_index: 0,
        answers: {},
        history: []
      };

      await connection.execute(
        'INSERT INTO assessment_states (session_id, state_data, created_at) VALUES (?, ?, NOW())',
        [sessionId, JSON.stringify(initialState)]
      );
      
      // شخصی‌سازی دیالوگ با نام کاربر
      const personalizedDialogue = firstPart.dialogue.map(dialogue => ({
        ...dialogue,
        content: dialogue.content.replace(/{user_name}/g, userName)
      }));
      
      // ذخیره دیالوگ اولیه در دیتابیس
      for (const dialogue of personalizedDialogue) {
        await connection.execute(
          'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name) VALUES (?, ?, ?, ?, ?)',
          [assessmentId, userId, 'ai1', dialogue.content, dialogue.character]
        );
      }
      
      // بازگرداندن دیالوگ اولیه
      const initialDialogue = {
        type: "ai_turn",
        messages: personalizedDialogue,
        session_id: sessionId,
        current_score: 0,
        assessment_id: assessmentId,
        current_part: 0
      };

      return NextResponse.json({
        success: true,
        message: 'سناریوی استقلال شروع شد',
        data: initialDialogue
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('خطا در شروع سناریو:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید' 
      },
      { status: 500 }
    );
  }
}
