import express from "express";
import { authMiddleware } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const router = express.Router();

// 내 기록 목록
router.get("/", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT id, title, thought, created_at FROM thoughts WHERE user_id = ? ORDER BY created_at DESC",
      [req.user.id]
    );
    res.json(rows);
  } catch {
    res.status(500).json({ error: "기록 조회 실패" });
  }
});

// 특정 기록 상세
router.get("/:id", authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.execute(
      "SELECT * FROM thoughts WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    if (!rows.length) return res.status(404).json({ error: "찾을 수 없습니다." });
    const row = rows[0];
    res.json({
      ...row,
      nodes: typeof row.nodes === "string" ? JSON.parse(row.nodes) : row.nodes,
      edges: typeof row.edges === "string" ? JSON.parse(row.edges) : row.edges,
      prompts: typeof row.prompts === "string" ? JSON.parse(row.prompts) : row.prompts,
    });
  } catch {
    res.status(500).json({ error: "기록 조회 실패" });
  }
});

// 기록 삭제
router.delete("/:id", authMiddleware, async (req, res) => {
  try {
    await pool.execute(
      "DELETE FROM thoughts WHERE id = ? AND user_id = ?",
      [req.params.id, req.user.id]
    );
    res.json({ success: true });
  } catch {
    res.status(500).json({ error: "삭제 실패" });
  }
});

export default router;
