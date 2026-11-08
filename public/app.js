/* Northlight Studio — public site behaviour.
   Plain ES2020+, no bundler, no dependencies, loaded with `defer`. */

const state = {
  gallery: null,
  filter: "all",
};

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));

/** Tiny element builder. Text children are inserted as text nodes, never HTML. */
function el(tag, attrs = {}, ...children) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value === null || value === undefined) continue;
    node.setAttribute(key, String(value));
  }
  for (const child of children) {
    node.append(child instanceof Node ? child : document.createTextNode(String(child)));
  }
  return node;
}

/* ------------------------------------------------------------------ header -- */

function initHeader() {
  const header = $("[data-header]");
  if (header) {
    const sync = () => header.classList.toggle("is-scrolled", window.scrollY > 24);
    sync();
    window.addEventListener("scroll", sync, { passive: true });
  }

  const toggle = $("[data-nav-toggle]");
  const nav = $("[data-nav]");
  if (!toggle || !nav) return;

  const close = () => {
    toggle.setAttribute("aria-expanded", "false");
    nav.classList.remove("is-open");
    document.body.classList.remove("nav-open");
  };

  toggle.addEventListener("click", () => {
    const isOpen = toggle.getAttribute("aria-expanded") === "true";
    toggle.setAttribute("aria-expanded", String(!isOpen));
    nav.classList.toggle("is-open", !isOpen);
    document.body.classList.toggle("nav-open", !isOpen);
  });

  nav.addEventListener("click", (event) => {
    if (event.target instanceof HTMLAnchorElement) close();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && nav.classList.contains("is-open")) {
      close();
      toggle.focus();
    }
  });
}

/* ----------------------------------------------------------------- reveals -- */

let revealObserver = null;

function observeReveals() {
  const targets = $$("[data-reveal]:not(.is-visible)");
  if (targets.length === 0) return;

  if (!("IntersectionObserver" in window)) {
    for (const target of targets) target.classList.add("is-visible");
    return;
  }

  revealObserver ??= new IntersectionObserver(
    (entries) => {
      for (const entry of entries) {
        if (!entry.isIntersecting) continue;
        entry.target.classList.add("is-visible");
        revealObserver.unobserve(entry.target);
      }
    },
    { rootMargin: "0px 0px -8% 0px", threshold: 0.08 },
  );

  for (const target of targets) revealObserver.observe(target);
}

/* ----------------------------------------------------------------- gallery -- */

function renderFilters() {
  const host = $("[data-filters]");
  if (!host || !state.gallery) return;

  const options = [{ slug: "all", title: "All" }, ...state.gallery.collections];

  host.replaceChildren(
    ...options.map((collection) => {
      const button = el(
        "button",
        {
          type: "button",
          class: "filter",
          "data-filter": collection.slug,
          "aria-pressed": String(state.filter === collection.slug),
        },
        collection.title,
      );

      button.addEventListener("click", () => {
        state.filter = collection.slug;
        renderFilters();
        renderGallery();
      });

      return button;
    }),
  );
}

function renderGallery() {
  const grid = $("[data-gallery]");
  if (!grid || !state.gallery) return;

  const images = state.gallery.images.filter(
    (image) => state.filter === "all" || image.collection === state.filter,
  );

  grid.replaceChildren(
    ...images.map((image, index) =>
      el(
        "figure",
        { class: "card", "data-reveal": "" },
        el("img", {
          src: image.src,
          alt: image.alt,
          width: image.width,
          height: image.height,
          loading: index < 3 ? "eager" : "lazy",
          decoding: "async",
        }),
        image.caption ? el("figcaption", {}, image.caption) : "",
      ),
    ),
  );

  grid.setAttribute("aria-busy", "false");
  observeReveals();
}

async function loadGallery() {
  const grid = $("[data-gallery]");
  if (!grid) return;

  grid.setAttribute("aria-busy", "true");

  try {
    const response = await fetch("/api/gallery", { headers: { accept: "application/json" } });
    if (!response.ok) throw new Error(`Gallery request failed: ${response.status}`);

    state.gallery = await response.json();
    renderFilters();
    renderGallery();
  } catch (error) {
    console.error(error);
    grid.setAttribute("aria-busy", "false");
    grid.replaceChildren(
      el(
        "p",
        { class: "notice" },
        "The gallery couldn't load just now. Refresh the page, or email ",
        el("a", { href: "mailto:tumtumphotos@gmail.com" }, "tumtumphotos@gmail.com"),
        " and we'll send a portfolio.",
      ),
    );
  }
}

/* -------------------------------------------------------------------- form -- */

function clearErrors(form) {
  for (const node of $$("[data-error-for]", form)) node.textContent = "";
  for (const node of $$("[aria-invalid='true']", form)) node.removeAttribute("aria-invalid");
}

function setStatus(node, message, tone = "") {
  if (!node) return;
  node.textContent = message;
  node.classList.toggle("is-error", tone === "error");
}

function showErrors(form, errors) {
  let firstField = null;

  for (const [field, message] of Object.entries(errors)) {
    const target = $(`[data-error-for="${field}"]`, form);
    if (target) {
      target.textContent = message;
      const input = form.elements.namedItem(field);
      if (input instanceof HTMLElement) {
        input.setAttribute("aria-invalid", "true");
        if (!firstField) firstField = input;
      }
    }
  }

  firstField?.focus();
}

function initForm() {
  const form = $("[data-enquiry-form]");
  if (!form) return;

  const status = $("[data-form-status]", form);
  const success = $("[data-form-success]");
  const submit = $("[data-submit]", form);
  if (!(submit instanceof HTMLButtonElement)) return;

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    clearErrors(form);
    setStatus(status, "");

    submit.disabled = true;
    submit.textContent = "Sending…";

    try {
      const payload = Object.fromEntries(new FormData(form).entries());

      const response = await fetch("/api/enquiries", {
        method: "POST",
        headers: { "content-type": "application/json", accept: "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (response.status === 201) {
        form.hidden = true;
        if (success instanceof HTMLElement) {
          success.hidden = false;
          success.focus?.();
          success.scrollIntoView({ block: "center", behavior: "smooth" });
        }
        return;
      }

      if (response.status === 422 && data && typeof data.errors === "object") {
        showErrors(form, data.errors);
        setStatus(status, "Please check the highlighted fields.", "error");
      } else if (response.status === 429) {
        setStatus(
          status,
          "That's a lot of messages from one place. Give it a few minutes and try again.",
          "error",
        );
      } else {
        setStatus(
          status,
          (data && data.message) || "Something went wrong. Please email us instead.",
          "error",
        );
      }
    } catch (error) {
      console.error(error);
      setStatus(
        status,
        "We couldn't reach the server. Check your connection and try again.",
        "error",
      );
    } finally {
      submit.disabled = false;
      submit.textContent = "Send enquiry";
    }
  });
}

/* -------------------------------------------------------------------- boot -- */

function init() {
  initHeader();
  initForm();
  observeReveals();
  loadGallery();

  for (const node of $$("[data-year]")) {
    node.textContent = String(new Date().getFullYear());
  }
}

init();
