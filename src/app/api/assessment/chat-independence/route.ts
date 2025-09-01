import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import { chatRequestSchema } from '@/lib/validation';
import {
  getIndependenceQuestionnaireData,
  generateFinalAnalysis
} from '@/lib/ai-utils';
import { getConnectionWithRetry } from '@/lib/database';

// تابع تحلیل پاسخ کاربر بر اساس کلمات کلیدی
async function analyzeUserResponse(message: string, dimensions: any[], questionnaireData: any) {
  try {
    console.log('🔍 Analyzing message for dimensions:', dimensions);
    const analysisResults = dimensions.map(dimensionId => {
      const dimensionKeywords = questionnaireData.analysis_keywords[dimensionId];
      if (!dimensionKeywords) {
        return {
          dimension: `dimension_${dimensionId}`,
          score: 0,
          reasoning: `کلمات کلیدی برای این بعد یافت نشد.`
        };
      }

      const lowerCaseMessage = message.toLowerCase();
      const agreeMatch = dimensionKeywords.agree.some((keyword: string) => lowerCaseMessage.includes(keyword));
      const disagreeMatch = dimensionKeywords.disagree.some((keyword: string) => lowerCaseMessage.includes(keyword));

      let score = 0;
      let reasoning = "پاسخ کاربر خنثی یا نامشخص بود.";

      if (agreeMatch && !disagreeMatch) {
        score = 2;
        reasoning = "کاربر با این بعد موافقت کرد.";
      } else if (disagreeMatch && !agreeMatch) {
        score = 1;
        reasoning = "کاربر با این بعد مخالفت کرد.";
      }

      // اعمال امتیازدهی معکوس در صورت نیاز
      const reverseScoredIds = [1, 3, 5];
      if (reverseScoredIds.includes(dimensionId)) {
        if (score === 2) score = 1;
        else if (score === 1) score = 2;
      }
      
      return {
        dimension: `dimension_${dimensionId}`,
        score: score,
        reasoning: reasoning
      };
    });

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

    // === Find or Create Assessment ===
    console.log('📋 Finding/creating assessment...');
    let assessment;
    try {
      const questionnaireId = 1; // Hardcoded for Independence assessment
      
      console.log(`[DEBUG] Searching for active assessment for user_id: ${userId}, questionnaire_id: ${questionnaireId}`);
      const [assessments] = await connection.execute(
        'SELECT * FROM assessments WHERE user_id = ? AND questionnaire_id = ? AND completed_at IS NULL ORDER BY created_at DESC LIMIT 1',
        [userId, questionnaireId]
      );
      
      if (!Array.isArray(assessments) || assessments.length === 0) {
        console.log('⚠️ No active assessment found. Creating a new one.');
        const [result] = await connection.execute(
          'INSERT INTO assessments (user_id, questionnaire_id, score, created_at) VALUES (?, ?, ?, NOW())',
          [userId, questionnaireId, 0]
        );
        const newAssessmentId = (result as any).insertId;
        const [newAssessments] = await connection.execute('SELECT * FROM assessments WHERE id = ?', [newAssessmentId]);
        assessment = (newAssessments as any[])[0];
      } else {
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

    // === Save User Message ===
    console.log('💬 Saving user message...');
    try {
      await connection.execute(
        'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name) VALUES (?, ?, ?, ?, ?)',
        [assessment.id, userId, 'user', message, 'User']
      );
      console.log('✅ User message saved.');
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
        'SELECT COUNT(*) as count FROM chat_messages WHERE assessment_id = ? AND message_type = ?',
        [assessment.id, 'user']
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

    // === Analyze Response ===
    const currentPart = questionnaireData.scenario_parts[answeredQuestionIndex];
    const dimensionsToAnalyze = currentPart?.dimensions_to_analyze || [];
    
    let analysis = [];
    if (dimensionsToAnalyze.length > 0) {
      try {
        analysis = await analyzeUserResponse(message, dimensionsToAnalyze, questionnaireData);
        console.log('✅ Analysis completed:', analysis);
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
      
      const finalAnalysis = generateFinalAnalysis(currentScore, {}, questionnaireData);
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
      const dialogue = nextPart.dialogue.map((item: any) => ({
        ...item,
        content: item.content.replace(/{user_name}/g, userName)
      }));

      // === Save AI Messages ===
      console.log('🤖 Saving AI messages...');
      try {
        for (const item of dialogue) {
          await connection.execute(
            'INSERT INTO chat_messages (assessment_id, user_id, message_type, content, character_name) VALUES (?, ?, ?, ?, ?)',
            [assessment.id, userId, 'ai', item.content, item.character]
          );
        }
        console.log('✅ AI messages saved.');
      } catch (aiSaveError: any) {
        console.error('❌ Failed to save AI messages:', aiSaveError.message);
      }

      console.log('✅ === SENDING NEXT PART ===');
      return NextResponse.json({
        success: true,
        message: 'بخش بعدی سناریو شروع شد',
        data: {
          type: "ai_turn",
          messages: dialogue,
          current_score: currentScore,
          session_id: session_id,
          current_part: nextPartIndex
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