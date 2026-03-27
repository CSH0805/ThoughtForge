import mysql from "mysql2/promise";
import dotenv from "dotenv";
dotenv.config();

const DB_NAME = process.env.DB_NAME || "thoughtforge";

// DB 없을 때 생성용 풀
const initPool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
});

// 메인 풀
const pool = mysql.createPool({
  host: process.env.DB_HOST || "localhost",
  user: process.env.DB_USER || "root",
  password: process.env.DB_PASSWORD || "",
  database: DB_NAME,
  waitForConnections: true,
  connectionLimit: 10,
});

export async function initDB() {
  // DB 자동 생성
  await initPool.execute(`CREATE DATABASE IF NOT EXISTS \`${DB_NAME}\``);

  // 유저 테이블
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS users (
      id INT AUTO_INCREMENT PRIMARY KEY,
      username VARCHAR(50) NOT NULL UNIQUE,
      email VARCHAR(100) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // 생각 기록 테이블
  await pool.execute(`
    CREATE TABLE IF NOT EXISTS thoughts (
      id INT AUTO_INCREMENT PRIMARY KEY,
      user_id INT NOT NULL,
      title VARCHAR(100),
      thought TEXT NOT NULL,
      markdown LONGTEXT,
      nodes JSON,
      edges JSON,
      prompts JSON,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
    )
  `);

  console.log("✅ DB 초기화 완료");
}

export default pool;
