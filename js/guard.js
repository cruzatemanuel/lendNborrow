import { getUser } from "./auth.js";
import { showError, showLoading, hideLoading } from "./ui.js";

export async function requireAuth(redirectUrl = "login.html") {
  showLoading();
  const { data, error } = await getUser();
  hideLoading();
  if (error || !data?.user) {
    showError("Please log in first.");
    window.location.href = redirectUrl;
    return null;
  }
  return data.user;
}

