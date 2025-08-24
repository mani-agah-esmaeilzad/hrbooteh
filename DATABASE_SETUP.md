# راه‌اندازی دیتابیس MySQL

## مرحله ۱: نصب MySQL

### macOS (با Homebrew):
```bash
brew install mysql
brew services start mysql
```

### Ubuntu/Debian:
```bash
sudo apt update
sudo apt install mysql-server
sudo systemctl start mysql
sudo systemctl enable mysql
```

### Windows:
از [MySQL Installer](https://dev.mysql.com/downloads/installer/) استفاده کنید.

## مرحله ۲: ایجاد دیتابیس

```sql
-- ورود به MySQL
mysql -u root -p

-- ایجاد دیتابیس
CREATE DATABASE arta_persia_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- استفاده از دیتابیس
USE arta_persia_db;

-- ایجاد جداول (این کار به صورت خودکار انجام می‌شود)
-- جداول در فایل src/lib/database.ts تعریف شده‌اند
```

## مرحله ۳: تنظیم فایل .env.local

در پوشه اصلی پروژه، فایل `.env.local` ایجاد کنید:

```env
# Database Configuration
DB_HOST=localhost
DB_USER=root
DB_PASSWORD=your_mysql_password
DB_NAME=arta_persia_db
DB_PORT=3306

# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-in-production
JWT_EXPIRES_IN=7d

# Next.js Configuration
NEXTAUTH_SECRET=your-nextauth-secret-key
NEXTAUTH_URL=http://localhost:3000
```

## مرحله ۴: تست اتصال

پس از راه‌اندازی، سرور Next.js را اجرا کنید:

```bash
npm run dev
```

سپس در مرورگر به آدرس زیر بروید:
```
http://localhost:3000/api/test-db
```

اگر پیام "اتصال به دیتابیس MySQL برقرار شد" را دیدید، دیتابیس به درستی راه‌اندازی شده است.

## مرحله ۵: ایجاد کاربر تست

برای تست سیستم، یک کاربر نمونه ایجاد کنید:

```sql
-- ورود به دیتابیس
mysql -u root -p arta_persia_db

-- ایجاد کاربر نمونه (رمز عبور: 123456)
INSERT INTO users (
  username, 
  email, 
  password_hash, 
  first_name, 
  last_name
) VALUES (
  'test_user',
  'test@example.com',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewdBPj3bp.gS8sKi',
  'کاربر',
  'تست'
);
```

## نکات مهم:

1. **رمز عبور**: رمز عبور بالا (`123456`) از قبل hash شده است
2. **کاراکترهای فارسی**: دیتابیس از `utf8mb4` استفاده می‌کند تا کاراکترهای فارسی به درستی ذخیره شوند
3. **امنیت**: در محیط تولید، حتماً `JWT_SECRET` قوی و منحصر به فرد انتخاب کنید
4. **پورت**: اگر MySQL روی پورت دیگری اجرا می‌شود، `DB_PORT` را تغییر دهید

## عیب‌یابی:

### خطای "Access denied":
```sql
-- در MySQL
ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'your_password';
FLUSH PRIVILEGES;
```

### خطای "Connection refused":
- مطمئن شوید MySQL در حال اجرا است
- پورت 3306 را بررسی کنید
- فایروال را بررسی کنید

### خطای "Database doesn't exist":
- دیتابیس `arta_persia_db` را ایجاد کنید
- نام دیتابیس در `.env.local` را بررسی کنید
