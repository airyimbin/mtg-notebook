//Rudra

import {
  cardBadgeColors,
  manaCostSymbols,
  convertedManaCost,
  legalityText,
  renderOracleTextWithSymbols,
} from "./index.js";

const API_BASE = window.API_BASE || "";
const container = document.getElementById("card-details");

// Extract ?id= from URL
const params = new URLSearchParams(window.location.search);
const id = params.get("id");

if (!id) {
  container.innerHTML =
    '<div class="alert alert-danger">No card ID provided.</div>';
} else {
  loadCard();
}

async function loadCard() {
  try {
    const res = await fetch(`${API_BASE}/inventory/${id}`, {
      credentials: "include",
    });
    if (!res.ok) throw new Error("Failed to load card");

    const { item } = await res.json();
    if (!item) {
      container.innerHTML =
        '<div class="alert alert-warning">Card not found.</div>';
      return;
    }

    // Normalize card data
    let c = item.card || {};
    if (Array.isArray(c.data) && c.data.length > 0) c = c.data[0];

    const name = c.name || "Unknown Card";
    const type = c.type_line || "Unknown Type";
    const oracleText = c.oracle_text
      ? renderOracleTextWithSymbols(c.oracle_text).replaceAll("\n", "<br>")
      : "No description available.";
    const cmcHTML = convertedManaCost(c.cmc);
    const manaHTML = manaCostSymbols(c.mana_cost || "");
    const colorsHTML = cardBadgeColors(c.color_identity);
    const legal = legalityText(c.legalities);
    const img = c.image_uris?.normal || c.image_uris?.large || "";

    const qty = item.qty_owned || 1;
    const foil = item.foil ? "Yes" : "No";
    const condition = item.condition || "NM";
    const scryfallLink = c.scryfall_uri
      ? `<a href="${c.scryfall_uri}" target="_blank" class="text-decoration-none">View on Scryfall ↗️</a>`
      : "";

    container.innerHTML = `
      <div class="row g-4 align-items-start">
        <div class="col-md-4 text-center">
          ${
            img
              ? `<img src="${img}" class="img-fluid rounded shadow-sm mb-3" alt="${name}">`
              : `<div class="text-muted">No image available</div>`
          }
          <div>${legal}</div>
          <div class="mt-2">${scryfallLink}</div>
        </div>

        <div class="col-md-8">
          <h3 class="fw-bold mb-1">${name}</h3>
          <p class="text-muted mb-3">${type}</p>
          <p>${oracleText}</p>
          <hr>
          <p><strong>CMC:</strong> ${cmcHTML}</p>
          <p><strong>Mana Cost:</strong> ${manaHTML}</p>
          <p><strong>Color Identity:</strong> ${colorsHTML}</p>
          <hr>
          <p><strong>Quantity Owned:</strong> ${qty}</p>
          <p><strong>Condition:</strong> ${condition}</p>
          <p><strong>Foil:</strong> ${foil}</p>
        </div>
      </div>
    `;
  } catch (err) {
    console.error("Error loading card:", err);
    container.innerHTML =
      '<div class="alert alert-danger">Error loading card details.</div>';
  }
}
