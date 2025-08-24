import { NextRequest, NextResponse } from 'next/server';
import { loginSchema } from '@/lib/validation';
import { verifyPassword, generateToken } from '@/lib/auth';
import pool from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // اعتبارسنجی ورودی
    const validationResult = loginSchema.safeParse(body);
    if (!validationResult.success) {
      return NextResponse.json(
        { 
          success: false, 
          message: 'داده‌های ورودی نامعتبر است',
          error: validationResult.error.errors[0]?.message 
        },
        { status: 400 }
      );
    }

    const { username, password } = validationResult.data;

    // بررسی وجود کاربر در دیتابیس
    const connection = await pool.getConnection();
    try {
      const [rows] = await connection.execute(
        'SELECT * FROM users WHERE username = ? OR email = ?',
        [username, username]
      );

      if (!Array.isArray(rows) || rows.length === 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'اکانت شما یافت نشد. لطفاً ابتدا ثبت‌نام کنید' 
          },
          { status: 404 }
        );
      }

      const user = rows[0] as any;

      // تایید رمز عبور
      const isPasswordValid = await verifyPassword(password, user.password_hash);
      if (!isPasswordValid) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'نام کاربری یا رمز عبور اشتباه است' 
          },
          { status: 401 }
        );
      }

      // تولید توکن JWT
      const token = generateToken(user.id, user.username);

      // ذخیره توکن در دیتابیس
      const expiresAt = new Date();
      expiresAt.setDate(expiresAt.getDate() + 7); // ۷ روز

      await connection.execute(
        'INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
        [user.id, token, expiresAt]
      );

      // حذف اطلاعات حساس از پاسخ
      const { password_hash, ...userWithoutPassword } = user;

      return NextResponse.json({
        success: true,
        message: 'ورود موفقیت‌آمیز بود',
        data: {
          user: userWithoutPassword,
          token,
          expiresAt
        }
      });

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('خطا در ورود:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید' 
      },
      { status: 500 }
    );
  }
}
