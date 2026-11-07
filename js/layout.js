const navigationLinks = [
  { href: "index.html", label: "Home" },
  { href: "browse.html", label: "Browse" },
  { href: "login.html", label: "Log in" },
  { href: "register.html", label: "Register" },
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
  const list = document.createElement("ul");

  navigationLinks.forEach((entry) => {
    const item = document.createElement("li");
    item.append(createLink(entry));
    list.append(item);
  });

  nav.append(list);
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
