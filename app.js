// ---- Setup + content ----
const CONFIG = {
  // Apps Script web app URL, ending in /exec (see README). Students never see it.
  submitUrl: "https://script.google.com/macros/s/AKfycbzz6NiS4VArmZyizV4fnVSXtK3Zxr1uEocoisSnBEROBcNz_uFj77jVzohKRMyj8HJh/exec",
  emailDomain: "ashoka.edu.in",
  googleClientId: "471004505922-os27hddhm5qo6139km6s7sir1k99j1pn.apps.googleusercontent.com",
  batches: ["UG26", "UG27", "UG28", "UG29"],
  // From ashoka.edu.in/programme/majors and /interdisciplinary-majors (checked 2026-11-16).
  // Majors are declared at the end of semester 3, so first-years need the "not yet" option.
  majors: [
    "Biology", "Chemistry", "Computer Science", "Computer Science and Artificial Intelligence",
    "Economics", "English", "History", "International Relations", "Management", "Mathematics",
    "Philosophy", "Physics", "Political Science", "Psychology", "Sociology/Anthropology",
    "Computer Science and Entrepreneurial Leadership", "Mathematics and Computer Science",
    "English and Creative Writing", "Economics and Finance", "Economics and History",
    "English and Media Studies", "English and Performing Arts", "History and International Relations",
    "Politics, Philosophy and Economics", "Computer Science and Philosophy", "Economics and Public Policy",
    "Not declared yet",
  ],
  opportunities: [
    {
      id: "projects",
      tag: "Make + Build",
      title: "Projects",
      summary: "Build real things with a team. Bring an idea or join one.",
      details: [],
    },
    {
      id: "vishwakarma-awards",
      tag: "Beginner-friendly",
      isNew: true,
      title: "Vishwakarma Awards",
      summary: "India's national hardware challenge for student teams, with Ashoka as one of three mentor institutes. Help us support the teams from the front row as they build their prototypes.",
      details: [],
      moreInfo: "https://www.vishwakarma-awards.org/#viswakarma-awards",
    },
    {
      id: "redbrick-hacks",
      tag: "Beginner-friendly",
      isNew: true,
      title: "RedBrick Hacks",
      summary: "Our 48-hour hackathon on problems real India faces. The last edition drew 430+ applicants from 91+ universities across 23 states.",
      details: [
        "Work across verticals: operations, hardware support, participant help, side events and outreach",
        "Get a backstage pass to one of our biggest events",
      ],
    },
  ],
};

