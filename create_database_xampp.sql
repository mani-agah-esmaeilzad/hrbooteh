-- ایجاد دیتابیس hrbooteh برای XAMPP
-- این کوئری رو در phpMyAdmin اجرا کنید: http://localhost/phpmyadmin

-- ایجاد دیتابیس
CREATE DATABASE IF NOT EXISTS hrbooteh_db CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- انتخاب دیتابیس
USE hrbooteh_db;

-- ایجاد جدول کاربران
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20) DEFAULT NULL,
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد جدول پرسشنامه‌ها
CREATE TABLE IF NOT EXISTS questionnaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT DEFAULT NULL,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد جدول ارزیابی‌ها
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    questionnaire_id INT NOT NULL,
    score INT DEFAULT 0,
    max_score INT DEFAULT 0,
    level VARCHAR(100) DEFAULT NULL,
    description TEXT DEFAULT NULL,
    completed_at TIMESTAMP NULL DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_questionnaire_id (questionnaire_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد جدول پیام‌های چت
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    user_id INT NOT NULL,
    message_type ENUM('user', 'ai', 'system', 'analysis') NOT NULL,
    content TEXT NOT NULL,
    character_name VARCHAR(100) DEFAULT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE ON UPDATE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_assessment_id (assessment_id),
    INDEX idx_user_id (user_id),
    INDEX idx_message_type (message_type),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد جدول وضعیت ارزیابی‌ها (برای مدیریت session)
CREATE TABLE IF NOT EXISTS assessment_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    state_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_session_id (session_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ایجاد جدول خودارزیابی مهارت‌های نرم
CREATE TABLE IF NOT EXISTS soft_skills_self_assessment (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    q1 TINYINT NOT NULL,
    q2 TINYINT NOT NULL,
    q3 TINYINT NOT NULL,
    q4 TINYINT NOT NULL,
    q5 TINYINT NOT NULL,
    q6 TINYINT NOT NULL,
    q7 TINYINT NOT NULL,
    q8 TINYINT NOT NULL,
    q9 TINYINT NOT NULL,
    q10 TINYINT NOT NULL,
    q11 TINYINT NOT NULL,
    q12 TINYINT NOT NULL,
    q13 TINYINT NOT NULL,
    q14 TINYINT NOT NULL,
    q15 TINYINT NOT NULL,
    q16 TINYINT NOT NULL,
    q17 TINYINT NOT NULL,
    q18 TINYINT NOT NULL,
    q19 TINYINT NOT NULL,
    q20 TINYINT NOT NULL,
    q21 TINYINT NOT NULL,
    q22 TINYINT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE ON UPDATE CASCADE,
    INDEX idx_user_id (user_id),
    INDEX idx_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- درج داده‌های پیش‌فرض برای پرسشنامه‌ها
INSERT INTO questionnaires (id, title, description, type, is_active) VALUES
(1, 'ارزیابی نیاز به استقلال', 'گفتگوی تعاملی با آقای احمدی برای ارزیابی میزان نیاز به استقلال در محیط کار', 'independence', TRUE),
(2, 'خودارزیابی مهارت‌های نرم', 'پرسشنامه خودارزیابی 22 سوالی برای سنجش مهارت‌های نرم', 'soft_skills', TRUE)
ON DUPLICATE KEY UPDATE 
    title = VALUES(title),
    description = VALUES(description),
    type = VALUES(type),
    is_active = VALUES(is_active);

-- درج کاربر تست (رمز عبور: test123)
INSERT INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('testuser', 'test@hrbooteh.com', '$2b$10$rQJ9aDQGQdGmTwP7RQJ9cOd3ksHQJ9aDQGQdGmTwP7RQJ9cOd3ksH', 'کاربر', 'تست', 'user'),
('admin', 'admin@hrbooteh.com', '$2b$10$rQJ9aDQGQdGmTwP7RQJ9cOd3ksHQJ9aDQGQdGmTwP7RQJ9cOd3ksH', 'مدیر', 'سیستم', 'admin')
ON DUPLICATE KEY UPDATE 
    first_name = VALUES(first_name),
    last_name = VALUES(last_name),
    role = VALUES(role);

-- نمایش جداول ایجاد شده
SHOW TABLES;

-- نمایش تعداد رکوردهای هر جدول
SELECT 'users' AS table_name, COUNT(*) AS record_count FROM users
UNION ALL
SELECT 'questionnaires' AS table_name, COUNT(*) AS record_count FROM questionnaires
UNION ALL
SELECT 'assessments' AS table_name, COUNT(*) AS record_count FROM assessments
UNION ALL
SELECT 'chat_messages' AS table_name, COUNT(*) AS record_count FROM chat_messages
UNION ALL
SELECT 'assessment_states' AS table_name, COUNT(*) AS record_count FROM assessment_states
UNION ALL
SELECT 'soft_skills_self_assessment' AS table_name, COUNT(*) AS record_count FROM soft_skills_self_assessment;

-- پیام موفقیت
SELECT '✅ دیتابیس hrbooteh_db با موفقیت ایجاد شد!' AS message;
SELECT '🎯 جداول آماده برای استفاده هستند' AS status;
SELECT '👤 کاربر تست: testuser / test123' AS test_user;
SELECT '👑 کاربر ادمین: admin / test123' AS admin_user;
