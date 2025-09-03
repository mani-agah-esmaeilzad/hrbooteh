import { NextRequest, NextResponse } from 'next/server';

// Simple debug route without complex imports
export async function GET() {
  return NextResponse.json({
    message: 'Chat debug API is working',
    timestamp: new Date().toISOString()
  });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    if (action === 'test_session') {
      // Simple in-memory test without importing ConversationManager
      const sessionId = 'test-session-' + Date.now();
      
      return NextResponse.json({
        message: 'Session test successful',
        sessionId,
        timestamp: new Date().toISOString(),
        success: true
      });
    }

    return NextResponse.json({
      message: 'Unknown action',
      action,
      success: false
    }, { status: 400 });

  } catch (error) {
    console.error('Debug chat error:', error);
    return NextResponse.json({
      message: 'Error in debug chat',
      error: error instanceof Error ? error.message : 'Unknown error',
      success: false
    }, { status: 500 });
  }
}
