-- ایجاد جدول assessment_states
USE hrbooteh_db;

CREATE TABLE IF NOT EXISTS assessment_states (
  id INT AUTO_INCREMENT PRIMARY KEY,
  session_id VARCHAR(255) UNIQUE NOT NULL,
  state_data JSON NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- اضافه کردن index برای بهبود عملکرد
CREATE INDEX idx_session_id ON assessment_states(session_id);
CREATE INDEX idx_created_at ON assessment_states(created_at);

-- ایجاد جدول برای پرسشنامه خودارزیابی مهارت‌های نرم
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
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- اضافه کردن index برای بهبود عملکرد
CREATE INDEX idx_user_id_soft_skills ON soft_skills_self_assessment(user_id);
