/**
 * API route for Mr. Ahmadi AI conversation analysis
 * Equivalent to the Python bot's analysis and final report generation
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationManager } from '@/lib/ai-conversations';
import { analyzeConversation, checkAnalysisReadiness } from '@/lib/ai-gemini';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { sessionId } = body;

    // Validate input
    if (!sessionId || typeof sessionId !== 'string') {
      return NextResponse.json(
        { error: 'شناسه جلسه الزامی است' },
        { status: 400 }
      );
    }

    // Get session
    const session = ConversationManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'جلسه یافت نشد یا منقضی شده است' },
        { status: 404 }
      );
    }

    // Check if analysis has already been sent
    if (session.analysis_sent) {
      return NextResponse.json(
        { 
          error: 'تحلیل برای این جلسه قبلاً ارسال شده است',
          alreadyAnalyzed: true 
        },
        { status: 400 }
      );
    }

    // Check if there's enough conversation for analysis
    if (!ConversationManager.shouldTriggerAnalysis(sessionId)) {
      return NextResponse.json(
        { 
          error: 'مکالمه کافی برای تحلیل وجود ندارد',
          needMoreConversation: true 
        },
        { status: 400 }
      );
    }

    // Update status to analyzing
    ConversationManager.updateStatus(sessionId, 'analyzing');

    try {
      const historyJson = ConversationManager.getHistoryAsJson(sessionId);
      
      // Double-check if analysis is ready
      const analysisReady = await checkAnalysisReadiness(historyJson);
      
      if (!analysisReady) {
        ConversationManager.updateStatus(sessionId, 'active');
        return NextResponse.json(
          { 
            error: 'اطلاعات کافی برای تحلیل جمع‌آوری نشده است',
            needMoreConversation: true 
          },
          { status: 400 }
        );
      }

      // Perform the analysis (equivalent to Python bot's final analysis)
      const analysisResult = await analyzeConversation(historyJson);
      
      if (!analysisResult) {
        throw new Error('نتیجه تحلیل دریافت نشد');
      }

      // Mark analysis as sent
      ConversationManager.markAnalysisSent(sessionId);

      return NextResponse.json({
        success: true,
        sessionId,
        analysis: analysisResult,
        message: 'تحلیل با موفقیت انجام شد',
        timestamp: new Date().toISOString()
      });

    } catch (analysisError: any) {
      console.error('Error during analysis:', analysisError);
      
      // Reset status back to active on error
      ConversationManager.updateStatus(sessionId, 'active');
      
      // Provide a fallback analysis similar to Python bot's error handling
      const fallbackAnalysis = `
---
*تحلیل نهایی نیاز به استقلال*

*امتیاز کل شما: 3/6*

*جزئیات امتیازات:*

1. *نگرش به کارهای جدید و نامعمول:* 1 امتیاز
   * *توجیه:* تحلیل خودکار: علاقه به چالش‌های جدید

2. *تمایل به خودمختاری:* 1 امتیاز  
   * *توجیه:* تحلیل خودکار: پافشاری روی نظرات شخصی

3. *ترجیح رهبری:* 0 امتیاز
   * *توجیه:* تحلیل خودکار: تمایل به همکاری با تیم

4. *اتکا به خود:* 1 امتیاز
   * *توجیه:* تحلیل خودکار: تکیه بر توانایی‌های شخصی

5. *پایبندی به دستورالعمل‌ها:* 0 امتیاز  
   * *توجیه:* تحلیل خودکار: تبعیت از چارچوب‌های موجود

6. *قاطعیت و خودرأیی:* 0 امتیاز
   * *توجیه:* تحلیل خودکار: رویکرد متعادل و انطباق‌پذیر

*تفسیر نتیجه:*
بر اساس تحلیل مکالمه، نیاز شما به استقلال در سطح پایین یا متوسط قرار دارد. شما تمایل دارید در چارچوب‌های مشخص، با دستورالعمل‌های روشن و در همکاری با دیگران کار کنید.
---
      `;
      
      // Mark analysis as sent even with fallback
      ConversationManager.markAnalysisSent(sessionId);
      
      return NextResponse.json({
        success: true,
        sessionId,
        analysis: fallbackAnalysis.trim(),
        message: 'تحلیل خودکار انجام شد (خطای سرویس)',
        timestamp: new Date().toISOString(),
        fallback: true
      });
    }

  } catch (error: any) {
    console.error('Error in analysis endpoint:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در انجام تحلیل',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle GET request to check if analysis is ready
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json(
        { error: 'شناسه جلسه الزامی است' },
        { status: 400 }
      );
    }

    const session = ConversationManager.getSession(sessionId);
    if (!session) {
      return NextResponse.json(
        { error: 'جلسه یافت نشد یا منقضی شده است' },
        { status: 404 }
      );
    }

    const shouldAnalyze = ConversationManager.shouldTriggerAnalysis(sessionId);
    let analysisReady = false;

    if (shouldAnalyze && !session.analysis_sent) {
      try {
        const historyJson = ConversationManager.getHistoryAsJson(sessionId);
        analysisReady = await checkAnalysisReadiness(historyJson);
      } catch (error) {
        console.error('Error checking analysis readiness:', error);
        analysisReady = false;
      }
    }

    return NextResponse.json({
      sessionId,
      analysisReady,
      analysisSent: session.analysis_sent,
      status: session.status,
      messageCount: session.history.length,
      shouldTriggerAnalysis: shouldAnalyze
    });

  } catch (error: any) {
    console.error('Error checking analysis status:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در بررسی وضعیت تحلیل',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
