const navigationLinks = [
  { href: "dashboard.html", label: "Dashboard" },
  { href: "browse.html", label: "Browse items" },
  { href: "my-listings.html", label: "My listings" },
  { href: "borrowed.html", label: "Borrows" },
];

function createLink({ href, label }) {
  const link = document.createElement("a");
  link.href = href;
  link.textContent = label;
  return link;
}

export function renderNavbar() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;

  navbar.replaceChildren();
  const nav = document.createElement("nav");
  nav.setAttribute("aria-label", "Primary navigation");
  const brand = document.createElement("a");
  brand.className = "brand";
  brand.href = "index.html";
  brand.setAttribute("aria-label", "lendNborrow home");

  const logo = document.createElement("img");
  logo.src = "logo.png";
  logo.alt = "";

  const brandName = document.createElement("span");
  brandName.textContent = "lendNborrow";
  brand.append(logo, brandName);

  const list = document.createElement("ul");
  const currentPage = window.location.pathname.split("/").pop() || "index.html";

  navigationLinks.forEach((entry) => {
    const item = document.createElement("li");
    const link = createLink(entry);
    if (entry.href === currentPage || (entry.href === "dashboard.html" && currentPage === "index.html")) {
      link.setAttribute("aria-current", "page");
    }
    item.append(link);
    list.append(item);
  });

  const accountLink = createLink({ href: "register.html", label: "Sign up with Google" });
  accountLink.className = "google-signup nav-signup";
  accountLink.setAttribute("aria-label", "Sign up with your BatStateU Google account");

  const googleMark = document.createElement("span");
  googleMark.className = "google-mark";
  googleMark.setAttribute("aria-hidden", "true");
  googleMark.textContent = "G";
  accountLink.prepend(googleMark);

  nav.append(brand, list, accountLink);
  navbar.append(nav);
}

export function renderFooter() {
  const footer = document.getElementById("footer");
  if (!footer) return;

  footer.replaceChildren();
  const text = document.createElement("p");
  text.textContent = `© ${new Date().getFullYear()} lendNborrow`;
  footer.append(text);
}

export function initializeLayout() {
  renderNavbar();
  renderFooter();
}
