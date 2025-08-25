import { LoginInput, RegisterInput, ApiResponse } from '@/lib/validation';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || '/api';

// تابع کمکی برای درخواست‌های API
async function apiRequest<T>(
  endpoint: string, 
  options: RequestInit = {}
): Promise<ApiResponse & { data?: T }> {
  try {
    const response = await fetch(`${API_BASE_URL}${endpoint}`, {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.message || 'خطای سرور');
    }

    return data;
  } catch (error) {
    console.error('خطا در API request:', error);
    throw error;
  }
}

// تابع کمکی برای درخواست‌های API با توکن
async function authenticatedApiRequest<T>(
  endpoint: string, 
  token: string,
  options: RequestInit = {}
): Promise<ApiResponse & { data?: T }> {
  return apiRequest<T>(endpoint, {
    ...options,
    headers: {
      ...options.headers,
      'Authorization': `Bearer ${token}`,
    },
  });
}

// ثبت‌نام کاربر
export async function register(userData: RegisterInput): Promise<ApiResponse> {
  return apiRequest('/auth/register', {
    method: 'POST',
    body: JSON.stringify(userData),
  });
}

// ورود کاربر
export async function login(credentials: LoginInput): Promise<ApiResponse & { data?: { user: any; token: string; expiresAt: string } }> {
  return apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify(credentials),
  });
}

// خروج کاربر
export async function logout(token: string): Promise<ApiResponse> {
  return authenticatedApiRequest('/auth/logout', token, {
    method: 'POST',
  });
}

// شروع سناریوی استقلال
export async function startIndependenceScenario(token: string): Promise<ApiResponse> {
  return authenticatedApiRequest('/assessment/start-independence', token, {
    method: 'POST',
  });
}

// چت در سناریوی استقلال
export async function chatIndependence(
  token: string, 
  message: string, 
  sessionId: string
): Promise<ApiResponse> {
  return authenticatedApiRequest('/assessment/chat-independence', token, {
    method: 'POST',
    body: JSON.stringify({ message, session_id: sessionId }),
  });
}

// تست اتصال دیتابیس
export async function testDatabase(): Promise<ApiResponse> {
  return apiRequest('/test-db', {
    method: 'GET',
  });
}
