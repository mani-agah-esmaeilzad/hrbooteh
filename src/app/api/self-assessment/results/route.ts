'use server';

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import pool from '@/lib/database';

export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader || undefined);

    if (!token) {
      return NextResponse.json({ success: false, message: 'توکن احراز هویت ارائه نشده است' }, { status: 401 });
    }

    let decodedToken;
    try {
      decodedToken = authenticateToken(token);
    } catch (error) {
      return NextResponse.json({ success: false, message: 'توکن نامعتبر یا منقضی شده است' }, { status: 401 });
    }

    const userId = decodedToken.userId;
    const connection = await pool.getConnection();

    try {
      const [rows] = await connection.execute(
        'SELECT * FROM soft_skills_self_assessment WHERE user_id = ? ORDER BY created_at DESC LIMIT 1',
        [userId]
      );

      connection.release();

      if (Array.isArray(rows) && rows.length > 0) {
        const results = rows[0];
        return NextResponse.json({ success: true, data: results });
      } else {
        return NextResponse.json({ success: false, message: 'نتیجه‌ای برای این کاربر یافت نشد.' }, { status: 404 });
      }
    } catch (error) {
      connection.release();
      console.error('Database Error:', error);
      return NextResponse.json({ success: false, message: 'خطا در واکشی اطلاعات از پایگاه داده.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ success: false, message: 'خطای سرور. لطفاً دوباره تلاش کنید.' }, { status: 500 });
  }
}
