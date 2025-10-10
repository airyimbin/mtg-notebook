import express from "express";
import { ObjectId } from "mongodb";
import { authRequired } from "./middleware.js";

const router = express.Router();

// /users/me/overview?expand=1
router.get("/me/overview", authRequired, async (req, res) => {
  const db = req.app.locals.db;
  const Decks = db.collection("decks");
  const Inventory = db.collection("inventory");

  const [decks, inventory] = await Promise.all([
    Decks.find({ user_id: req.user._id })
      .sort({ updatedAt: -1 })
      .limit(100)
      .toArray(),
    Inventory.find({ user_id: req.user._id })
      .sort({ lastUpdated: -1 })
      .limit(1000)
      .toArray(),
  ]);

  // Expand with card details when requested
  if (String(req.query.expand || "0") === "1") {
    const Cards = db.collection("cards");
    const allOracleIds = new Set();
    for (const d of decks) {
      if (d.commander_oracle_id) allOracleIds.add(d.commander_oracle_id);
      for (const oid of d.card_oracle_ids || []) allOracleIds.add(oid);
    }
    for (const i of inventory) allOracleIds.add(i.oracle_id);
    const lookup = await Cards.find({ oracle_id: { $in: [...allOracleIds] } })
      .project({ oracle_id: 1, name: 1, image_uris: 1, type_line: 1 })
      .toArray();
    const map = new Map(lookup.map((c) => [c.oracle_id, c]));
    const decksExpanded = decks.map((d) => ({
      ...d,
      _id: d._id.toString(),
      commander: d.commander_oracle_id
        ? map.get(d.commander_oracle_id) || null
        : null,
      cards: (d.card_oracle_ids || []).map(
        (oid) => map.get(oid) || { oracle_id: oid },
      ),
    }));
    const inventoryExpanded = inventory.map((i) => ({
      ...i,
      card: map.get(i.oracle_id) || { oracle_id: i.oracle_id },
    }));
    return res.json({ decks: decksExpanded, inventory: inventoryExpanded });
  }

  res.json({
    decks: decks.map((d) => ({ ...d, _id: d._id.toString() })),
    inventory,
  });
});

router.delete("/me", authRequired, async (req, res) => {
  const db = req.app.locals.db;
  const Users = db.collection("users");
  const Inventory = db.collection("inventory");

  const userId = req.user?._id;
  if (!userId) return res.status(401).json({ error: "Not logged in" });

  let objectId;
  try {
    objectId = new ObjectId(userId);
  } catch {
    return res.status(400).json({ error: "Invalid user id" });
  }

  try {
    const existingUser = await Users.findOne({ _id: objectId });
    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    await Promise.all([
      Users.deleteOne({ _id: objectId }),
      Inventory.deleteMany({ user_id: userId }),
    ]);

    res.clearCookie("token", {
      path: "/",
      sameSite: "lax",
      httpOnly: true,
      secure:
        (process.env.COOKIE_SECURE ?? "true") === "true"
          ? true
          : !!(process.env.NODE_ENV === "production"),
    });

    return res.status(204).send();
  } catch (err) {
    console.error("DELETE /users/me error:", err);
    return res.status(500).json({ error: "Failed to delete account" });
  }
});

export default router;
