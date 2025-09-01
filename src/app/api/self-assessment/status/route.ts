
import { NextResponse } from 'next/server';
import { NextRequest } from 'next/server';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';
import pool from '@/lib/database';

export async function GET(req: NextRequest) {
  const authHeader = req.headers.get('authorization');
  const token = extractTokenFromHeader(authHeader);

  if (!token) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const decodedToken = verifyToken(token);

  if (!decodedToken || !decodedToken.userId) {
    return NextResponse.json({ message: 'Not authenticated' }, { status: 401 });
  }

  const userId = decodedToken.userId;

  try {
    const connection = await pool.getConnection();
    const [rows]: any = await connection.execute(
      'SELECT COUNT(*) as count FROM soft_skills_self_assessment WHERE user_id = ?',
      [userId]
    );
    connection.release();

    const completed = rows[0].count > 0;
    return NextResponse.json({ completed });
  } catch (error) {
    console.error('Error checking self-assessment status:', error);
    return NextResponse.json({ message: 'Internal server error' }, { status: 500 });
  }
}