// ---- Sending the response to the Apps Script → Google Sheet ----
async function submitInterest(data) {
  if (!CONFIG.submitUrl) {
    throw new Error("This form isn't connected to the responses sheet yet.");
  }
  // text/plain avoids a CORS preflight, which Apps Script web apps don't answer.
  const res = await fetch(CONFIG.submitUrl, {
    method: "POST",
    headers: { "Content-Type": "text/plain;charset=utf-8" },
    body: JSON.stringify(data),
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok || !body.ok) throw new Error(body.error || "Something went wrong. Please try again.");
  return body;
}

const form = document.getElementById("signup-form");
const statusEl = document.getElementById("status");

function el(tag, attrs, text) {
  const node = document.createElement(tag);
  Object.entries(attrs || {}).forEach(([k, v]) => node.setAttribute(k, v));
  if (text !== undefined) node.textContent = text;
  return node;
}

function scrollToSection(id) {
  document.getElementById(id).scrollIntoView({ behavior: "smooth" });
}

// ---- Mobile side drawer ----
const drawer = document.getElementById("drawer");
const backdrop = document.getElementById("drawer-backdrop");
const menuOpen = document.getElementById("menu-open");

function setDrawer(open) {
  if (open) {
    backdrop.hidden = false;
    void backdrop.offsetWidth; // apply the un-hide first so the fade-in animates
  }
  drawer.classList.toggle("is-open", open);
  backdrop.classList.toggle("is-open", open);
  drawer.setAttribute("aria-hidden", String(!open));
  menuOpen.setAttribute("aria-expanded", String(open));
  document.body.classList.toggle("drawer-locked", open);
  if (open) {
    drawer.querySelector(".drawer-links button").focus({ preventScroll: true });
  } else {
    setTimeout(() => { if (!drawer.classList.contains("is-open")) backdrop.hidden = true; }, 260);
  }
}

menuOpen.addEventListener("click", () => setDrawer(true));
document.getElementById("menu-close").addEventListener("click", () => { setDrawer(false); menuOpen.focus(); });
backdrop.addEventListener("click", () => setDrawer(false));
document.addEventListener("keydown", (e) => {
  if (e.key === "Escape" && drawer.classList.contains("is-open")) { setDrawer(false); menuOpen.focus(); }
});
// If the screen is widened past phone size, make sure the drawer isn't left open.
matchMedia("(min-width: 720px)").addEventListener("change", (e) => { if (e.matches) setDrawer(false); });

document.querySelectorAll("[data-scroll]").forEach((btn) => {
  btn.addEventListener("click", () => {
    if (drawer.contains(btn)) setDrawer(false);
    scrollToSection(btn.dataset.scroll);
  });
});

// Opportunity cards
const grid = document.getElementById("opportunity-cards");
CONFIG.opportunities.forEach((opp) => {
  const card = el("article", { class: "card" });
  card.append(el("span", { class: opp.isNew ? "tag tag-new" : "tag" }, opp.tag));
  card.append(el("h3", {}, opp.title));
  [].concat(opp.summary).filter(Boolean).forEach((para) => card.append(el("p", {}, para)));
  if (opp.details && opp.details.length) {
    const ul = el("ul");
    opp.details.forEach((d) => ul.append(el("li", {}, d)));
    card.append(ul);
  }
  if (opp.moreInfo) {
    const actions = el("div", { class: "card-actions" });
    // Opens the event's own site in a new tab; noopener stops that site controlling this page.
    actions.append(el("a", {
      class: "card-link card-link-ext",
      href: opp.moreInfo,
      target: "_blank",
      rel: "noopener noreferrer",
      "aria-label": "Learn more about " + opp.title + " (opens in a new tab)",
    }, "Learn more ↗"));
    card.append(actions);
  }
  grid.append(card);
});

// Form options
CONFIG.batches.forEach((b) => form.elements.batch.append(el("option", { value: b }, b)));
CONFIG.majors.forEach((m) => form.elements.major.append(el("option", { value: m }, m)));
const list = document.getElementById("opportunity-options");
CONFIG.opportunities.forEach((opp) => {
  const label = el("label", { class: "checkbox", for: "opp-" + opp.id });
  const input = el("input", { type: "checkbox", id: "opp-" + opp.id, name: "opportunities", value: opp.id });
  label.append(input, document.createTextNode(opp.title));
  list.append(label);
});

function showStatus(kind, ...nodes) {
  statusEl.className = "status " + kind;
  statusEl.replaceChildren(...nodes);
}

function setError(field, message) {
  document.getElementById(field + "-error").textContent = message;
  const input = form.elements[field];
  if (input && input.classList) input.classList.toggle("invalid", Boolean(message));
}

// ---- Google sign-in (Ashoka accounts only) ----
// Students fill in the form first; the Google button replaces Submit until they're signed in.
// The page checks the token for UX only. Code.gs verifies `credential` server-side, which is the real check.
let credential = "";
let pendingSubmit = false; // a submit is waiting on a fresh token
const emailInput = form.elements.email;
const gateError = document.getElementById("gate-error");

function parseToken(jwt) {
  try {
    return JSON.parse(decodeURIComponent(escape(atob(jwt.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")))));
  } catch { return null; }
}

function lock(msg) {
  credential = "";
  pendingSubmit = false;
  emailInput.value = "";
  try { sessionStorage.removeItem("cred"); } catch {}
  gateError.textContent = msg || "";
  document.body.classList.add("locked");
}

function unlock(jwt) {
  const p = parseToken(jwt);
  if (!p || p.hd !== CONFIG.emailDomain || p.email_verified !== true || p.exp * 1000 < Date.now()) return false;
  credential = jwt;
  emailInput.value = p.email.toLowerCase();
  if (!form.elements.name.value) form.elements.name.value = p.name || "";
  try { sessionStorage.setItem("cred", jwt); } catch {}
  gateError.textContent = "";
  document.body.classList.remove("locked");
  return true;
}

// select_by "btn*" = they clicked the Google button, so that click means "sign in and submit".
// Silent sign-ins ("auto", One Tap) only sign in; they never submit a half-filled form.
function onSignIn({ credential: jwt, select_by: how = "" }) {
  if (!unlock(jwt)) return lock("Please sign in with your @" + CONFIG.emailDomain + " Google account.");
  if (pendingSubmit || how.startsWith("btn")) { pendingSubmit = false; form.requestSubmit(); }
}

// Token missing or expired (they last about an hour): ask Google for a fresh one quietly
// (auto_select), then carry on submitting. If nothing comes back, fall back to the button.
function refreshThenSubmit() {
  lock("");
  pendingSubmit = true;
  google.accounts.id.prompt();
  setTimeout(() => { if (pendingSubmit) lock("Please sign in to submit."); }, 4000);
}

try { unlock(sessionStorage.getItem("cred") || ""); } catch {}

window.addEventListener("load", () => {
  google.accounts.id.initialize({
    client_id: CONFIG.googleClientId, hd: CONFIG.emailDomain, callback: onSignIn, auto_select: true,
  });
  google.accounts.id.renderButton(document.getElementById("g-signin"), { theme: "outline", size: "large", text: "signin_with" });
  if (!credential) google.accounts.id.prompt(); // returning students are signed in without a click
});

function validate(data) {
  const errors = {
    name: data.name ? "" : "Please enter your name.",
    batch: data.batch ? "" : "Please select your batch.",
    major: data.major ? "" : "Please select your major.",
    opportunities: data.opportunities.length ? "" : "Please pick at least one interest pool.",
  };
  Object.entries(errors).forEach(([field, msg]) => setError(field, msg));
  return Object.values(errors).every((m) => !m);
}

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  statusEl.replaceChildren();
  statusEl.className = "status";

  const data = {
    name: form.elements.name.value.trim(),
    batch: form.elements.batch.value,
    major: form.elements.major.value,
    opportunities: [...form.querySelectorAll('input[name="opportunities"]:checked')].map((i) => i.value),
    learn: form.elements.learn.value.trim(),
  };

  if (!validate(data)) {
    const firstError = form.querySelector(".error:not(:empty)");
    if (firstError) firstError.scrollIntoView({ block: "center" });
    return;
  }

  // Signed in with a live token? If not, get one first; onSignIn resubmits.
  const tok = parseToken(credential);
  if (!tok || tok.exp * 1000 < Date.now()) return refreshThenSubmit();

  const button = form.querySelector("button[type=submit]");
  const label = button.querySelector(".btn-label");
  const setSending = (sending) => {
    button.disabled = sending;
    button.classList.toggle("is-loading", sending);
    button.setAttribute("aria-busy", String(sending));
    label.textContent = sending ? "Submitting…" : "Submit interest";
  };
  setSending(true);

  const titles = Object.fromEntries(CONFIG.opportunities.map((o) => [o.id, o.title]));
  try {
    await submitInterest({
      ...data,
      opportunities: data.opportunities.map((id) => titles[id]),
      website: form.elements.website.value,
      credential,
    });
    form.reset();
    showThanks(data.name);
  } catch (err) {
    showStatus("fail", document.createTextNode(err.message || "Something went wrong. Please try again."));
  } finally {
    setSending(false);
  }
});

// ---- Thank-you panel ----
const thanks = document.getElementById("thanks");

function showThanks(name) {
  document.getElementById("thanks-name").textContent = name.split(" ")[0] || name;
  form.hidden = true;
  thanks.hidden = false;
  thanks.focus({ preventScroll: true });
  thanks.scrollIntoView({ behavior: "smooth", block: "center" });
}
