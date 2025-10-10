// Tim
import { getCurrentUser } from "./auth.js";
import { showToast } from "./toast.js";

const API_BASE =
  typeof window !== "undefined" && window.API_BASE ? window.API_BASE : "";

const content = document.getElementById("content");
const me = await getCurrentUser();
if (!me) {
  content.innerHTML = '<div class="alert alert-warning">Please sign in.</div>';
} else {
  const uname = me.username;
  const email = me.email;
  const full_name = me.full_name;

  content.innerHTML = `
    <div class="row justify-content-center">
      <div class="col-md-6 col-lg-5">
        <div class="card shadow-sm border-0 rounded-4">
          <div class="card-body text-center p-4">
            <img src="/images/user.png" alt="Profile picture" class="rounded-circle mb-3" width="100" height="100">
            <dl class="row text-start">
              <dt class="col-4 fw-semibold">Full Name</dt>
              <dd class="col-8" id="fullName">${full_name}</dd>

              <dt class="col-4 fw-semibold">Username</dt>
              <dd class="col-8" id="username">${uname}</dd>

              <dt class="col-4 fw-semibold">Email</dt>
              <dd class="col-8" id="email">${email}</dd>
            </dl>
          </div>
          <div class="card-footer bg-transparent border-0">
            <button id="deleteAccount" class="btn btn-danger w-100">Delete Account</button>
          </div>
        </div>
      </div>
    </div>`;
}

const deleteAccountBtn = document.getElementById("deleteAccount");
const modalElement = document.getElementById("confirmDeleteModal");
const confirmDeleteBtn = document.getElementById("confirmDeleteBtn");

const modalInstance =
  modalElement && window.bootstrap?.Modal
    ? window.bootstrap.Modal.getOrCreateInstance(modalElement)
    : null;

async function handleAccountDeletion() {
  try {
    const res = await fetch(`${API_BASE}/users/me`, {
      method: "DELETE",
      credentials: "include",
    });

    if (!res.ok) {
      const problem = await res.json().catch(() => ({}));
      const message = problem.error || "Unable to delete your account.";
      showToast(message, "danger");
      return;
    }

    showToast("Your account has been deleted.", "success");
    location.href = "/";
  } catch (err) {
    console.error("Delete account failed:", err);
    showToast(
      "Something went wrong deleting your account. Please try again.",
      "danger",
    );
  }
}

deleteAccountBtn?.addEventListener("click", () => {
  if (modalInstance) {
    modalInstance.show();
  } else {
    const confirmed = window.confirm(
      "Are you sure you want to delete your account? This action cannot be undone.",
    );
    if (confirmed) handleAccountDeletion();
  }
});

confirmDeleteBtn?.addEventListener("click", async () => {
  await handleAccountDeletion();
  modalInstance?.hide();
});
