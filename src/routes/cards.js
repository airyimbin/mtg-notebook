import express from "express";

const router = express.Router();

// GET /cards — search with filters
router.get("/", async (req, res) => {
  const db = req.app.locals.db;
  const Cards = db.collection("cards");

  const {
    q,
    cmdLegal,
    ci,
    cmc_lte,
    cmc_gte,
    types,
    limit = 24,
    page = 1,
  } = req.query;
  const filter = {};

  if (q) filter.$text = { $search: q };
  if (cmdLegal !== undefined && req.query.cmdLegal !== "")
    filter["legalities.commander"] = "legal";
  if (ci) {
    const cols = ci.split(/[ ,]+/).filter(Boolean);
    filter.color_identity = { $all: cols };
  }
  const cmcQuery = {};
  if (cmc_gte !== undefined && req.query.cmc_gte !== "")
    cmcQuery.$gte = Number(cmc_gte);
  if (cmc_lte !== undefined && req.query.cmc_lte !== "")
    cmcQuery.$lte = Number(cmc_lte);
  if (Object.keys(cmcQuery).length) filter.cmc = cmcQuery;
  if (types) filter.type_line = { $regex: types, $options: "i" };

  const numericLimit = Math.max(1, Math.min(100, Number(limit)));
  const numericPage = Math.max(1, Number(page));
  const skip = (numericPage - 1) * numericLimit;

  const projection = {
    oracle_id: 1,
    name: 1,
    type_line: 1,
    oracle_text: 1,
    cmc: 1,
    color_identity: 1,
    mana_cost: 1,
    image_uris: 1,
    prices: 1,
    legalities: 1,
  };

  const [items, total] = await Promise.all([
    Cards.find(filter)
      .project(projection)
      .sort({ name: 1 })
      .skip(skip)
      .limit(numericLimit)
      .toArray(),
    Cards.countDocuments(filter),
  ]);

  res.json({
    page: numericPage,
    limit: numericLimit,
    total,
    pages: Math.ceil(total / numericLimit),
    items,
  });
});

// GET /cards/:oracleId — detail
router.get("/:oracleId", async (req, res) => {
  const db = req.app.locals.db;
  const Cards = db.collection("cards");
  const card = await Cards.findOne({ oracle_id: req.params.oracleId });
  if (!card) return res.status(404).json({ error: "Not found" });
  res.json(card);
});

export default router;
