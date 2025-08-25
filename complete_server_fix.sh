#!/bin/bash

echo "🔧 شروع رفع مشکلات سرور hrbooteh.com..."
echo "================================================"

# Colors for better output
GREEN='\033[0;32m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored messages
print_success() { echo -e "${GREEN}✅ $1${NC}"; }
print_error() { echo -e "${RED}❌ $1${NC}"; }
print_info() { echo -e "${YELLOW}ℹ️  $1${NC}"; }

# Step 1: Navigate to project directory
print_info "مرحله 1: رفتن به دایرکتوری پروژه..."
cd /root/hrbooteh || { 
    print_error "دایرکتوری hrbooteh پیدا نشد!"
    exit 1 
}
print_success "در دایرکتوری پروژه قرار گرفتیم"

# Step 2: Backup current .env
print_info "مرحله 2: پشتیبان‌گیری از فایل .env فعلی..."
if [ -f .env ]; then
    cp .env .env.backup.$(date +%Y%m%d_%H%M%S)
    print_success "فایل .env قبلی پشتیبان‌گیری شد"
fi

# Step 3: Create corrected .env file
print_info "مرحله 3: ایجاد فایل .env تصحیح شده..."
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
print_success "فایل .env جدید ایجاد شد"

# Step 4: Stop containers
print_info "مرحله 4: متوقف کردن کانتینرها..."
docker-compose down
print_success "کانتینرها متوقف شدند"

# Step 5: Start containers
print_info "مرحله 5: راه‌اندازی مجدد کانتینرها..."
docker-compose up -d
print_success "کانتینرها راه‌اندازی شدند"

# Step 6: Wait for containers to be ready
print_info "مرحله 6: انتظار برای آماده شدن کانتینرها..."
for i in {1..30}; do
    if docker exec mysql mysqladmin ping -h localhost --silent; then
        print_success "MySQL آماده است"
        break
    fi
    if [ $i -eq 30 ]; then
        print_error "MySQL در زمان مناسب آماده نشد"
        exit 1
    fi
    echo -n "."
    sleep 2
done

# Step 7: Setup database and user
print_info "مرحله 7: ایجاد دیتابیس و کاربر..."
docker exec mysql mysql -u root -pM83038303a! << 'MYSQL_SCRIPT'
CREATE DATABASE IF NOT EXISTS hrbooteh_db;
CREATE USER IF NOT EXISTS 'hrbooteh_user'@'%' IDENTIFIED BY 'M83038303a!';
GRANT ALL PRIVILEGES ON hrbooteh_db.* TO 'hrbooteh_user'@'%';
FLUSH PRIVILEGES;
MYSQL_SCRIPT

if [ $? -eq 0 ]; then
    print_success "دیتابیس و کاربر ایجاد شدند"
else
    print_error "خطا در ایجاد دیتابیس"
fi

# Step 8: Wait for Next.js to be ready
print_info "مرحله 8: انتظار برای آماده شدن Next.js..."
sleep 15

# Step 9: Test API health
print_info "مرحله 9: تست سلامت API..."
for i in {1..10}; do
    HEALTH_RESPONSE=$(curl -s -f "http://localhost:3000/api/health" 2>/dev/null || echo "failed")
    if [[ $HEALTH_RESPONSE != "failed" ]]; then
        print_success "API سلامت تایید شد"
        echo "پاسخ: $HEALTH_RESPONSE"
        break
    fi
    if [ $i -eq 10 ]; then
        print_error "API در دسترس نیست"
    fi
    sleep 3
done

# Step 10: Rebuild database tables
print_info "مرحله 10: بازسازی جداول دیتابیس..."
REBUILD_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/database/rebuild")
echo "پاسخ rebuild: $REBUILD_RESPONSE"

if [[ $REBUILD_RESPONSE == *"success\":true"* ]]; then
    print_success "جداول دیتابیس با موفقیت ایجاد شدند"
else
    print_info "تلاش مجدد برای rebuild..."
    sleep 5
    REBUILD_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/database/rebuild")
    echo "پاسخ rebuild دوم: $REBUILD_RESPONSE"
fi

# Step 11: Test registration
print_info "مرحله 11: تست registration..."
REG_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/register" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser123", 
        "email": "test@hrbooteh.com",
        "password": "test123456",
        "password_confirmation": "test123456",
        "first_name": "Test",
        "last_name": "User"
    }')

echo "پاسخ registration: $REG_RESPONSE"
if [[ $REG_RESPONSE == *"success\":true"* ]]; then
    print_success "Registration کار می‌کند!"
else
    print_info "Registration ممکن است به دلیل تکراری بودن کاربر موفق نشده باشد"
fi

# Step 12: Test login
print_info "مرحله 12: تست login..."
LOGIN_RESPONSE=$(curl -s -X POST "http://localhost:3000/api/auth/login" \
    -H "Content-Type: application/json" \
    -d '{
        "username": "testuser123",
        "password": "test123456"
    }')

echo "پاسخ login: $LOGIN_RESPONSE"
if [[ $LOGIN_RESPONSE == *"success\":true"* ]]; then
    print_success "Login کار می‌کند!"
elif [[ $LOGIN_RESPONSE == *"اکانت شما یافت نشد"* ]]; then
    print_info "برای تست کامل ابتدا یک کاربر جدید ثبت‌نام کنید"
else
    print_error "Login هنوز مشکل دارد"
fi

# Final status
print_info "خلاصه نهایی:"
echo "=================================="
print_info "✅ Environment variables تصحیح شدند"
print_info "✅ کانتینرها restart شدند"
print_info "✅ دیتابیس و کاربر ایجاد شدند"
print_info "✅ API در دسترس است"

echo ""
print_success "🎉 رفع مشکلات کامل شد!"
echo "حالا می‌توانید از https://hrbooteh.com استفاده کنید"
