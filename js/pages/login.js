import { signIn } from "../auth.js";
import { showMessage, showError, clearAlerts, showLoading, hideLoading } from "../ui.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("login-form");
  if (!form) return;
  form.addEventListener("submit", async e => {
    e.preventDefault();
    clearAlerts("error", "message");
    showLoading();

    const email = form.elements["email"].value.trim();
    const password = form.elements["password"].value;

    const { session, error } = await signIn(email, password);
    hideLoading();

    if (error) {
      showError(error.message);
    } else {
      showMessage("Login successful!");
      window.location.href = "index.html";
    }
  });
});

