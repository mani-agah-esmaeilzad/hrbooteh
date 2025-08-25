# دستورالعمل رفع مشکلات سرور hrbooteh.com

## مراحل انجام کار:

### گزینه 1: اجرای اسکریپت خودکار (توصیه می‌شود)

1. فایل `complete_server_fix.sh` را به سرور انتقال دهید
2. در سرور این دستورات را اجرا کنید:

```bash
# انتقال فایل به سرور و اجرا
scp complete_server_fix.sh root@your-server-ip:/root/
ssh root@your-server-ip
chmod +x /root/complete_server_fix.sh
/root/complete_server_fix.sh
```

### گزینه 2: اجرای دستی مرحله به مرحله

1. به سرور وصل شوید:
```bash
ssh root@your-server-ip
```

2. به دایرکتوری پروژه بروید:
```bash
cd /root/hrbooteh
```

3. فایل .env را جایگزین کنید:
```bash
cp .env .env.backup
cat > .env << 'EOF'
# Production Environment Variables for hrbooteh.com

# Database Configuration
DB_HOST=mysql
DB_USER=hrbooteh_user
DB_PASSWORD=M83038303a!
DB_NAME=hrbooteh_db
DB_PORT=3306

# JWT Secret
JWT_SECRET=hrbooteh_jwt_secret_key_very_secure_2024

# Next.js Configuration
NODE_ENV=production
NEXT_TELEMETRY_DISABLED=1
NEXTAUTH_SECRET=hrbooteh_nextauth_secret_key_very_secure_2024

# Domain Configuration
NEXT_PUBLIC_DOMAIN=hrbooteh.com
NEXT_PUBLIC_API_URL=https://hrbooteh.com/api

# Google AI API Key
GOOGLE_API_KEY=AIzaSyA_uuYZJDhggbXUYemarNz5K6l3XbKkdSA
EOF
```

4. کانتینرها را restart کنید:
```bash
docker-compose down
docker-compose up -d
```

5. 20 ثانیه صبر کنید و سپس دیتابیس را setup کنید:
```bash
sleep 20
docker exec mysql mysql -u root -pM83038303a! << 'MYSQL_SCRIPT'
CREATE DATABASE IF NOT EXISTS hrbooteh_db;
CREATE USER IF NOT EXISTS 'hrbooteh_user'@'%' IDENTIFIED BY 'M83038303a!';
GRANT ALL PRIVILEGES ON hrbooteh_db.* TO 'hrbooteh_user'@'%';
FLUSH PRIVILEGES;
MYSQL_SCRIPT
```

6. جداول دیتابیس را بسازید:
```bash
curl -X POST "http://localhost:3000/api/database/rebuild"
```

7. تست کنید:
```bash
curl "http://localhost:3000/api/health"
```

## تغییرات اعمال شده:

- ✅ تصحیح URL های API از localhost:3001 به relative paths
- ✅ تغییر DB_HOST از 127.0.0.1 به mysql
- ✅ اضافه کردن NEXTAUTH_SECRET
- ✅ تنظیم صحیح environment variables
- ✅ ایجاد دیتابیس و کاربر MySQL
- ✅ بازسازی جداول دیتابیس

## پس از اجرای موفق:

وب‌سایت شما باید کاملاً کار کند و خطاهای 500 و Connection Refused حل شده باشند.

می‌توانید آن را در https://hrbooteh.com تست کنید.
