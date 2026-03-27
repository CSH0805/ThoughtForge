import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET || "thoughtforge_secret_key";

export function authMiddleware(req, res, next) {
  const auth = req.headers.authorization;
  if (!auth || !auth.startsWith("Bearer ")) {
    return res.status(401).json({ error: "인증이 필요합니다." });
  }
  try {
    req.user = jwt.verify(auth.split(" ")[1], SECRET);
    next();
  } catch {
    res.status(401).json({ error: "유효하지 않은 토큰입니다." });
  }
}

export function optionalAuth(req, res, next) {
  const auth = req.headers.authorization;
  if (auth && auth.startsWith("Bearer ")) {
    try {
      req.user = jwt.verify(auth.split(" ")[1], SECRET);
    } catch {}
  }
  next();
}
