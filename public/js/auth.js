//Tim
const API_BASE =
  typeof window !== "undefined" && window.API_BASE ? window.API_BASE : "";

export async function getCurrentUser() {
  try {
    const r = await fetch(`${API_BASE}/auth/me`, { credentials: "include" });
    if (!r.ok) return null;
    const j = await r.json();
    return j?.user || null;
  } catch {
    return null;
  }
}

export async function ensureSignedIn({ onSignedOut } = {}) {
  const me = await getCurrentUser();
  if (!me && typeof onSignedOut === "function") onSignedOut();
  return !!me;
}
