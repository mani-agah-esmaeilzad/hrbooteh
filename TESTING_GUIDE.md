# 🧪 راهنمای تست سیستم آقای احمدی

## ✅ آماده‌سازی محیط تست

### 1. XAMPP و Database
- ✅ XAMPP در حال اجرا: `http://localhost/phpmyadmin`
- ✅ دیتابیس `hrbooteh_db` ساخته شده
- ✅ جداول مورد نیاز ایجاد شده

### 2. Next.js Project
- ✅ تنظیمات `.env.local` برای localhost
- ✅ سرور در حال اجرا: `http://localhost:3000`

## 🔥 روش‌های تست

### روش 1: فایل HTML تست
1. فایل `test-ai-chat.html` را در مرورگر باز کنید
2. روی "شروع گفتگو جدید" کلیک کنید
3. با آقای احمدی گفتگو کنید
4. منتظر تحلیل نهایی باشید

### روش 2: API مستقیم
برای تست API ها مستقیماً:

#### شروع گفتگو:
```javascript
// POST http://localhost:3000/api/ai-chat/start
{
  "userName": "کاربر تست"
}
```

#### ارسال پیام:
```javascript
// POST http://localhost:3000/api/ai-chat/message
{
  "sessionId": "session-uuid-here",
  "message": "من فکر می‌کنم اول باید با تیم مشورت کنم"
}
```

#### درخواست تحلیل:
```javascript
// POST http://localhost:3000/api/ai-chat/analyze
{
  "sessionId": "session-uuid-here"
}
```

### روش 3: مشاهده در Database
```sql
-- مشاهده session ها
SELECT * FROM assessment_states ORDER BY created_at DESC;

-- مشاهده پیام‌ها
SELECT * FROM chat_messages ORDER BY created_at DESC;

-- مشاهده assessments
SELECT * FROM assessments ORDER BY created_at DESC;
```

## 🎯 سناریوهای تست

### تست 1: پاسخ مستقل
پیام: "من خودم تصمیم می‌گیرم و کار رو شروع می‌کنم بدون اینکه از کسی اجازه بگیرم"

### تست 2: پاسخ وابسته
پیام: "اول باید با تیم و مدیرعامل مشورت کنم و نظرشون رو بپرسم"

### تست 3: پاسخ خلاقانه
پیام: "یک روش کاملاً جدید رو امتحان می‌کنم که تا حالا کسی استفاده نکرده"

### تست 4: پاسخ محافظه‌کارانه
پیام: "بهتره از روش‌های آزموده شده و قوانین شرکت پیروی کنم"

## ⚡ نکات مهم برای تست

1. **Session Management**: هر بار برای تست جدید، session جدید بسازید
2. **AI Response Time**: پاسخ‌های AI ممکن است 5-10 ثانیه طول بکشه
3. **Analysis Trigger**: تحلیل بعد از حداقل 2 پیام کاربر فعال می‌شه
4. **Database Logging**: تمام پیام‌ها در دیتابیس ذخیره می‌شن

## 🐛 رفع مشکلات رایج

### خطای Database Connection
```bash
# چک کردن وضعیت MySQL
Get-Process mysqld

# اگر MySQL خاموشه، از XAMPP Control Panel روشنش کنید
```

### خطای AI API
- چک کنید `GOOGLE_API_KEY` در `.env.local` درست باشه
- مطمئن شوید اینترنت وصله

### خطای CORS
- مطمئن شوید از localhost استفاده می‌کنید، نه IP

## 📊 مقادیر انتظار

### نمونه خروجی تحلیل:
```
---
تحلیل نهایی نیاز به استقلال

امتیاز کل شما: 4/6

جزئیات امتیازات:

1. نگرش به کارهای جدید و نامعمول: 1 امتیاز
   توجیه: کاربر علاقه‌مندی به روش‌های نو و خلاقانه نشان داد

2. تمایل به خودمختاری: 1 امتیاز  
   توجیه: تمایل به تصمیم‌گیری مستقلانه ابراز کرد

...

تفسیر نتیجه:
بر اساس تحلیل مکالمه، نیاز شما به استقلال در سطح بالایی قرار دارد.
---
```

## ✨ مرحله بعدی

پس از تست موفق، می‌تونید:
1. سیستم رو به production deploy کنید
2. با UI اصلی پروژه ادغام کنید
3. authentication اضافه کنید
4. Database رو به MySQL production وصل کنید

## 📞 راه‌های دسترسی

- **فایل تست**: `file:///path/to/test-ai-chat.html`
- **API Base**: `http://localhost:3000/api/ai-chat/`
- **phpMyAdmin**: `http://localhost/phpmyadmin`
- **Next.js**: `http://localhost:3000`

---

🎉 **موفق باشید!** سیستم آقای احمدی آماده تست و استفاده است.
