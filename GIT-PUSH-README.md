# 🚀 Git Push Guide for hrbooteh.com

## استفاده ساده

### برای Windows:
فقط کافی است روی یکی از این فایل‌ها دوبار کلیک کنید:

1. **`push-git.bat`** - برای push کردن روی گیت
2. **`push-to-server.sh`** - برای push کردن روی سرور

### یا از PowerShell:
```powershell
# پوش روی گیت
.\git-push.ps1

# پوش روی سرور
.\push-to-server.ps1
```

## مراحل اولیه (فقط اولین بار)

### 1. ایجاد repository روی GitHub:
1. برید به https://github.com
2. روی "New repository" کلیک کنید
3. نام repository: `hrbooteh`
4. روی "Create repository" کلیک کنید
5. URL را کپی کنید (مثل: `https://github.com/username/hrbooteh.git`)

### 2. اجرای اسکریپت:
- روی `push-git.bat` دوبار کلیک کنید
- URL repository رو وارد کنید
- username و email گیت رو وارد کنید
- اسکریپت خودکار همه کارها رو انجام می‌ده!

## دستورات Git دستی (اختیاری)

اگر دوست دارید دستی کار کنید:

```bash
# ایجاد repository
git init

# اضافه کردن همه فایل‌ها
git add .

# کامیت
git commit -m "Initial commit"

# اضافه کردن remote
git remote add origin https://github.com/username/hrbooteh.git

# پوش
git push -u origin main
```

## فایل‌های مهم

- **`git-push.bat`** - اسکریپت ویندوز برای گیت
- **`git-push.ps1`** - اسکریپت PowerShell برای گیت  
- **`push-to-server.sh`** - اسکریپت آپلود روی سرور
- **`.gitignore`** - فایل‌هایی که نباید commit شوند

## نکات مهم

1. **اولین بار**: اسکریپت خودکار git repository ایجاد می‌کنه
2. **Authentication**: ممکن است GitHub از شما username/password یا token بخواد
3. **Automatic**: همه فایل‌ها خودکار add و commit می‌شوند
4. **Safe**: فایل‌های حساس (SSL, env) ignore می‌شوند

## عیب‌یابی

### مشکل: Git نصب نیست
```
❌ Git is not installed
```
**حل**: Git رو از https://git-scm.com نصب کنید

### مشکل: دسترسی به repository نیست
```
❌ Push failed
```
**حل**: 
1. مطمئن شوید repository وجود داره
2. Username/password یا token درست باشه
3. دسترسی push داشته باشید

### مشکل: Branch مشکل داره
**حل**: اسکریپت خودکار main و master رو تست می‌کنه

---

## 🎯 خلاصه

1. **ساده**: فقط روی `push-git.bat` کلیک کنید
2. **خودکار**: همه کارها خودکار انجام می‌شه  
3. **امن**: فایل‌های حساس ignore می‌شوند
4. **سریع**: یک بار تنظیم، همیشه کار می‌کنه

**🎉 موفق باشید!**
