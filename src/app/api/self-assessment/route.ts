'use server';

import { NextRequest, NextResponse } from 'next/server';
import { extractTokenFromHeader, authenticateToken } from '@/lib/auth';
import pool from '@/lib/database';

export async function POST(request: NextRequest) {
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
    const { answers } = await request.json();

    if (!answers || typeof answers !== 'object' || Object.keys(answers).length !== 22) {
      return NextResponse.json({ success: false, message: 'اطلاعات پاسخ‌ها نامعتبر است.' }, { status: 400 });
    }

    const answerValues = [];
    for (let i = 0; i < 22; i++) {
        const answer = answers[String(i)];
        if (answer === undefined || answer === null || isNaN(Number(answer)) || Number(answer) < 1 || Number(answer) > 5) {
            return NextResponse.json({ success: false, message: `پاسخ سوال ${i + 1} نامعتبر است.` }, { status: 400 });
        }
        answerValues.push(Number(answer));
    }

    const connection = await pool.getConnection();
    try {
      const [existing] = await connection.execute(
        'SELECT id FROM soft_skills_self_assessment WHERE user_id = ?',
        [userId]
      );

      const questionColumns = Array.from({ length: 22 }, (_, i) => `q${i + 1}`).join(', ');
      
      if (Array.isArray(existing) && existing.length > 0) {
        const updateQuery = `UPDATE soft_skills_self_assessment SET ${questionColumns.split(', ').map(c => `${c} = ?`).join(', ')} WHERE user_id = ?`;
        await connection.execute(updateQuery, [...answerValues, userId]);
      } else {
        const valuePlaceholders = Array.from({ length: 22 }, () => '?').join(', ');
        const insertQuery = `INSERT INTO soft_skills_self_assessment (user_id, ${questionColumns}) VALUES (?, ${valuePlaceholders})`;
        await connection.execute(insertQuery, [userId, ...answerValues]);
      }

      connection.release();
      return NextResponse.json({ success: true, message: 'ارزیابی با موفقیت ذخیره شد.' });
    } catch (error) {
      connection.release();
      console.error('Database Error:', error);
      if (error.code === 'ER_NO_SUCH_TABLE') {
          return NextResponse.json({ success: false, message: 'خطای سرور: جدول مورد نیاز یافت نشد. لطفاً با پشتیبانی تماس بگیرید.' }, { status: 500 });
      }
      return NextResponse.json({ success: false, message: 'خطا در ذخیره اطلاعات در پایگاه داده.' }, { status: 500 });
    }
  } catch (error) {
    console.error('Server Error:', error);
    return NextResponse.json({ success: false, message: 'خطای سرور. لطفاً دوباره تلاش کنید.' }, { status: 500 });
  }
}
