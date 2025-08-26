import { NextRequest, NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { z } from 'zod';
import { getConnectionWithRetry } from '@/lib/database';
import { getMBTIQuestionnaireData } from '@/lib/mbti-scenarios';
import { analyzeMBTIResponses } from '@/lib/mbti-analysis';

const chatRequestSchema = z.object({
  message: z.string().min(1, 'پیام نمی‌تواند خالی باشد'),
  session_id: z.string().min(1, 'شناسه جلسه الزامی است')
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const validatedData = chatRequestSchema.parse(body);
    const { message: userMessage, session_id: sessionId } = validatedData;

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

    const connection = await getConnectionWithRetry();
    if (!connection) {
      throw new Error('Failed to get database connection');
    }

    try {
      // دریافت اطلاعات کاربر
      const [users] = await connection.execute(
        'SELECT first_name, last_name FROM users WHERE id = ?',
        [userId]
      );
      
      const userData = Array.isArray(users) && users.length > 0 ? users[0] as any : null;
      const userName = userData ? `${userData.first_name} ${userData.last_name}`.trim() : 'کاربر';

      // دریافت وضعیت فعلی ارزیابی
      const [stateRows] = await connection.execute(
        'SELECT state_data FROM assessment_states WHERE session_id = ?',
        [sessionId]
      );

      if (!Array.isArray(stateRows) || stateRows.length === 0) {
        return NextResponse.json(
          { success: false, message: 'جلسه یافت نشد' },
          { status: 404 }
        );
      }

      const stateData = stateRows[0] as any;
      // اصلاح مشکل parsing
      let currentState;
      try {
        currentState = typeof stateData.state_data === 'string' 
          ? JSON.parse(stateData.state_data)
          : stateData.state_data;
      } catch (parseError) {
        console.error('Error parsing state_data:', parseError);
        console.log('Raw state_data:', stateData.state_data);
        return NextResponse.json(
          { success: false, message: 'خطا در خواندن وضعیت ارزیابی' },
          { status: 500 }
        );
      }

      // دریافت اطلاعات ارزیابی
      const [assessments] = await connection.execute(
        'SELECT id FROM assessments WHERE user_id = ? AND questionnaire_id = 2 ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      if (!Array.isArray(assessments) || assessments.length === 0) {
        return NextResponse.json(
          { success: false, message: 'ارزیابی یافت نشد' },
          { status: 404 }
        );
      }

      const assessment = assessments[0] as any;
      const assessmentId = assessment.id;

      // ذخیره پیام کاربر
      await connection.execute(
        'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
        [assessmentId, userId, 'user', userMessage, 'User', new Date()]
      );

      // تحلیل پاسخ کاربر و تولید پاسخ بعدی
      const mbtiData = getMBTIQuestionnaireData();
      const currentScenario = mbtiData.scenario_parts[currentState.current_part];
      
      if (currentState.current_part >= mbtiData.scenario_parts.length) {
        // پایان آزمون - تحلیل نهایی
        const [userAnswers] = await connection.execute(
          'SELECT content FROM chat_messages WHERE assessment_id = ? AND message_type = "user" ORDER BY created_at ASC',
          [assessmentId]
        );
        
        const responses = Array.isArray(userAnswers) ? userAnswers.map((answer: any) => answer.content) : [];
        
        console.log('MBTI Analysis - User responses count:', responses.length);
        
        const finalAnalysis = analyzeMBTIResponses(responses);
        
        // ذخیره نتیجه نهایی
        await connection.execute(
          'UPDATE assessments SET score = ?, analysis_result = ? WHERE id = ?',
          [8, JSON.stringify(finalAnalysis), assessmentId]
        );
        
        const finalMessage = {
          assessment_id: assessmentId,
          message_type: 'system',
          content: `تحلیل شخصیت شما کامل شد!\n\nنوع شخصیت: ${finalAnalysis.personality_type}\n\n${finalAnalysis.description}`,
          character: 'System',
          created_at: new Date()
        };
        
        await connection.execute(
          'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
          [finalMessage.assessment_id, userId, finalMessage.message_type, finalMessage.content, finalMessage.character, finalMessage.created_at]
        );
        
        return NextResponse.json({
          success: true,
          message: 'آزمون تکمیل شد',
          data: {
            type: "assessment_complete",
            final_analysis: finalAnalysis,
            messages: [{
              type: finalMessage.message_type,
              content: finalMessage.content,
              character: finalMessage.character,
              timestamp: finalMessage.created_at
            }]
          }
        });
      } else {
        // تحلیل پاسخ کاربر برای بعد فعلی
        const analysisResults = [{ dimension: currentScenario.dimensions_to_analyze[0], score: 1, reasoning: 'پاسخ کاربر ثبت شد' }];
        
        // به‌روزرسانی امتیازات
        for (const result of analysisResults) {
          if (currentState.mbti_scores.hasOwnProperty(result.dimension)) {
            currentState.mbti_scores[result.dimension] += result.score;
          }
        }
        
        // اضافه کردن به تاریخچه
        currentState.history.push({
          part: currentState.current_part,
          user_response: userMessage,
          analysis: analysisResults
        });
        
        // حرکت به بخش بعدی
        currentState.current_part += 1;
        
        // ذخیره وضعیت به‌روزرسانی شده
        await connection.execute(
          'UPDATE assessment_states SET state_data = ? WHERE session_id = ?',
          [JSON.stringify(currentState), sessionId]
        );
        
        // تولید پاسخ برای بخش بعدی
        const nextScenario = mbtiData.scenario_parts[currentState.current_part];
        const responseMessages = [];
        
        console.log('Next scenario check - current_part:', currentState.current_part, 'total scenarios:', mbtiData.scenario_parts.length);
        
        if (nextScenario) {
          // پیام سیستم برای بخش بعدی
          const personalizedSystemMessage = nextScenario.systemMessage.replace(/{user_name}/g, userName);
          
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
          
          responseMessages.push({
            type: systemMessageData.message_type,
            content: systemMessageData.content,
            character: systemMessageData.character,
            timestamp: systemMessageData.created_at
          });
          
          // سؤال بعدی
          const questionMessageData = {
            assessment_id: assessmentId,
            message_type: 'system',
            content: nextScenario.question,
            character: 'System',
            created_at: new Date()
          };
          
          await connection.execute(
            'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [questionMessageData.assessment_id, userId, questionMessageData.message_type, questionMessageData.content, questionMessageData.character, questionMessageData.created_at]
          );
          
          responseMessages.push({
            type: questionMessageData.message_type,
            content: questionMessageData.content,
            character: questionMessageData.character,
            timestamp: questionMessageData.created_at
          });
        } else {
          // پایان آزمون - تحلیل نهایی
          const [userAnswers] = await connection.execute(
            'SELECT content FROM chat_messages WHERE assessment_id = ? AND message_type = "user" ORDER BY created_at ASC',
            [assessmentId]
          );
          
          const responses = Array.isArray(userAnswers) ? userAnswers.map((answer: any) => answer.content) : [];
          
          console.log('Final analysis - User responses count:', responses.length);
          
          const finalAnalysis = analyzeMBTIResponses(responses);
          
          // ذخیره نتیجه نهایی
          await connection.execute(
            'UPDATE assessments SET score = ?, analysis_result = ? WHERE id = ?',
            [8, JSON.stringify(finalAnalysis), assessmentId]
          );
          
          const finalMessage = {
            assessment_id: assessmentId,
            message_type: 'system',
            content: `تحلیل شخصیت شما کامل شد!\n\nنوع شخصیت: ${finalAnalysis.personality_type}\n\n${finalAnalysis.description}`,
            character: 'System',
            created_at: new Date()
          };
          
          await connection.execute(
            'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name, created_at) VALUES (?, ?, ?, ?, ?, ?)',
            [finalMessage.assessment_id, userId, finalMessage.message_type, finalMessage.content, finalMessage.character, finalMessage.created_at]
          );
          
          return NextResponse.json({
            success: true,
            message: 'آزمون تکمیل شد',
            data: {
              type: "assessment_complete",
              final_analysis: finalAnalysis,
              redirect_url: '/mbti-results',
              messages: [{
                type: finalMessage.message_type,
                content: finalMessage.content,
                character: finalMessage.character,
                timestamp: finalMessage.created_at
              }]
            }
          });
        }

        return NextResponse.json({
          success: true,
          message: 'پیام دریافت شد',
          data: {
            type: "ai_turn",
            messages: responseMessages,
            session_id: sessionId,
            current_part: currentState.current_part
          }
        });
      }
    } catch (dbError) {
      console.error('Database error:', dbError);
      return NextResponse.json(
        { success: false, message: 'خطا در پردازش درخواست' },
        { status: 500 }
      );
    } finally {
      if (connection) {
        connection.release();
      }
    }

  } catch (error) {
    console.error('Chat MBTI error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, message: 'داده‌های ورودی نامعتبر', errors: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, message: 'خطای داخلی سرور' },
      { status: 500 }
    );
  }
}
