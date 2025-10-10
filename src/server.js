// src/server.js
import express from "express";
import morgan from "morgan";
import cors from "cors";
import path from "path";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import rateLimit from "express-rate-limit";
import { fileURLToPath } from "url";
import dotenv from "dotenv";

import { connectDB } from "./db.js";
import authRouter from "./routes/auth.js";
import cardsRouter from "./routes/cards.js";
import usersRouter from "./routes/users.js";
import inventoryRoutes from "./routes/inventory.js"; // ensure it’s imported

dotenv.config();

const app = express();
app.set("trust proxy", 1); // <— IMPORTANT on Railway/Vercel

// CORS: only needed if you sometimes call Railway origin directly in the browser.
// If you always go through Vercel /api, you can remove this block.
if (process.env.CORS_ORIGIN) {
  app.use(
    cors({
      origin: [process.env.CORS_ORIGIN],
      credentials: true,
    }),
  );
}

app.use(
  helmet({
    contentSecurityPolicy: false,
  }),
);
app.use(morgan("tiny"));
app.use(cookieParser()); // <— must be before routes to read cookies
app.use(express.json({ limit: "2mb" }));

// Optional: rate limit auth endpoints
const authLimiter = rateLimit({ windowMs: 60_000, max: 60 });
app.use("/auth/", authLimiter);

// DB
const { db } = await connectDB();
app.locals.db = db;

// Routers (no auth guard here; routes apply their own)
app.use("/auth", authRouter);
app.use("/cards", cardsRouter);
app.use("/inventory", inventoryRoutes);
app.use("/users", usersRouter);

// Static for local dev only
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, "..", "public")));

// Health
app.get("/healthz", (_req, res) => res.json({ ok: true }));

const port = Number(process.env.PORT || 3000);
app.listen(port, () => {
  console.log(`Server listening on http://localhost:${port}`);
});
