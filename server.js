import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import aiRoutes from "./routes/ai.js";
import authRoutes from "./routes/auth.js";
import historyRoutes from "./routes/history.js";
import { initDB } from "./config/db.js";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api/ai", aiRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/history", historyRoutes);

const PORT = process.env.PORT || 3005;

async function start() {
  try {
    await initDB();
    const server = app.listen(PORT, () => {
      console.log(`✅ Server running on http://localhost:${PORT}`);
    });

    server.on("error", (err) => {
      if (err.code === "EADDRINUSE") {
        console.error(`❌ 포트 ${PORT}이 이미 사용 중입니다.`);
      } else {
        console.error("❌ 서버 오류:", err);
      }
      process.exit(1);
    });
  } catch (err) {
    console.error("❌ 서버 시작 실패:", err.message);
    process.exit(1);
  }
}

start();
