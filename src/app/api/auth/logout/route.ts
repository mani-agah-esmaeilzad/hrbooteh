import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import pool from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    // استخراج توکن از header
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'توکن احراز هویت ارائه نشده است' 
        },
        { status: 401 }
      );
    }

    // تایید توکن
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

    const connection = await pool.getConnection();
    try {
      // حذف توکن از دیتابیس
      await connection.execute(
        'DELETE FROM auth_tokens WHERE token = ?',
        [token]
      );

      return NextResponse.json({
        success: true,
        message: 'خروج موفقیت‌آمیز بود'
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('خطا در خروج:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید' 
      },
      { status: 500 }
    );
  }
}
