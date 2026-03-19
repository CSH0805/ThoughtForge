import express from "express";
import { processThought } from "../services/openaiService.js";

const router = express.Router();

router.post("/organize", async (req, res) => {
  try {
    const { thought } = req.body;

    if (!thought) {
      return res.status(400).json({ error: "thought is required" });
    }

    const result = await processThought(thought);

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "AI processing failed" });
  }
});

export default router;
