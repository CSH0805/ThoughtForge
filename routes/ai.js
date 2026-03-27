import express from "express";
import { processThought } from "../services/openaiService.js";
import { optionalAuth } from "../middleware/authMiddleware.js";
import pool from "../config/db.js";

const router = express.Router();

router.post("/organize", optionalAuth, async (req, res) => {
  try {
    const { thought } = req.body;
    if (!thought) return res.status(400).json({ error: "thought is required" });

    const result = await processThought(thought);

    // 로그인 상태면 DB에 저장
    if (req.user) {
      const title = thought.length > 40 ? thought.slice(0, 40) + "..." : thought;
      await pool.execute(
        "INSERT INTO thoughts (user_id, title, thought, markdown, nodes, edges, prompts) VALUES (?, ?, ?, ?, ?, ?, ?)",
        [
          req.user.id,
          title,
          thought,
          result.markdown,
          JSON.stringify(result.nodes),
          JSON.stringify(result.edges),
          JSON.stringify(result.prompts || []),
        ]
      );
    }

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

export default router;
