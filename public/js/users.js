import { ensureSignedIn } from "./auth.js";

(async () => {
  const API_BASE = window.API_BASE || "";
  const content = document.getElementById("content");

  // Check authentication
  const authed = await ensureSignedIn({
    onSignedOut() {
      content.innerHTML =
        '<div class="alert alert-warning">Please sign in to view your decks and inventory. <a href="/signin.html" class="alert-link">Sign in</a>.</div>';
    },
  });
  if (!authed) return;

  // Fetch overview (includes inventory)
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

  // Build HTML list with delete + clickable card
  const invHTML = inventory
    .map((i) => {
      const c = i.card || {};
      const name = c.name || i.oracle_id;
      const img = c.image_uris?.small
        ? `<img src="${c.image_uris.small}" class="me-2 rounded" style="width:40px;height:auto">`
        : "";
      const id = i._id || i.id || "";

      return `
      <li class="list-group-item d-flex align-items-center justify-content-between card-item" data-id="${id}" style="cursor:pointer;">
        <div class="d-flex align-items-center flex-grow-1">
          ${img}<span>${name}</span>
          <span class="ms-2 text-muted">× ${i.qty_owned || 1}</span>
        </div>
        <button class="btn btn-sm btn-outline-danger delete-btn" data-id="${id}" onclick="event.stopPropagation();">
          Delete
        </button>
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

  // Attach DELETE handlers
  document.querySelectorAll(".delete-btn").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      const id = e.target.dataset.id;
      if (!id) return;

      const item = e.target.closest(".list-group-item");
      item.style.opacity = "0.5";
      e.target.disabled = true;
      e.target.textContent = "Deleting...";

      try {
        const delRes = await fetch(`${API_BASE}/inventory/${id}`, {
          method: "DELETE",
          credentials: "include",
        });

        if (!delRes.ok) {
          const err = await delRes.json().catch(() => ({}));
          alert(err.error || "Failed to delete card");
          item.style.opacity = "1";
          e.target.disabled = false;
          e.target.textContent = "Delete";
          return;
        }

        item.remove();
        const header = document.querySelector(".card-header");
        const remaining = document.querySelectorAll(".list-group-item").length;
        header.textContent = `Inventory (Cards: ${remaining})`;
      } catch (err) {
        console.error("Error deleting card:", err);
        alert("Network error while deleting card");
        item.style.opacity = "1";
        e.target.disabled = false;
        e.target.textContent = "Delete";
      }
    });
  });

  // Attach CARD CLICK handlers (open detail page)
  document.querySelectorAll(".card-item").forEach((li) => {
    li.addEventListener("click", () => {
      const id = li.dataset.id;
      if (id) {
        window.location.href = `/card.html?id=${id}`;
      }
    });
  });
})();
