import express from "express";
import { authRequired } from "./middleware.js";
import { ObjectId } from "mongodb";

const router = express.Router();

// Lazy import to avoid CJS/ESM headaches on cold start
async function getBson() {
  const mod = await import("mongodb");
  return { Int32: mod.Int32 };
}

/**
 * POST /inventory/upsert
 * Body: { oracle_id: string, qty_owned?: number (default 1), foil?: boolean, condition?: string }
 * Behavior: increments qty_owned by given amount (default +1). Creates doc if missing.
 */
router.post("/upsert", authRequired, async (req, res) => {
  try {
    const { Int32 } = await getBson();
    const db = req.app.locals.db;
    const Inventory = db.collection("inventory");

    const user_id = req.user._id; // stored as string per our schema
    const { oracle_id } = req.body || {};
    let { qty_owned = 1, foil = false, condition = "NM" } = req.body || {};

    if (!oracle_id)
      return res.status(400).json({ error: "oracle_id required" });

    // Force integers and booleans to expected BSON types
    const incQty = new Int32(parseInt(qty_owned, 10) || 1);
    const now = new Date();

    await Inventory.updateOne(
      { user_id, oracle_id: String(oracle_id) },
      {
        $setOnInsert: {
          user_id,
          oracle_id: String(oracle_id),
          createdAt: now,
          foil: !!foil,
          condition: String(condition || "NM"),
        },
        $inc: { qty_owned: incQty },
        $set: { lastUpdated: now },
      },
      { upsert: true },
    );

    // Fetch the current doc to return
    const doc = await Inventory.findOne({
      user_id,
      oracle_id: String(oracle_id),
    });
    return res.json({ ok: true, item: doc });
  } catch (e) {
    console.error("inventory/upsert error:", e);
    return res.status(500).json({
      error: "Inventory upsert failed",
      details: e.message,
    });
  }
});

/**
 * DELETE /inventory/:id
 * Deletes a single inventory card for the signed-in user.
 */
router.delete("/:id", authRequired, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const Inventory = db.collection("inventory");
    const { id } = req.params;
    const user_id = req.user._id;

    if (!ObjectId.isValid(id)) {
      return res.status(400).json({ error: "Invalid card ID" });
    }

    const result = await Inventory.deleteOne({
      _id: new ObjectId(id),
      user_id, // ensure user owns it
    });

    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Card not found or not yours" });
    }

    res.json({ ok: true });
  } catch (err) {
    console.error("inventory/delete error:", err);
    res.status(500).json({
      error: "Failed to delete inventory item",
      details: err.message,
    });
  }
});

/**
 * GET /inventory
 * Optional helper route to view current user's inventory (for debugging/UI)
 */
router.get("/", authRequired, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const Inventory = db.collection("inventory");
    const user_id = req.user._id;

    const items = await Inventory.find({ user_id }).toArray();
    res.json({ ok: true, items });
  } catch (err) {
    console.error("inventory/get error:", err);
    res.status(500).json({
      error: "Failed to fetch inventory",
      details: err.message,
    });
  }
});

router.get("/:id", authRequired, async (req, res) => {
  try {
    const db = req.app.locals.db;
    const { id } = req.params;
    const user_id = req.user._id;

    const card = await db.collection("inventory").findOne({
      _id: new ObjectId(id),
      user_id,
    });

    if (!card) return res.status(404).json({ error: "Card not found" });

    // ✅ Fetch full card data from Scryfall using oracle_id
    const scryRes = await fetch(
      `https://api.scryfall.com/cards/search?q=oracleid:${card.oracle_id}`,
    );
    let scryData = null;

    if (scryRes.ok) {
      scryData = await scryRes.json();
    }

    // Attach card details to the response
    res.json({
      item: {
        ...card,
        card: scryData,
      },
    });
  } catch (err) {
    console.error("Error fetching card:", err);
    res.status(500).json({ error: "Failed to fetch card details" });
  }
});

export default router;
