// Tim
// src/routes/auth.js
import express from "express";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { ObjectId } from "mongodb";

const router = express.Router();
const JWT_SECRET = process.env.JWT_SECRET || "dev-secret-change-me";
const isProd = process.env.NODE_ENV === "production";
const maxAge = 7 * 24 * 60 * 60 * 1000; // 7 days

const cookieOpts = {
  httpOnly: true,
  secure: (process.env.COOKIE_SECURE ?? "true") === "true" ? true : !!isProd,
  sameSite: "lax", // same-site via Vercel /api rewrite
  path: "/",
  maxAge,
};

function signJwt(payload, { days = 7 } = {}) {
  return jwt.sign(payload, JWT_SECRET, { expiresIn: `${days}d` });
}

// POST /auth/signup
router.post("/signup", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const Users = db.collection("users");

    const { full_name, email, username, password } = req.body || {};
    if (!full_name || !email || !username || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const existing = await Users.findOne({ $or: [{ email }, { username }] });
    if (existing)
      return res
        .status(409)
        .json({ error: "Email or username has been taken" });

    const password_hash = await bcrypt.hash(String(password), 12);
    const now = new Date();
    const doc = { full_name, email, username, password_hash, createdAt: now };

    const r = await Users.insertOne(doc);
    const user = { _id: String(r.insertedId), email, username, full_name };

    const token = signJwt({ _id: user._id, email: user.email });
    res.cookie("token", token, cookieOpts);
    return res.status(201).json({ user });
  } catch (e) {
    console.error("signup error:", e);
    return res.status(500).json({ error: "Signup Failed" });
  }
});

// POST /auth/login
router.post("/login", async (req, res) => {
  try {
    const db = req.app.locals.db;
    const Users = db.collection("users");

    // Accept multiple shapes for convenience
    const emailOrUsername =
      req.body?.emailOrUsername || req.body?.email || req.body?.username || "";

    const password = String(req.body?.password || "");

    if (!emailOrUsername || !password) {
      return res.status(400).json({ error: "Missing credentials" });
    }

   const query = emailOrUsername.includes("@")
      ? { email: emailOrUsername.toLowerCase() }
      : { username: emailOrUsername };
    const user = await Users.findOne(query);

    if (!user) return res.status(401).json({ error: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.password_hash);
    if (!ok) return res.status(401).json({ error: "Invalid credentials" });

    const publicUser = {
      _id: String(user._id),
      email: user.email,
      username: user.username,
      full_name: user.full_name,
    };

    const token = signJwt({ _id: publicUser._id, email: publicUser.email });
    res.cookie("token", token, cookieOpts);
    return res.json({ user: publicUser });
  } catch (e) {
    console.error("login error:", e);
    return res.status(500).json({ error: "Login failed" });
  }
});

// GET /auth/me
router.get("/me", async (req, res) => {
  const token = req.cookies?.token;
  if (!token) return res.status(401).json({ error: "Authentication required" });

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    const db = req.app.locals.db;
    const Users = db.collection("users");

    const user = await Users.findOne(
      { _id: new ObjectId(payload._id) },
      { projection: { passwordHash: 0 } },
    );

    if (!user) return res.status(404).json({ error: "User not found" });

    // Return only safe fields
    res.json({
      user: {
        _id: String(user._id),
        username: user.username,
        email: user.email,
        full_name: user.full_name,
        createdAt: user.createdAt,
      },
    });
  } catch (err) {
    console.error("GET /auth/me error:", err);
    return res.status(401).json({ error: "Authentication Required" });
  }
});

// POST /auth/logout
router.post("/logout", (req, res) => {
  res.clearCookie("token", { ...cookieOpts, maxAge: undefined });
  return res.json({ ok: true });
});

export default router;
