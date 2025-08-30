import { NextResponse, NextRequest } from 'next/server';
import { query } from '@/lib/database';
import { extractTokenFromHeader, verifyToken } from '@/lib/auth';

export async function GET(req: NextRequest) {
  try {
    // 1. Authenticate and Authorize Admin
    const authHeader = req.headers.get('authorization');
    const token = extractTokenFromHeader(authHeader);
    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }
    const decoded = verifyToken(token);
    if (!decoded) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }
    const [adminRows]: any = await query('SELECT role FROM users WHERE id = ?', [decoded.userId]);
    if (adminRows.length === 0 || adminRows[0].role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden: Access is restricted to administrators' }, { status: 403 });
    }

    // 2. Get userId from query params
    const userId = req.nextUrl.searchParams.get('userId');
    if (!userId) {
      return NextResponse.json({ error: 'userId query parameter is required' }, { status: 400 });
    }

    // 3. Fetch chat history for the given user
    const chatHistory = await query(`
      SELECT
        cs.id as session_db_id,
        cs.assessment_type,
        cs.session_id as session_uuid,
        cs.created_at as session_created_at,
        cm.sender_type,
        cm.sender_name,
        cm.message,
        cm.created_at as message_created_at
      FROM chat_sessions cs
      JOIN chat_messages cm ON cs.id = cm.session_id
      WHERE cs.user_id = ?
      ORDER BY cs.created_at DESC, cm.created_at ASC;
    `, [userId]);

    // 4. Process the flat results into a structured object
    const structuredHistory = (chatHistory as any[]).reduce((acc, row) => {
      const { session_uuid, assessment_type, session_created_at, ...messageData } = row;
      if (!acc[session_uuid]) {
        acc[session_uuid] = {
          assessment_type,
          created_at: session_created_at,
          messages: [],
        };
      }
      acc[session_uuid].messages.push({
        sender_type: messageData.sender_type,
        sender_name: messageData.sender_name,
        message: messageData.message,
        created_at: messageData.message_created_at,
      });
      return acc;
    }, {});

    return NextResponse.json({ success: true, data: structuredHistory }, { status: 200 });

  } catch (error: any) {
    console.error('[API_ADMIN_CHATS_ERROR]', error);
    return NextResponse.json({ error: 'Internal Server Error', details: error.message }, { status: 500 });
  }
}
