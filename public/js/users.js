// Rudra
import { ensureSignedIn } from "./auth.js";

(async () => {
  const API_BASE = window.API_BASE || "";
  const content = document.getElementById("content");

  // Auth check
  const authed = await ensureSignedIn({
    onSignedOut() {
      content.innerHTML =
        '<div class="alert alert-warning">Please sign in to view your decks and inventory. <a href="/signin.html" class="alert-link">Sign in</a>.</div>';
    },
  });
  if (!authed) return;

  // Fetch user overview
  const r = await fetch(`${API_BASE}/users/me/overview?expand=1`, {
    credentials: "include",
  });
  if (!r.ok) {
    content.innerHTML =
      '<div class="alert alert-warning">Please sign in.</div>';
    return;
  }

  const data = await r.json();
  const inventory = data.inventory || [];

  // Build inventory list
  const invHTML = inventory
    .map((i) => {
      const c = i.card || {};
      const name = c.name || i.oracle_id;
      const img = c.image_uris?.small
        ? `<img src="${c.image_uris.small}" class="me-2 rounded" style="width:40px;height:auto">`
        : "";
      const id = i._id || i.id || "";
      const oracleId = i.oracle_id;

      return `
      <li class="list-group-item d-flex align-items-center justify-content-between card-item" 
          data-id="${id}" 
          data-oracle="${oracleId}" 
          style="cursor:pointer;">
        <div class="d-flex align-items-center flex-grow-1">
          ${img}
          <span>${name}</span>
        </div>
        <div class="d-flex align-items-center gap-2">
          <button class="btn btn-sm btn-outline-secondary qty-btn" 
                  data-action="decrease" 
                  data-id="${id}" 
                  data-oracle="${oracleId}">−</button>
          <span class="text-muted qty" data-id="${id}">${i.qty_owned || 1}</span>
          <button class="btn btn-sm btn-outline-secondary qty-btn" 
                  data-action="increase" 
                  data-id="${id}" 
                  data-oracle="${oracleId}">+</button>
          <button class="btn btn-sm btn-outline-danger delete-btn" 
                  data-id="${id}" 
                  onclick="event.stopPropagation();">Delete</button>
        </div>
      </li>`;
    })
    .join("");

  const count = inventory.reduce((sum, i) => sum + (i.qty_owned || 0), 0);

  content.innerHTML = `
    <div class="row g-3">
      <div class="col-md-6">
        <div class="card shadow-sm">
          <div class="card-header">Inventory (Cards: ${count})</div>
          <ul class="list-group list-group-flush">
            ${invHTML || '<li class="list-group-item">No inventory yet</li>'}
          </ul>
        </div>
      </div>
    </div>`;

  // --- Helper: update header count ---
  function updateHeaderCount() {
    const header = document.querySelector(".card-header");
    const totalQty = Array.from(document.querySelectorAll(".qty")).reduce(
      (sum, el) => sum + (parseInt(el.textContent) || 0),
      0,
    );
    if (header) header.textContent = `Inventory (Cards: ${totalQty})`;
  }

  // --- Delete card (manual or auto-delete on zero) ---
  async function deleteCard(id, itemEl, removedQty = 1) {
    if (!itemEl) return;
    itemEl.style.transition = "opacity 0.3s";
    itemEl.style.opacity = "0.5";

    try {
      const delRes = await fetch(`${API_BASE}/inventory/${id}`, {
        method: "DELETE",
        credentials: "include",
      });

      if (!delRes.ok) {
        const err = await delRes.json().catch(() => ({}));
        alert(err.error || "Failed to delete card");
        itemEl.style.opacity = "1";
        return;
      }

      // Animate & remove
      itemEl.style.opacity = "0";
      setTimeout(() => itemEl.remove(), 300);

      // Update header correctly
      const header = document.querySelector(".card-header");
      const currentCountMatch = header.textContent.match(/\d+/);
      const currentTotal = currentCountMatch
        ? parseInt(currentCountMatch[0])
        : 0;
      const newTotal = Math.max(0, currentTotal - removedQty);
      if (header) header.textContent = `Inventory (Cards: ${newTotal})`;
    } catch (err) {
      console.error("Error deleting card:", err);
      alert("Network error while deleting card");
      itemEl.style.opacity = "1";
    }
  }

  // --- Delete handlers ---
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = e.target.dataset.id;
      if (!id) return;
      const itemEl = e.target.closest(".list-group-item");
      const qty = parseInt(itemEl.querySelector(".qty")?.textContent || "1");
      await deleteCard(id, itemEl, qty);
    });
  });

  // --- Quantity + / − handlers ---
  document.querySelectorAll(".qty-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      e.stopPropagation();
      const id = e.target.dataset.id;
      const oracle_id = e.target.dataset.oracle;
      const action = e.target.dataset.action;
      if (!id || !oracle_id) return;

      const qtySpan = document.querySelector(`.qty[data-id="${id}"]`);
      const itemEl = e.target.closest(".list-group-item");
      let currentQty = parseInt(qtySpan.textContent) || 0;
      const newQty =
        action === "increase" ? currentQty + 1 : Math.max(0, currentQty - 1);

      // Optimistic UI update
      qtySpan.textContent = newQty;

      // If hitting zero → delete card (using old qty)
      if (newQty === 0) {
        await deleteCard(id, itemEl, currentQty);
        return;
      }

      // Otherwise update backend quantity
      const delta = action === "increase" ? 1 : -1;
      try {
        const res = await fetch(`${API_BASE}/inventory/upsert`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "include",
          body: JSON.stringify({ oracle_id, qty_owned: delta }),
        });

        if (!res.ok) {
          const err = await res.json().catch(() => ({}));
          alert(err.error || "Failed to update quantity");
          qtySpan.textContent = currentQty; // revert UI
        } else {
          updateHeaderCount();
        }
      } catch (err) {
        console.error("Error updating quantity:", err);
        qtySpan.textContent = currentQty;
        alert("Network error updating quantity");
      }
    });
  });

  // --- Card click → open details page ---
  document.querySelectorAll(".card-item").forEach((li) => {
    li.addEventListener("click", () => {
      const id = li.dataset.id;
      if (id) window.location.href = `/card.html?id=${id}`;
    });
  });
})();
