import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import { chatRequestSchema } from '@/lib/validation';
import { 
  getIndependenceQuestionnaireData,
  generateFinalAnalysis
} from '@/lib/ai-utils';
import { analyzeUserResponse } from '@/lib/ai-scenarios';
import { getConnectionWithRetry } from '@/lib/database';

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

    const body = await request.json();
    
    // اعتبارسنجی ورودی
    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'داده‌های ورودی نامعتبر است',
          error: validationResult.error.errors[0]?.message 
        },
        { status: 400 }
      );
    }

    const { message, session_id } = validationResult.data;
    const userId = decodedToken.userId;
    
    // دریافت اطلاعات کاربر برای شخصی‌سازی
    const connection = await getConnectionWithRetry();
    if (!connection) {
      throw new Error('Failed to get database connection');
    }
    
    try {
      // دریافت نام کاربر
      const [users] = await connection.execute(
        'SELECT first_name, last_name FROM users WHERE id = ?',
        [userId]
      );
      
      const userData = Array.isArray(users) && users.length > 0 ? users[0] as any : null;
      const userName = userData ? `${userData.first_name} ${userData.last_name}`.trim() : 'کاربر';
      
      const questionnaireData = getIndependenceQuestionnaireData();
      
      // دریافت وضعیت فعلی ارزیابی از دیتابیس
      const [assessments] = await connection.execute(
        'SELECT * FROM assessments WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (!Array.isArray(assessments) || assessments.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'ارزیابی فعالی یافت نشد' 
          },
          { status: 404 }
        );
      }

      const assessment = assessments[0] as any;
      const currentScore = assessment.score || 0;
      
      // محاسبه تعداد پاسخ‌های کاربر
      const [userResponses] = await connection.execute(
        'SELECT COUNT(*) as count FROM chat_messages WHERE assessment_id = ? AND message_type = "user"',
        [assessment.id]
      );
      
      const responseCount = Array.isArray(userResponses) && userResponses.length > 0 ? (userResponses[0] as any).count : 0;
      
      const currentQuestionIndex = responseCount; // هر پاسخ = یک بخش سناریو
      
      // بررسی پایان سناریو
      if (currentQuestionIndex >= questionnaireData.scenario_parts.length) {
        // سناریو تمام شده، تحلیل نهایی
        const [answers] = await connection.execute(
          'SELECT * FROM chat_messages WHERE assessment_id = ? ORDER BY created_at ASC',
          [assessment.id]
        );

        const answersMap: Record<string, { score: number; reasoning: string }> = {};
        if (Array.isArray(answers)) {
          // پردازش پاسخ‌ها و محاسبه امتیاز
          // این بخش نیاز به پیاده‌سازی دقیق‌تر دارد
        }

        const finalAnalysis = generateFinalAnalysis(currentScore, answersMap, questionnaireData);

        // به‌روزرسانی امتیاز نهایی
        await connection.execute(
          'UPDATE assessments SET score = ?, level = ?, description = ?, completed_at = NOW() WHERE id = ?',
          [currentScore, finalAnalysis.analysis.assessment.level, finalAnalysis.analysis.assessment.description, assessment.id]
        );

        return NextResponse.json({
          success: true,
          message: 'ارزیابی تکمیل شد',
          data: finalAnalysis
        });
      }

      // تحلیل پاسخ کاربر با استفاده از AI
      const currentPart = questionnaireData.scenario_parts[currentQuestionIndex];
      
      // تحلیل مستقیم پاسخ کاربر بدون کلیدواژه
      const analysis = analyzeUserResponse(message, currentPart.dimensions_to_analyze);

      // محاسبه امتیاز جدید
      let newScore = currentScore;
      if (analysis && Array.isArray(analysis)) {
        for (const result of analysis) {
          if (result && typeof result.score === 'number') {
            newScore += result.score;
          }
        }
      }

      // ذخیره پیام کاربر در دیتابیس
      await connection.execute(
        'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name) VALUES (?, ?, ?, ?, ?)',
        [assessment.id, userId, 'user', message, 'User']
      );

      // به‌روزرسانی امتیاز
      await connection.execute(
        'UPDATE assessments SET score = ? WHERE id = ?',
        [newScore, assessment.id]
      );

      // بررسی پایان سناریو
      if (currentQuestionIndex >= questionnaireData.scenario_parts.length - 1) {
        // سناریو تمام شده - بخش آخر
        const finalAnalysis = generateFinalAnalysis(newScore, {}, questionnaireData);
        
        await connection.execute(
          'UPDATE assessments SET level = ?, description = ?, completed_at = NOW() WHERE id = ?',
          [finalAnalysis.analysis.assessment.level, finalAnalysis.analysis.assessment.description, assessment.id]
        );

        return NextResponse.json({
          success: true,
          message: 'ارزیابی تکمیل شد',
          data: finalAnalysis
        });
      }

      // ادامه سناریو - تولید بخش بعدی
      const nextPartIndex = currentQuestionIndex + 1;
      
      if (nextPartIndex < questionnaireData.scenario_parts.length) {
        // بخش بعدی سناریو
        const nextPart = questionnaireData.scenario_parts[nextPartIndex];
        
        // شخصی‌سازی دیالوگ با نام کاربر
        const personalizedDialogue = nextPart.dialogue.map(dialogue => ({
          ...dialogue,
          content: dialogue.content.replace(/{user_name}/g, userName)
        }));
        
        // ذخیره پیام AI در دیتابیس
        for (const dialogue of personalizedDialogue) {
          await connection.execute(
            'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name) VALUES (?, ?, ?, ?, ?)',
            [assessment.id, userId, 'ai1', dialogue.content, dialogue.character]
          );
        }

        const response = {
          type: "ai_turn",
          messages: personalizedDialogue,
          current_score: newScore,
          session_id: session_id,
          current_part: nextPartIndex
        };

        return NextResponse.json({
          success: true,
          message: 'بخش بعدی سناریو شروع شد',
          data: response
        });
      } else {
        // سناریو تمام شده
        const finalAnalysis = generateFinalAnalysis(newScore, {}, questionnaireData);
        
        await connection.execute(
          'UPDATE assessments SET level = ?, description = ?, completed_at = NOW() WHERE id = ?',
          [finalAnalysis.analysis.assessment.level, finalAnalysis.analysis.assessment.description, assessment.id]
        );

        return NextResponse.json({
          success: true,
          message: 'ارزیابی تکمیل شد',
          data: finalAnalysis
        });
      }

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('خطا در پردازش چت:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید' 
      },
      { status: 500 }
    );
  }
}