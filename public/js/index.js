// Tim
// public/app.js
import { getCurrentUser } from "./auth.js";
import { showToast } from "./toast.js";

const API_BASE =
  typeof window !== "undefined" && window.API_BASE ? window.API_BASE : "";
const resultsEl = document.getElementById("results");
const pageLabel = document.getElementById("pageLabel");
let page = 1;
const limit = 24;

// Don't assume auth until we check /auth/me
let authed = false;
let me = null;

async function checkAuth() {
  me = await getCurrentUser();
  authed = !!me;
  return authed;
}

function readInputs() {
  return {
    q: document.getElementById("q").value.trim(),
    types: document.getElementById("types").value.trim(),
    ci: document.getElementById("ci").value.trim().toUpperCase(),
    cmc_lte: document.getElementById("cmc_lte").value.trim(),
    cmc_gte: document.getElementById("cmc_gte").value.trim(),
    cmdLegal: document.getElementById("cmdLegal")?.checked ? "1" : "",
  };
}

async function addToInventory(oracle_id) {
  // Check auth just-in-time (handles case when user signed in on another tab)
  if (!(await checkAuth())) {
    showToast("Sign in required to add to inventory.", "warning");
    location.href = "/signin.html";
    return;
  }
  const res = await fetch(`${API_BASE}/inventory/upsert`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    credentials: "include",
    body: JSON.stringify({ oracle_id, qty_owned: 1 }),
  });
  if (!res.ok) {
    const e = await res.json().catch(() => ({}));
    showToast(e.error || "Could not add to inventory.", "danger");
    return;
  }
  showToast("Added to inventory ✅", "success");
}

export function cardBadgeColors(ci) {
  // const fill = {
  //   W: "#f8f6d9",
  //   U: "#c1d7e9",
  //   B: "#bab1ab",
  //   R: "#e49977",
  //   G: "#a3c095",
  //   C: "#cac5c0",
  // };
  return (ci && ci.length ? ci : ["C"])
    .map(
      (c) =>
        `<span title="Color: ${c}" class="card-symbol card-symbol-${c}">${c}</span>`,
    )
    .join("");
}

export function manaCostSymbols(manaCost) {
  if (!manaCost) return "<span>None</span>";
  return manaCost.replace(/\{([^}]+)\}/g, (_, raw) => {
    const clean = raw
      .replace(/\//g, "") // remove slashes (e.g., G/U → GU)
      .replace(/\s+/g, "") // trim spaces
      .toUpperCase(); // uppercase everything
    return `<span class="card-symbol card-symbol-${clean}"></span>`;
  });
}

export function legalityText(legalities) {
  if (!legalities) return "";
  const l = (legalities.commander || "")
    .replace(/_/g, " ")
    .replace(/\b([a-z])/g, (match) => match.toUpperCase());
  return `<span class="badge ${l === "Legal" ? "text-bg-success" : "text-bg-danger"}">Commander: ${l || "N/A"}</span>`;
}

export function convertedManaCost(cmc) {
  if (!cmc) return "<span>None</span>";
  return `<span title="Converted Mana Cost: ${cmc}" class="card-symbol card-symbol-${cmc}">${cmc}</span>`;
}

export function renderOracleTextWithSymbols(oracleText) {
  if (!oracleText) return "";

  return oracleText.replace(/\{([^}]+)\}/g, (_, raw) => {
    const clean = raw
      .replace(/\//g, "") // remove slashes (e.g., G/U → GU)
      .replace(/\s+/g, "") // trim spaces
      .toUpperCase(); // uppercase everything
    return `<span class="card-symbol card-symbol-${clean}"></span>`;
  });
}

function renderCards(items) {
  resultsEl.innerHTML = items
    .map((c) => {
      const img = c.image_uris?.normal || c.image_uris?.small || "";
      const colors = cardBadgeColors(c.color_identity);
      const legal = legalityText(c.legalities);
      return `
    <div class="col">
      <div class="card h-100 shadow-sm">
        ${img ? `<img src="${img}" class="card-img-top" alt="${c.name}">` : ""}
        <div class="card-body d-flex flex-column">
          <h5 class="card-title">${c.name}</h5>
          <p class="card-subtitle text-muted mb-2">${c.type_line || ""}</p>
          <p class="card-text small flex-grow-1">${renderOracleTextWithSymbols(c.oracle_text || "").replaceAll("\n", "<br>")}</p>
          <div class="mb-2">CMC: ${convertedManaCost(c.cmc)}<br>Color Identity: ${colors}<br>Mana Cost: ${manaCostSymbols(c.mana_cost || "")}<br>${legal}</div>
          <div class="d-flex gap-2">
            <button class="btn btn-outline-primary btn-sm" data-add-inv data-id="${c.oracle_id}">Add to Inventory</button>
          </div>
        </div>
      </div>
    </div>`;
    })
    .join("");
}

async function search() {
  const p = new URLSearchParams({ ...readInputs(), page, limit });
  const res = await fetch(`${API_BASE}/cards?${p.toString()}`);
  const data = await res.json();
  page = data.page;
  pageLabel.textContent = `Page ${data.page} / ${data.pages}`;
  renderCards(data.items || []);
}

// Events
document.getElementById("search")?.addEventListener("click", () => {
  page = 1;
  search();
});
document.getElementById("prev")?.addEventListener("click", () => {
  if (page > 1) {
    page--;
    search();
  }
});
document.getElementById("next")?.addEventListener("click", () => {
  page++;
  search();
});

resultsEl?.addEventListener("click", async (e) => {
  const btn = e.target.closest("[data-add-inv]");
  if (btn) {
    const oid = btn.getAttribute("data-id");
    await addToInventory(oid);
  }
});

// First auth check (non-blocking) then initial search
if (document.getElementById("q")) {
  checkAuth().finally(search);
}
