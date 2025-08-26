import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import { getConnectionWithRetry } from '@/lib/database';

export async function GET(request: NextRequest) {
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
    const url = new URL(request.url);
    const assessmentId = url.searchParams.get('assessment_id');
    
    const connection = await getConnectionWithRetry();
    if (!connection) {
      throw new Error('Failed to get database connection');
    }
    
    try {
      let query = 'SELECT * FROM assessments WHERE user_id = ?';
      let queryParams: any[] = [userId];
      
      if (assessmentId) {
        query += ' AND id = ?';
        queryParams.push(assessmentId);
      }
      
      query += ' ORDER BY created_at DESC LIMIT 1';
      
      const [assessments] = await connection.execute(query, queryParams);

      if (!Array.isArray(assessments) || assessments.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'ارزیابی یافت نشد' 
          },
          { status: 404 }
        );
      }

      const assessment = assessments[0] as any;
      
      // دریافت پیام‌های چت
      const [messages] = await connection.execute(
        'SELECT * FROM chat_messages WHERE assessment_id = ? ORDER BY created_at ASC',
        [assessment.id]
      );

      return NextResponse.json({
        success: true,
        message: 'نتایج ارزیابی با موفقیت دریافت شد',
        data: {
          assessment,
          messages: Array.isArray(messages) ? messages : []
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('خطا در دریافت نتایج:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور در دریافت نتایج' 
      },
      { status: 500 }
    );
  }
}
