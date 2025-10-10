// Rudra and Tim
// public/nav.js
import { getCurrentUser } from "./auth.js";

const API_BASE =
  typeof window !== "undefined" && window.API_BASE ? window.API_BASE : "";

const link = (href, label) =>
  `<a class="nav-link px-2" href="${href}">${label}</a>`;

(async () => {
  const mount = document.getElementById("navMount");
  if (!mount) return;

  const me = await getCurrentUser();
  const uname = me
    ? me.username || (me.email || "").split("@")[0] || "user"
    : null;

  // Right cluster: page links + auth controls in one row
  const pages = [
    link("/", "Home"),
    link("/users.html", "My Stuff"),
    link("/instructions.html", "Instructions"),
  ].join("");

  const authHtml = me
    ? `
      <a class="btn btn-outline-secondary d-flex align-items-center gap-2" href="/profile.html">
        <span>@${uname}</span>
      </a>
      <button id="signOutBtn" class="btn btn-outline-danger">Sign out</button>
    `
    : `
      <a class="btn btn-outline-secondary" href="/signin.html">Sign In</a>
      <a class="btn btn-primary" href="/signup.html">Sign Up</a>
    `;

  mount.innerHTML = `
    <div class="container-fluid d-flex align-items-center justify-content-between">
      <a class="navbar-brand" href="/">MTG Notebook</a>

      <!-- Right side: all items in a single row -->
      <div class="d-flex align-items-center gap-3 flex-nowrap">
        <nav class="nav d-flex align-items-center gap-2 flex-nowrap">
          ${pages}
        </nav>
        <div class="d-flex align-items-center gap-2 flex-nowrap">
          ${authHtml}
        </div>
      </div>
    </div>
  `;

  // Wire sign out
  const btn = document.getElementById("signOutBtn");
  if (btn) {
    btn.addEventListener("click", async () => {
      try {
        await fetch(`${API_BASE}/auth/logout`, {
          method: "POST",
          credentials: "include",
        });
      } catch (err) {
        console.error("Sign out failed:", err);
      }
      location.href = "/";
    });
  }
})();
