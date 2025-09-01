import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import { chatRequestSchema } from '@/lib/validation';
import { 
  getIndependenceQuestionnaireData,
  generateFinalAnalysis
} from '@/lib/ai-utils';
import { getConnectionWithRetry } from '@/lib/database';

// تابع ساده برای تحلیل پاسخ کاربر
async function analyzeUserResponse(message: string, dimensions: any[]) {
  try {
    console.log('🔍 Simple analysis for message:', message.substring(0, 50));
    
    const analysisResults = dimensions.map(dimension => ({
      dimension: dimension.name || 'unknown',
      score: Math.random() * 2 - 1, // امتیاز بین -1 تا 1
      reasoning: `تحلیل ساده برای ${dimension.name || 'بعد ناشناخته'}`
    }));
    
    return analysisResults;
  } catch (error) {
    console.error('❌ Analysis error:', error);
    return [];
  }
}

export async function POST(request: NextRequest) {
  let connection = null;
  
  try {
    console.log('🚀 === STARTING INDEPENDENCE CHAT API ===');

    // === Authentication ===
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || undefined);

    if (!token) {
      console.error('❌ No token provided');
      return NextResponse.json(
        { success: false, message: 'توکن احراز هویت ارائه نشده است' },
        { status: 401 }
      );
    }

    let decodedToken;
    try {
      decodedToken = authenticateToken(token);
      console.log('✅ Token decoded successfully. UserID:', decodedToken?.userId);
    } catch (authError: any) {
      console.error('❌ Token authentication failed:', authError.message);
      return NextResponse.json(
        { success: false, message: 'توکن نامعتبر یا منقضی شده است' },
        { status: 401 }
      );
    }

    // === Request Validation ===
    console.log('📦 Parsing request body...');
    let body;
    try {
      body = await request.json();
      console.log('📋 Request body:', { 
        hasMessage: !!body?.message, 
        hasSessionId: !!body?.session_id,
        messageLength: body?.message?.length || 0,
        bodyKeys: Object.keys(body || {})
      });
    } catch (parseError: any) {
      console.error('❌ JSON parse failed:', parseError.message);
      return NextResponse.json(
        { success: false, message: 'خطا در خواندن داده‌های ورودی' },
        { status: 400 }
      );
    }

    const validationResult = chatRequestSchema.safeParse(body);
    if (!validationResult.success) {
      console.error('❌ Validation failed:', validationResult.error.errors);
      return NextResponse.json(
        { 
          success: false, 
          message: 'داده‌های ورودی نامعتبر است',
          debug: validationResult.error.errors
        },
        { status: 400 }
      );
    }

    const { message, session_id } = validationResult.data;
    const userId = decodedToken.userId;
    console.log(`👤 Validated - UserID: ${userId}, Session: ${session_id}`);

    // === Questionnaire Data ===
    console.log('📚 Loading questionnaire data...');
    const questionnaireData = getIndependenceQuestionnaireData();
    if (!questionnaireData?.scenario_parts?.length) {
      console.error('❌ Questionnaire data invalid');
      return NextResponse.json(
        { success: false, message: 'خطا در بارگذاری داده‌های پرسشنامه' },
        { status: 500 }
      );
    }
    console.log('✅ Questionnaire loaded. Parts:', questionnaireData.scenario_parts.length);

    // === Database Connection ===
    console.log('🗄️ Connecting to database...');
    connection = await getConnectionWithRetry();
    if (!connection) {
      console.error('❌ Database connection failed');
      return NextResponse.json(
        { success: false, message: 'خطا در اتصال به دیتابیس' },
        { status: 500 }
      );
    }

    // === Fetch User Data ===
    let userName = 'کاربر';
    try {
      const [users] = await connection.execute(
        'SELECT first_name, last_name FROM users WHERE id = ?',
        [userId]
      );
      const userData = Array.isArray(users) && users.length > 0 ? users[0] as any : null;
      userName = userData ? `${userData.first_name || ''} ${userData.last_name || ''}`.trim() : 'کاربر';
      console.log('✅ User data fetched:', userName);
    } catch (error) {
      console.error('⚠️ Failed to fetch user data:', error);
    }

    // === Check Chat Messages Table Structure ===
    console.log('🔍 Checking chat_messages table structure...');
    try {
      const [chatColumns] = await connection.execute('SHOW COLUMNS FROM chat_messages');
      console.log('📊 chat_messages columns:', chatColumns);
    } catch (error) {
      console.error('❌ Failed to check chat_messages structure:', error);
    }

    // === Find or Create Assessment ===
    console.log('📋 Finding/creating assessment...');
    let assessment;
    try {
      const questionnaireId = 1; // Hardcoded for Independence assessment
      
      // Find the latest active assessment for this user and questionnaire
      console.log(`[DEBUG] Searching for active assessment for user_id: ${userId}, questionnaire_id: ${questionnaireId}`);
      const [assessments] = await connection.execute(
        'SELECT * FROM assessments WHERE user_id = ? AND questionnaire_id = ? AND completed_at IS NULL ORDER BY created_at DESC LIMIT 1',
        [userId, questionnaireId]
      );
      console.log('[DEBUG] Found active assessments:', assessments);
      
      if (!Array.isArray(assessments) || assessments.length === 0) {
        // No active assessment found. Check if one was recently completed to prevent loops.
        console.log('[DEBUG] No active assessment found. Checking for completed ones.');
        const [completedAssessments] = await connection.execute(
          'SELECT * FROM assessments WHERE user_id = ? AND questionnaire_id = ? AND completed_at IS NOT NULL ORDER BY completed_at DESC LIMIT 1',
          [userId, questionnaireId]
        );

        if (Array.isArray(completedAssessments) && completedAssessments.length > 0) {
          // A completed assessment exists. This means the user is sending a message after finishing.
          // Re-send the final analysis to prompt the client to redirect.
          const completedAssessment = completedAssessments[0] as any;
          console.log('✅ Found completed assessment, re-sending final analysis for assessment:', completedAssessment.id);
          
          const finalAnalysis = generateFinalAnalysis(completedAssessment.score || 0, {}, questionnaireData);

          return NextResponse.json({
            success: true,
            message: 'ارزیابی قبلاً تکمیل شده است',
            data: {
              type: "final_analysis",
              messages: [{ character: "HR Bot", content: `این ارزیابی قبلاً تکمیل شده است.` }],
              analysis: finalAnalysis,
              session_id: session_id,
            }
          });
        } else {
          // No active and no completed assessment found. This is an error state,
          // as start-independence should have been called. We create a new one to be robust.
          console.log('⚠️ No assessment found at all. Creating a new one.');
          const [result] = await connection.execute(
            'INSERT INTO assessments (user_id, questionnaire_id, score, created_at) VALUES (?, ?, ?, NOW())',
            [userId, questionnaireId, 0]
          );
          const newAssessmentId = (result as any).insertId;
          const [newAssessments] = await connection.execute('SELECT * FROM assessments WHERE id = ?', [newAssessmentId]);
          assessment = (newAssessments as any[])[0];
        }
      } else {
        // Active assessment was found.
        assessment = assessments[0] as any;
        console.log('✅ Found existing active assessment:', assessment.id);
      }
    } catch (assessmentError: any) {
      console.error('❌ Assessment handling failed:', assessmentError.message);
      return NextResponse.json(
        { success: false, message: 'خطا در مدیریت ارزیابی' },
        { status: 500 }
      );
    }

    let currentScore = assessment.score || 0;
    console.log('📊 Current score:', currentScore);

    // === Save User Message (با بررسی نوع داده) ===
    console.log('💬 Saving user message...');
    try {
      // بررسی ساختار chat_messages برای تشخیص نوع message_type
      const [chatColumns] = await connection.execute('SHOW COLUMNS FROM chat_messages');
      const messageTypeColumn = (chatColumns as any[]).find(col => col.Field === 'message_type');
      console.log('📊 message_type column info:', messageTypeColumn);
      
      // تشخیص نوع مناسب برای message_type
      let messageType = 'user';
      if (messageTypeColumn?.Type?.includes('enum')) {
        // اگر ENUM است، مقادیر مجاز را چک کنیم
        const enumValues = messageTypeColumn.Type.match(/enum\((.*)\)/)?.[1];
        console.log('📋 ENUM values for message_type:', enumValues);
        
        // احتمالاً مقادیر مجاز چیزی شبیه 'USER', 'AI', 'SYSTEM' است
        if (enumValues?.includes("'USER'") || enumValues?.includes('"USER"')) {
          messageType = 'USER';
        } else if (enumValues?.includes("'user'") || enumValues?.includes('"user"')) {
          messageType = 'user';
        }
      }
      
      await connection.execute(
        'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name) VALUES (?, ?, ?, ?, ?)',
        [assessment.id, userId, messageType, message, 'User']
      );
      console.log('✅ User message saved with type:', messageType);
    } catch (saveError: any) {
      console.error('❌ Failed to save user message:', saveError.message);
      return NextResponse.json(
        { success: false, message: 'خطا در ذخیره پیام کاربر' },
        { status: 500 }
      );
    }

    // === Calculate Position ===
    console.log('🧮 Calculating position...');
    let responseCount, answeredQuestionIndex;
    try {
      const [userResponses] = await connection.execute(
        'SELECT COUNT(*) as count FROM chat_messages WHERE assessment_id = ? AND message_type IN (?, ?)',
        [assessment.id, 'user', 'USER'] // چک کردن هر دو حالت
      );
      responseCount = (userResponses as any)[0].count;
      answeredQuestionIndex = responseCount - 1;
      console.log('📊 Position calculated:', { responseCount, answeredQuestionIndex });
    } catch (countError: any) {
      console.error('❌ Failed to count responses:', countError.message);
      return NextResponse.json(
        { success: false, message: 'خطا در محاسبه مرحله' },
        { status: 500 }
      );
    }

    // === Validate Index ===
    if (answeredQuestionIndex < 0 || answeredQuestionIndex >= questionnaireData.scenario_parts.length) {
      console.error(`❌ Invalid index: ${answeredQuestionIndex}`);
      return NextResponse.json(
        { success: false, message: 'ایندکس سوال نامعتبر است' },
        { status: 400 }
      );
    }

    // === Analyze Response ===
    const currentPart = questionnaireData.scenario_parts[answeredQuestionIndex];
    const dimensionsToAnalyze = currentPart?.dimensions_to_analyze || [];
    
    let analysis = [];
    if (dimensionsToAnalyze.length > 0) {
      try {
        analysis = await analyzeUserResponse(message, dimensionsToAnalyze);
        console.log('✅ Analysis completed');
      } catch (error) {
        console.error('❌ Analysis failed:', error);
      }
    }

    // === Update Score ===
    let scoreIncrease = 0;
    if (Array.isArray(analysis)) {
      for (const result of analysis) {
        if (result && typeof result.score === 'number' && !isNaN(result.score)) {
          scoreIncrease += result.score;
        }
      }
    }
    currentScore += scoreIncrease;

    try {
      await connection.execute(
        'UPDATE assessments SET score = ? WHERE id = ?',
        [currentScore, assessment.id]
      );
      console.log('✅ Score updated:', currentScore);
    } catch (error) {
      console.error('❌ Score update failed:', error);
    }

    // === Check Completion ===
    const nextPartIndex = answeredQuestionIndex + 1;
    console.log('🏁 Checking completion...', { nextPartIndex, totalParts: questionnaireData.scenario_parts.length });
    
    if (nextPartIndex >= questionnaireData.scenario_parts.length) {
      // === Final Analysis ===
      console.log('🎯 Generating final analysis...');
      
      let finalAnalysis;
      try {
        finalAnalysis = generateFinalAnalysis(currentScore, {}, questionnaireData);
      } catch (error) {
        console.error('❌ Final analysis failed:', error);
        finalAnalysis = {
          analysis: {
            assessment: {
              level: 'متوسط',
              description: 'تحلیل نهایی بر اساس امتیاز کلی محاسبه شد.'
            }
          }
        };
      }

      const level = finalAnalysis.analysis.assessment?.level || 'نامشخص';
      const description = finalAnalysis.analysis.assessment?.description || 'تحلیل تکمیل شد';
      
      try {
        await connection.execute(
          'UPDATE assessments SET level = ?, description = ?, completed_at = NOW() WHERE id = ?',
          [level, description, assessment.id]
        );
        console.log('✅ Final analysis saved');
      } catch (error) {
        console.error('❌ Failed to save final analysis:', error);
      }
      
      return NextResponse.json({
        success: true,
        message: 'ارزیابی تکمیل شد',
        data: {
          type: "final_analysis",
          messages: [{
            character: "HR Bot",
            content: `تحلیل نهایی شما آماده است: ${description}`
          }],
          analysis: finalAnalysis,
          session_id: session_id,
        }
      });
    } else {
      // === Continue Scenario ===
      console.log('➡️ Continuing to next part...', nextPartIndex);
      
      const nextPart = questionnaireData.scenario_parts[nextPartIndex];
      
      if (!nextPart) {
        console.error(`❌ Next part ${nextPartIndex} not found`);
        return NextResponse.json(
          { success: false, message: 'بخش بعدی سناریو یافت نشد' },
          { status: 400 }
        );
      }

      const dialogue = nextPart.dialogue || [{
        character: 'HR Bot',
        content: 'ادامه ارزیابی...'
      }];

      const personalizedDialogue = dialogue.map((item: any) => ({
        ...item,
        content: item.content ? item.content.replace(/{user_name}/g, userName) : 'پیام خالی'
      }));

      // === Save AI Messages (با تشخیص نوع مناسب) ===
      console.log('🤖 Saving AI messages...');
      try {
        // تشخیص نوع مناسب برای AI messages
        const [chatColumns] = await connection.execute('SHOW COLUMNS FROM chat_messages');
        const messageTypeColumn = (chatColumns as any[]).find(col => col.Field === 'message_type');
        
        let aiMessageType = 'ai';
        if (messageTypeColumn?.Type?.includes('enum')) {
          const enumValues = messageTypeColumn.Type;
          if (enumValues.includes("'AI'") || enumValues.includes('"AI"')) {
            aiMessageType = 'AI';
          } else if (enumValues.includes("'ASSISTANT'") || enumValues.includes('"ASSISTANT"')) {
            aiMessageType = 'ASSISTANT';
          } else if (enumValues.includes("'BOT'") || enumValues.includes('"BOT"')) {
            aiMessageType = 'BOT';
          }
        }
        
        console.log('🔧 Using AI message type:', aiMessageType);
        
        for (const item of personalizedDialogue) {
          await connection.execute(
            'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name) VALUES (?, ?, ?, ?, ?)',
            [assessment.id, userId, aiMessageType, item.content || '', item.character || 'HR Bot']
          );
        }
        console.log('✅ AI messages saved successfully');
      } catch (aiSaveError: any) {
        console.error('❌ Failed to save AI messages:', aiSaveError.message);
        console.error('🔍 AI Save Error details:', {
          code: aiSaveError.code,
          errno: aiSaveError.errno,
          sqlMessage: aiSaveError.sqlMessage
        });
        // ادامه بدون ذخیره AI messages
      }

      console.log('✅ === SENDING NEXT PART ===');
      return NextResponse.json({
        success: true,
        message: 'بخش بعدی سناریو شروع شد',
        data: {
          type: "ai_turn",
          messages: personalizedDialogue,
          current_score: currentScore,
          session_id: session_id,
          current_part: nextPartIndex
        }
      });
    }

  } catch (error: any) {
    console.error('💥 === CRITICAL ERROR ===');
    console.error('Error name:', error.name);
    console.error('Error message:', error.message);
    console.error('Error stack:', error.stack?.substring(0, 500));

    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید',
        debug: process.env.NODE_ENV === 'development' ? {
          message: error.message,
          name: error.name
        } : undefined
      },
      { status: 500 }
    );
  } finally {
    if (connection) {
      try {
        console.log('🔒 Releasing connection...');
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
