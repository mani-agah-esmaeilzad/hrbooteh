-- ایجاد جدول assessment_states
USE arta_persia_db;

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
