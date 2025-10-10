// Tim
// src/routes/middleware.js
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";

// Per-route guard
export function authRequired(req, res, next) {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Not logged in" });
  try {
    const payload = jwt.verify(token, JWT_SECRET);
    // Minimal shape for downstream routes
    req.user = { _id: payload._id, email: payload.email };
    next();
  } catch {
    return res.status(401).json({ error: "Not logged in" });
  }
}
