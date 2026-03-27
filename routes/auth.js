import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import pool from "../config/db.js";

const router = express.Router();
const SECRET = process.env.JWT_SECRET || "thoughtforge_secret_key";

// 회원가입
router.post("/register", async (req, res) => {
  const { username, email, password } = req.body;
  if (!username || !email || !password) {
    return res.status(400).json({ error: "모든 필드를 입력해주세요." });
  }
  try {
    const hashed = await bcrypt.hash(password, 10);
    const [result] = await pool.execute(
      "INSERT INTO users (username, email, password) VALUES (?, ?, ?)",
      [username, email, hashed]
    );
    const user = { id: result.insertId, username, email };
    const token = jwt.sign(user, SECRET, { expiresIn: "7d" });
    res.json({ token, user });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "이미 사용 중인 이메일 또는 사용자명입니다." });
    }
    res.status(500).json({ error: "회원가입 실패" });
  }
});

// 로그인
router.post("/login", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: "이메일과 비밀번호를 입력해주세요." });
  }
  try {
    const [rows] = await pool.execute("SELECT * FROM users WHERE email = ?", [email]);
    if (!rows.length) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 틀렸습니다." });
    }
    const user = rows[0];
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "이메일 또는 비밀번호가 틀렸습니다." });
    }
    const payload = { id: user.id, username: user.username, email: user.email };
    const token = jwt.sign(payload, SECRET, { expiresIn: "7d" });
    res.json({ token, user: payload });
  } catch {
    res.status(500).json({ error: "로그인 실패" });
  }
});

export default router;
