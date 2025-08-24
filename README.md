# Arta Persia Conversations Insight

یک پلتفرم تحلیل گفتگوهای هوش مصنوعی با قابلیت ارزیابی روانشناسی مبتنی بر سناریو.

## ویژگی‌ها

- 🧠 **ارزیابی هوشمند**: تحلیل پاسخ‌های کاربر با استفاده از AI
- 📊 **گزارش‌های تحلیلی**: ارائه نتایج جامع و قابل فهم
- 🎭 **سناریوهای تعاملی**: تجربه‌های واقعی و جذاب
- 🔒 **امنیت بالا**: احراز هویت و مدیریت جلسات
- 📱 **طراحی واکنش‌گرا**: سازگار با تمام دستگاه‌ها

## تکنولوژی‌ها

### Frontend
- **Next.js 14** - فریم‌ورک React با App Router
- **TypeScript** - تایپ‌اسکریپت برای توسعه ایمن
- **Tailwind CSS** - فریم‌ورک CSS برای طراحی سریع
- **shadcn/ui** - کامپوننت‌های UI مدرن و قابل تنظیم
- **React Query** - مدیریت state و cache
- **Framer Motion** - انیمیشن‌های روان

### Backend
- **Next.js API Routes** - API های سرور-ساید
- **MySQL** - دیتابیس رابطه‌ای
- **JWT** - احراز هویت امن
- **bcrypt** - رمزنگاری پسورد
- **Zod** - اعتبارسنجی داده‌ها

## نصب و راه‌اندازی

### پیش‌نیازها
- Node.js 18+ 
- MySQL 8.0+
- npm یا yarn

### مراحل نصب

1. **کلون کردن پروژه**
```bash
git clone <repository-url>
cd arta-persia-conversations-insight
```

2. **نصب وابستگی‌ها**
```bash
npm install
```

3. **تنظیم متغیرهای محیطی**
```bash
# فایل .env.local ایجاد کنید (نمونه در DATABASE_SETUP.md)
```

4. **راه‌اندازی دیتابیس**
```bash
# فایل DATABASE_SETUP.md را مطالعه کنید
```

5. **اجرای پروژه**
```bash
npm run dev
```

پروژه روی آدرس `http://localhost:3000` اجرا می‌شود.

## ساختار پروژه

```
src/
├── app/                    # Next.js App Router
│   ├── api/               # API Routes
│   │   ├── auth/          # احراز هویت
│   │   ├── assessment/    # ارزیابی‌ها
│   │   └── test-db/       # تست دیتابیس
│   ├── globals.css        # استایل‌های سراسری
│   ├── layout.tsx         # Layout اصلی
│   └── page.tsx           # صفحه اصلی
├── components/             # کامپوننت‌های React
│   ├── ui/                # کامپوننت‌های UI
│   └── ...                # کامپوننت‌های سفارشی
├── contexts/               # React Contexts
├── lib/                    # توابع کمکی و تنظیمات
│   ├── database.ts        # پیکربندی دیتابیس
│   ├── auth.ts            # توابع احراز هویت
│   ├── validation.ts      # Schema های اعتبارسنجی
│   └── ai-scenarios.ts    # سناریوهای AI
├── pages/                  # صفحات اصلی (کامپوننت‌ها)
└── services/               # سرویس‌های API
    └── authService.ts      # سرویس احراز هویت
```

## API Endpoints

### احراز هویت
- `POST /api/auth/register` - ثبت‌نام کاربر
- `POST /api/auth/login` - ورود کاربر
- `POST /api/auth/logout` - خروج کاربر

### ارزیابی
- `POST /api/assessment/start-independence` - شروع سناریوی استقلال
- `POST /api/assessment/chat-independence` - چت در سناریوی استقلال

### تست
- `GET /api/test-db` - تست اتصال دیتابیس

## راه‌اندازی دیتابیس

برای راه‌اندازی دیتابیس MySQL، فایل `DATABASE_SETUP.md` را مطالعه کنید. این فایل شامل:

- نصب MySQL
- ایجاد دیتابیس
- تنظیم جداول
- ایجاد کاربر تست
- عیب‌یابی مشکلات رایج

## استفاده

1. **ثبت‌نام/ورود**: ابتدا حساب کاربری ایجاد کنید یا وارد شوید
2. **انتخاب پرسشنامه**: یکی از پرسشنامه‌های موجود را انتخاب کنید
3. **شرکت در ارزیابی**: در سناریوهای تعاملی شرکت کنید
4. **مشاهده نتایج**: نتایج تحلیلی خود را مشاهده کنید

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## مشارکت

برای مشارکت در پروژه:

1. پروژه را fork کنید
2. یک branch جدید ایجاد کنید
3. تغییرات خود را commit کنید
4. Pull Request ارسال کنید

## License

This project is licensed under the MIT License.
