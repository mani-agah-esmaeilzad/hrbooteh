import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { hashPassword } from '@/lib/auth';
import pool from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // اعتبارسنجی ورودی
    const validationResult = registerSchema.safeParse(body);
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

    const { 
      username, 
      email, 
      password, 
      first_name, 
      last_name, 
      phone_number, 
      age, 
      education_level, 
      work_experience 
    } = validationResult.data;

    // رمزنگاری پسورد
    const passwordHash = await hashPassword(password);

    const connection = await pool.getConnection();
    try {
      // بررسی تکراری نبودن نام کاربری و ایمیل
      const [existingUsers] = await connection.execute(
        'SELECT id FROM users WHERE username = ? OR email = ?',
        [username, email]
      );

      if (Array.isArray(existingUsers) && existingUsers.length > 0) {
        return NextResponse.json(
          { 
            success: false, 
            message: 'نام کاربری یا ایمیل قبلاً استفاده شده است' 
          },
          { status: 409 }
        );
      }

      // ایجاد کاربر جدید
      const [result] = await connection.execute(
        `INSERT INTO users (
          username, email, password_hash, first_name, last_name, 
          phone_number, age, education_level, work_experience
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [username, email, passwordHash, first_name, last_name, phone_number || null, age ? parseInt(age as string) || null : null, education_level || null, work_experience || null]
      );

      const insertResult = result as any;
      const userId = insertResult.insertId;

      // دریافت اطلاعات کاربر ایجاد شده
      const [newUserRows] = await connection.execute(
        'SELECT id, username, email, first_name, last_name, phone_number, age, education_level, work_experience, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (Array.isArray(newUserRows) && newUserRows.length > 0) {
        const newUser = newUserRows[0];

        return NextResponse.json({
          success: true,
          message: 'حساب کاربری با موفقیت ایجاد شد',
          data: {
            user: newUser
          }
        }, { status: 201 });
      } else {
        throw new Error('خطا در ایجاد کاربر');
      }

    } finally {
      connection.release();
    }

  } catch (error) {
    console.error('خطا در ثبت‌نام:', error);
    return NextResponse.json(
      { 
        success: false, 
        message: 'خطای سرور. لطفاً دوباره تلاش کنید' 
      },
      { status: 500 }
    );
  }
}
