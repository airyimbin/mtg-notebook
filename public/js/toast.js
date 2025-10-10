// public/toast.js
export function showToast(message, type = "info", delay = 3000) {
  const area = document.getElementById("toastArea");
  if (!area) return;

  const wrapper = document.createElement("div");
  wrapper.className = `toast align-items-center text-bg-${type} border-0`;
  wrapper.setAttribute("role", "alert");
  wrapper.setAttribute("aria-live", "assertive");
  wrapper.setAttribute("aria-atomic", "true");

  wrapper.innerHTML = `
    <div class="d-flex">
      <div class="toast-body">${message}</div>
      <button type="button" class="btn-close btn-close-white me-2 m-auto" data-bs-dismiss="toast" aria-label="Close"></button>
    </div>
  `;

  area.appendChild(wrapper);

  const toast = new bootstrap.Toast(wrapper, { delay });
  toast.show();

  wrapper.addEventListener("hidden.bs.toast", () => wrapper.remove());
}
