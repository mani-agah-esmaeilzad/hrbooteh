/**
 * API route for starting Mr. Ahmadi AI conversation sessions
 * Equivalent to the Python bot's /start command
 */

import { NextRequest, NextResponse } from 'next/server';
import { ConversationManager } from '@/lib/ai-conversations';

export async function POST(request: NextRequest) {
  console.log('Starting new AI chat session');
  
  try {
    const body = await request.json();
    const { userName, userId } = body;

    console.log('Start session request:', { userName, userId });

    // Validate input
    if (!userName || typeof userName !== 'string') {
      return NextResponse.json(
        { error: 'نام کاربری الزامی است' },
        { status: 400 }
      );
    }

    // Create new conversation session
    const session = ConversationManager.createSession(userName, userId);
    console.log('Created session:', session.sessionId);

    // Generate the opening message (equivalent to the Python bot's opening line)
    const openingLine = "سلام {user_name}، خیلی خوشحالم که اینجایی. ممنون که وقت گذاشتی. ببین، ما قراره یه پروژه خیلی خاص رو شروع کنیم؛ یه سرویس ویژه برای مشتری‌های تاپِ شرکت. نمی‌خوام یه چیز معمولی باشه. راستش رو بخوای، من از روش‌های همیشگی و فرآیندهای فعلی شرکت کمی خسته‌ام و حس می‌کنم این چیزا خلاقیت رو می‌کشه. من به توانایی و دیدگاه تو اعتماد کامل دارم. فرض کن من این پروژه رو به طور کامل به خودت سپرده‌ام. بودجه اولیه و اختیار تام هم با شماست. فقط یک بوم سفید و یک هدف مشخص. شما به عنوان مسئول این پروژه، فردا صبح اولین قدمی که برمی‌داری چیست؟ برایم از اولین حرکتت بگو.";
    const finalOpening = openingLine.replace('{user_name}', userName);

    // Add the opening message to session history
    ConversationManager.addMessage(session.sessionId, 'model', finalOpening);
    console.log('Added opening message to session history');

    return NextResponse.json({
      success: true,
      sessionId: session.sessionId,
      message: finalOpening,
      timestamp: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Error starting AI chat session:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در شروع جلسه چت',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

// Handle GET request for session info
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

    return NextResponse.json({
      sessionId: session.sessionId,
      userName: session.userName,
      status: session.status,
      messageCount: session.history.length,
      analysisSent: session.analysis_sent,
      createdAt: session.created_at,
      updatedAt: session.updated_at
    });

  } catch (error: any) {
    console.error('Error getting session info:', error);
    
    return NextResponse.json(
      { 
        error: 'خطا در دریافت اطلاعات جلسه',
        details: error.message 
      },
      { status: 500 }
    );
  }
}
