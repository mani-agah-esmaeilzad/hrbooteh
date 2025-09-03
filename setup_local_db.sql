-- Complete Database Setup for hrbooteh project
USE hrbooteh_db;

-- Users table
CREATE TABLE IF NOT EXISTS users (
    id INT AUTO_INCREMENT PRIMARY KEY,
    username VARCHAR(50) UNIQUE NOT NULL,
    email VARCHAR(100) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    first_name VARCHAR(50) NOT NULL,
    last_name VARCHAR(50) NOT NULL,
    phone VARCHAR(20),
    role ENUM('user', 'admin') DEFAULT 'user',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Questionnaires table
CREATE TABLE IF NOT EXISTS questionnaires (
    id INT AUTO_INCREMENT PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(50) NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Assessments table
CREATE TABLE IF NOT EXISTS assessments (
    id INT AUTO_INCREMENT PRIMARY KEY,
    user_id INT NOT NULL,
    questionnaire_id INT NOT NULL,
    score INT DEFAULT 0,
    max_score INT DEFAULT 0,
    level VARCHAR(100),
    description TEXT,
    completed_at TIMESTAMP NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (questionnaire_id) REFERENCES questionnaires(id) ON DELETE CASCADE
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
    id INT AUTO_INCREMENT PRIMARY KEY,
    assessment_id INT NOT NULL,
    user_id INT NOT NULL,
    message_type ENUM('user', 'ai', 'system', 'analysis') NOT NULL,
    content TEXT NOT NULL,
    character_name VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Assessment States table (for session management)
CREATE TABLE IF NOT EXISTS assessment_states (
    id INT AUTO_INCREMENT PRIMARY KEY,
    session_id VARCHAR(255) UNIQUE NOT NULL,
    state_data JSON NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);

-- Soft Skills Self Assessment table
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

-- Add indexes for better performance
CREATE INDEX idx_session_id ON assessment_states(session_id);
CREATE INDEX idx_created_at ON assessment_states(created_at);
CREATE INDEX idx_user_id_soft_skills ON soft_skills_self_assessment(user_id);
CREATE INDEX idx_assessment_messages ON chat_messages(assessment_id);
CREATE INDEX idx_user_messages ON chat_messages(user_id);
CREATE INDEX idx_user_assessments ON assessments(user_id);

-- Insert default questionnaires
INSERT IGNORE INTO questionnaires (id, title, description, type, is_active) VALUES
(1, 'ارزیابی نیاز به استقلال', 'گفتگوی تعاملی با آقای احمدی برای ارزیابی میزان نیاز به استقلال در محیط کار', 'independence', TRUE),
(2, 'خودارزیابی مهارت‌های نرم', 'پرسشنامه خودارزیابی 22 سوالی برای سنجش مهارت‌های نرم', 'soft_skills', TRUE);

-- Insert a test user (password is 'test123')
INSERT IGNORE INTO users (username, email, password_hash, first_name, last_name, role) VALUES
('testuser', 'test@test.com', '$2b$10$rQJ9aDQGQdGmTwP7RQJ9cOd3ksHQJ9aDQGQdGmTwP7RQJ9cOd3ksH', 'کاربر', 'تست', 'user');

SELECT 'Database setup completed successfully!' as message;
