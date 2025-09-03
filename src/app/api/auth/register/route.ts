import { NextRequest, NextResponse } from 'next/server';
import { registerSchema } from '@/lib/validation';
import { hashPassword, generateToken } from '@/lib/auth';
import pool from '@/lib/database';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
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

    const passwordHash = await hashPassword(password);

    const connection = await pool.getConnection();
    try {
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

      const [result] = await connection.execute(
        `INSERT INTO users (
          username, email, password_hash, first_name, last_name, 
          phone_number, age, education_level, work_experience
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          username, 
          email, 
          passwordHash, 
          first_name, 
          last_name, 
          phone_number || null, 
          age ? parseInt(age as string) : null, 
          education_level || null, 
          work_experience || null
        ]
      );

      const insertResult = result as any;
      const userId = insertResult.insertId;

      const [newUserRows] = await connection.execute(
        'SELECT id, username, email, first_name, last_name, phone_number, age, education_level, work_experience, created_at FROM users WHERE id = ?',
        [userId]
      );

      if (Array.isArray(newUserRows) && newUserRows.length > 0) {
        const newUser = newUserRows[0] as any;

        // Generate token immediately after registration
        const token = generateToken(newUser.id, newUser.username);

        const expiresAt = new Date();
        expiresAt.setDate(expiresAt.getDate() + 7); // 7-day expiry

        await connection.execute(
          'INSERT INTO auth_tokens (user_id, token, expires_at) VALUES (?, ?, ?)',
          [newUser.id, token, expiresAt]
        );

        return NextResponse.json({
          success: true,
          message: 'حساب کاربری با موفقیت ایجاد شد',
          data: {
            user: newUser,
            token,
            expiresAt
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
