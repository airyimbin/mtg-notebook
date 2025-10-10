const API_BASE = window.API_BASE || "";
const $ = (id) => document.getElementById(id);
function showError(msg) {
  const a = $("alert");
  a.textContent = msg || "Please check the fields";
  a.classList.remove("d-none");
}
async function call(path, body) {
  try {
    const r = await fetch(API_BASE + path, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify(body),
    });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) {
      showError(j.error || "Could not sign up");
      return null;
    }
    return j;
  } catch {
    showError("Network error");
    return null;
  }
}
$("signup").addEventListener("click", async () => {
  $("alert").classList.add("d-none");
  const body = {
    full_name: $("full_name").value.trim(),
    username: $("username").value.trim(),
    email: $("email").value.trim(),
    password: $("password").value,
  };
  if (!body.full_name || !body.username || !body.email || !body.password) {
    showError("All fields are required");
    return;
  }
  const j = await call("/auth/signup", body);
  if (!j) return;
  location.href = "/"; // go to main page
});
