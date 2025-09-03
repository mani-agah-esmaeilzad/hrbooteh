import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import { ConversationManager } from '@/lib/ai-conversations';
import { getConnectionWithRetry } from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // Authentication
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
    
    // Get user information for personalization
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
      
      // Create new Mr. Ahmadi conversation session
      const session = ConversationManager.createSession(userName, userId.toString());
      
      // Generate the opening message from Mr. Ahmadi
      const openingLine = "سلام {user_name}، خیلی خوشحالم که اینجایی. ممنون که وقت گذاشتی. ببین، ما قراره یه پروژه خیلی خاص رو شروع کنیم؛ یه سرویس ویژه برای مشتری‌های تاپِ شرکت. نمی‌خوام یه چیز معمولی باشه. راستش رو بخوای، من از روش‌های همیشگی و فرآیندهای فعلی شرکت کمی خسته‌ام و حس می‌کنم این چیزا خلاقیت رو می‌کشه. من به توانایی و دیدگاه تو اعتماد کامل دارم. فرض کن من این پروژه رو به طور کامل به خودت سپرده‌ام. بودجه اولیه و اختیار تام هم با شماست. فقط یک بوم سفید و یک هدف مشخص. شما به عنوان مسئول این پروژه، فردا صبح اولین قدمی که برمی‌داری چیست؟ برایم از اولین حرکتت بگو.";
      const finalOpening = openingLine.replace('{user_name}', userName);

      // Add the opening message to session history
      ConversationManager.addMessage(session.sessionId, 'model', finalOpening);
      
      // Create assessment record in database
      const [result] = await connection.execute(
        'INSERT INTO assessments (user_id, questionnaire_id, score, max_score, created_at) VALUES (?, ?, ?, ?, NOW())',
        [userId, 1, 0, 6] // Max score is 6 for independence assessment
      );

      const insertResult = result as any;
      const assessmentId = insertResult.insertId;
      
      // Store session mapping in assessment_states for tracking
      const sessionState = {
        sessionId: session.sessionId,
        type: 'mr_ahmadi_chat',
        assessmentId: assessmentId,
        userId: userId
      };

      await connection.execute(
        'INSERT INTO assessment_states (session_id, state_data, created_at) VALUES (?, ?, NOW())',
        [session.sessionId, JSON.stringify(sessionState)]
      );
      
      // Save opening message to database
      await connection.execute(
        'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, NOW())',
        [assessmentId, userId, 'ai', finalOpening, 'آقای احمدی']
      );
      
      return NextResponse.json({
        success: true,
        message: 'گفتگوی ارزیابی استقلال با آقای احمدی شروع شد',
        data: {
          type: "mr_ahmadi_chat",
          sessionId: session.sessionId,
          message: finalOpening,
          assessmentId: assessmentId,
          timestamp: new Date().toISOString()
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('خطا در شروع گفتگوی ارزیابی:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید' 
      },
      { status: 500 }
    );
  }
}
