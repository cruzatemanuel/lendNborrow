import { renderNavbar } from "../layout.js";
import { requireAuth } from "../guard.js";

document.addEventListener("DOMContentLoaded", async () => {
  renderNavbar();
  await requireAuth(); // ensure logged in for home if needed
});

