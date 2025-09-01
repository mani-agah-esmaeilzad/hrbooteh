import mysql from 'mysql2/promise';

// پیکربندی دیتابیس
const dbConfig = {
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: parseInt(process.env.DB_PORT || '3306'),
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  charset: 'utf8mb4'
};

// ایجاد pool connection
const pool = mysql.createPool(dbConfig);

// Retry logic برای اتصال
export async function getConnectionWithRetry(maxRetries = 3, delay = 1000) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      const connection = await pool.getConnection();
      return connection;
    } catch (error: any) {
      console.warn(`Connection attempt ${i + 1} failed:`, error.message);
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, delay));
    }
  }
}

// تست اتصال
export async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('✅ اتصال به دیتابیس MySQL برقرار شد');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ خطا در اتصال به دیتابیس:', error);
    return false;
  }
}

// ایجاد جداول مورد نیاز
export async function createTables() {
  try {
    const connection = await pool.getConnection();
    
    // جدول کاربران
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS users (
        id INT AUTO_INCREMENT PRIMARY KEY,
        username VARCHAR(50) UNIQUE NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name VARCHAR(50) NOT NULL,
        last_name VARCHAR(50) NOT NULL,
        phone_number VARCHAR(20),
        age INT,
        education_level VARCHAR(100),
        work_experience VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
      )
    `);

    // جدول توکن‌های احراز هویت
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS auth_tokens (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        token VARCHAR(500) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // جدول ارزیابی‌ها
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assessments (
        id INT AUTO_INCREMENT PRIMARY KEY,
        user_id INT NOT NULL,
        questionnaire_id INT NOT NULL,
        score INT,
        max_score INT DEFAULT 100,
        level VARCHAR(50),
        description TEXT,
        analysis_result JSON,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        completed_at TIMESTAMP NULL,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // جدول پیام‌های چت
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS chat_messages (
        id INT AUTO_INCREMENT PRIMARY KEY,
        assessment_id INT NOT NULL,
        user_id INT NOT NULL,
        message_type ENUM('user', 'ai1', 'ai2', 'system') NOT NULL,
        content TEXT NOT NULL,
        character_name VARCHAR(100),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (assessment_id) REFERENCES assessments(id) ON DELETE CASCADE,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // جدول وضعیت‌های ارزیابی
    await connection.execute(`
      CREATE TABLE IF NOT EXISTS assessment_states (
        id INT AUTO_INCREMENT PRIMARY KEY,
        session_id VARCHAR(255) UNIQUE NOT NULL,
        state_data JSON NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // جدول خودارزیابی مهارت‌های نرم
    await connection.execute(`
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
      )
    `);

    console.log('✅ جداول دیتابیس با موفقیت ایجاد شدند');
    connection.release();
    return true;
  } catch (error) {
    console.error('❌ خطا در ایجاد جداول:', error);
    return false;
  }
}

export default pool;
