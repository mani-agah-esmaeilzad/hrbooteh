-- تصحیح ساختار دیتابیس برای register API
USE hrbooteh_db;

-- اضافه کردن فیلدهای مورد نیاز به جدول users
ALTER TABLE users 
ADD COLUMN IF NOT EXISTS phone_number VARCHAR(20) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS age INT DEFAULT NULL,
ADD COLUMN IF NOT EXISTS education_level VARCHAR(100) DEFAULT NULL,
ADD COLUMN IF NOT EXISTS work_experience VARCHAR(100) DEFAULT NULL;

-- ایجاد جدول auth_tokens
CREATE TABLE IF NOT EXISTS auth_tokens (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    token VARCHAR(500) NOT NULL,
    expires_at TIMESTAMP NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_token (token(255)),
    INDEX idx_expires_at (expires_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- حذف فیلد phone قدیمی اگر وجود دارد و phone_number جایگزین شده
SELECT COUNT(*) as phone_exists FROM information_schema.COLUMNS 
WHERE TABLE_SCHEMA = 'hrbooteh_db' AND TABLE_NAME = 'users' AND COLUMN_NAME = 'phone';

-- نمایش ساختار جدید جدول users
DESCRIBE users;

-- نمایش ساختار جدول auth_tokens
DESCRIBE auth_tokens;

SELECT '✅ ساختار دیتابیس برای register API تصحیح شد!' AS message;
