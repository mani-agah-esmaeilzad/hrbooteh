import { NextResponse } from 'next/server';
import { createTables } from '@/lib/database';

export async function POST() {
  try {
    const success = await createTables();
    
    if (success) {
      return NextResponse.json({
        success: true,
        message: 'دیتابیس با موفقیت بازسازی شد'
      });
    } else {
      return NextResponse.json({
        success: false,
        message: 'خطا در بازسازی دیتابیس'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('خطا در بازسازی دیتابیس:', error);
    return NextResponse.json({
      success: false,
      message: 'خطای سرور در بازسازی دیتابیس'
    }, { status: 500 });
  }
}
