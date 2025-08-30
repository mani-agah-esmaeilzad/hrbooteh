import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate the user
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    const decoded = verifyToken(token);

    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    // 2. Authorize the user (check if admin)
    const [adminRows]: any = await query('SELECT role FROM users WHERE id = ?', [decoded.userId]);

    if (adminRows.length === 0 || adminRows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Access is restricted to administrators' }, { status: 403 });
    }

    // 3. Fetch all users if authorized
    const users = await query(
      'SELECT id, username, email, first_name, last_name, role, created_at FROM users ORDER BY created_at DESC'
    );

    return NextResponse.json({ success: true, data: users }, { status: 200 });

  } catch (error: any) {
    console.error('[API_ADMIN_USERS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
