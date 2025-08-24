import jwt, { SignOptions } from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-change-in-production';
const JWT_EXPIRES_IN = '7d';

// تولید توکن JWT
export function generateToken(userId: number, username: string): string {
  const payload = { 
    userId, 
    username,
    iat: Math.floor(Date.now() / 1000),
  };
  const options: SignOptions = { expiresIn: JWT_EXPIRES_IN };
  
  return jwt.sign(payload, JWT_SECRET, options);
}

// تایید توکن JWT
export function verifyToken(token: string): any {
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (error) {
    return null;
  }
}

// رمزنگاری پسورد
export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return bcrypt.hash(password, saltRounds);
}

// تایید پسورد
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  return bcrypt.compare(password, hashedPassword);
}

// استخراج توکن از header
export function extractTokenFromHeader(authHeader: string | null | undefined): string | null {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return null;
  }
  return authHeader.substring(7);
}

// middleware برای تایید توکن
export function authenticateToken(token: string): any {
  const decoded = verifyToken(token);
  if (!decoded) {
    throw new Error('توکن نامعتبر یا منقضی شده است');
  }
  return decoded;
}
