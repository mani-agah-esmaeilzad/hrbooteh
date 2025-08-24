import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { getMBTIQuestionnaireData } from '@/lib/mbti-scenarios';
import { getConnectionWithRetry } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // احراز هویت کاربر
    const authHeader = request.headers.get('authorization');
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { success: false, message: 'توکن احراز هویت یافت نشد' },
        { status: 401 }
      );
    }

    const token = authHeader.substring(7);
    let userId: number;

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;
      userId = decoded.userId;
    } catch (error) {
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر است' },
        { status: 401 }
      );
    }
    
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
      
      const questionnaireData = getMBTIQuestionnaireData();
      
      // ایجاد session ID جدید
      const sessionId = `mbti_${userId}_${Date.now()}_${Math.random().toString(36).substring(2, 15)}`;
      
      // استفاده از دیالوگ‌های از پیش تعریف شده
      const firstPart = questionnaireData.scenario_parts[0];
      
      // ایجاد ارزیابی جدید در دیتابیس
      const [result] = await connection.execute(
        'INSERT INTO assessments (user_id, questionnaire_id, score, max_score) VALUES (?, ?, ?, ?)',
        [userId, 2, 0, questionnaireData.scoring_rules.max_score]
      );

      const insertResult = result as any;
      const assessmentId = insertResult.insertId;

      // ذخیره وضعیت اولیه در دیتابیس
      const initialState = {
        type: 'mbti_scenario',
        score: 0,
        current_part: 0,
        answers: {},
        history: [],
        mbti_scores: { E_I: 0, S_N: 0, T_F: 0, P_J: 0 }
      };

      await connection.execute(
        'INSERT INTO assessment_states (session_id, state_data, created_at) VALUES (?, ?, NOW())',
        [sessionId, JSON.stringify(initialState)]
      );
      
      // بارگذاری سناریوی اول
      const mbtiData = getMBTIQuestionnaireData();
      const firstScenario = mbtiData.scenario_parts[0];
      
      // ایجاد پیام‌های اولیه
      const initialMessages = [];
      
      // پیام سیستم
      const personalizedSystemMessage = firstScenario.systemMessage.replace(/{user_name}/g, userName);
      
      const systemMessageData = {
        assessment_id: assessmentId,
        message_type: 'system',
        content: personalizedSystemMessage,
        character: 'System',
        created_at: new Date()
      };
      
      await connection.execute(
        'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [systemMessageData.assessment_id, userId, systemMessageData.message_type, systemMessageData.content, systemMessageData.character, systemMessageData.created_at]
      );
      
      initialMessages.push({
        type: systemMessageData.message_type,
        content: systemMessageData.content,
        character: systemMessageData.character,
        timestamp: systemMessageData.created_at
      });
      
      // سؤال اول
      const questionMessageData = {
        assessment_id: assessmentId,
        message_type: 'system',
        content: firstScenario.question,
        character: 'System',
        created_at: new Date()
      };
      
      await connection.execute(
        'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [questionMessageData.assessment_id, userId, questionMessageData.message_type, questionMessageData.content, questionMessageData.character, questionMessageData.created_at]
      );
      
      initialMessages.push({
        type: questionMessageData.message_type,
        content: questionMessageData.content,
        character: questionMessageData.character,
        timestamp: questionMessageData.created_at
      });
      
      // بازگرداندن دیالوگ اولیه
      const initialDialogue = {
        type: "ai_turn",
        messages: initialMessages,
        session_id: sessionId,
        current_score: 0,
        assessment_id: assessmentId,
        current_part: 0
      };

      return NextResponse.json({
        success: true,
        message: 'آزمون شخصیت MBTI شروع شد',
        data: initialDialogue
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('خطا در شروع آزمون MBTI:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید' 
      },
      { status: 500 }
    );
  }
}
