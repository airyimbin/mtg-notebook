// Tim
// public/signin.js
const API_BASE = window.API_BASE || "";
import { showToast } from "./toast.js";

const form = document.getElementById("signinForm");

form?.addEventListener("submit", async (e) => {
  e.preventDefault();

  const emailOrUsername = document
    .getElementById("emailOrUsername")
    .value.trim();
  const password = document.getElementById("password").value;

  if (!emailOrUsername || !password) {
    showToast("Please enter your email/username and password.", "warning");
    return;
  }

  try {
    //removed /api from endpoint
    const res = await fetch(`${API_BASE}/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      credentials: "include",
      body: JSON.stringify({ emailOrUsername, password }),
    });

    const data = await res.json().catch(() => ({}));

    if (!res.ok) {
      const msg =
        data.error === "invalid_credentials"
          ? "Invalid email/username or password."
          : data.error || "Sign in failed.";
      showToast(msg, "danger");
      return;
    }

    showToast("Signed in! Redirecting...", "success");
    setTimeout(() => {
      location.href = "/";
    }, 1000);
  } catch (err) {
    console.error("Sign in error:", err);
    showToast("Unable to reach the server. Please try again later.", "danger");
  }
});
