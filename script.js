/**
 * MaVie Beta Landing — form, privacy modal, i18n, one-email guard
 */

const STORAGE_KEY = "mavie_beta_registered";
const EMAILS_KEY = "mavie_beta_emails";
const LANG_KEY = "mavie_lang";

const USE_SUPABASE = false;
const SUPABASE_URL = "https://YOUR_PROJECT.supabase.co";
const SUPABASE_ANON_KEY = "YOUR_SUPABASE_ANON_KEY";
const SUPABASE_TABLE = "beta_signups";

const I18N = window.MAVIE_I18N || {};
const LANG_META = window.MAVIE_LANG_META || {};
const DEFAULT_LANG = "en";

const form = document.getElementById("beta-form");
const signupSection = document.getElementById("signup-section");
const confirmSection = document.getElementById("confirm-section");
const confirmTitle = document.getElementById("confirm-title");
const confirmText = document.getElementById("confirm-text");
const submitBtn = document.getElementById("submit-btn");
const emailInput = document.getElementById("email");
const emailError = document.getElementById("email-error");
const consentInput = document.getElementById("consent");
const consentError = document.getElementById("consent-error");
const formError = document.getElementById("form-error");
const seatsLiveText = document.getElementById("seats-live-text");
const privacyModal = document.getElementById("privacy-modal");
const privacyContent = document.getElementById("privacy-content");
const formSubject = document.getElementById("form-subject");
const formLanguage = document.getElementById("form-language");
const langBtn = document.getElementById("lang-btn");
const langMenu = document.getElementById("lang-menu");
const langCodeEl = document.getElementById("lang-code");

let currentLang = DEFAULT_LANG;
let liveIndex = 0;
let liveTimer = null;
let confirmMode = null;

function t(key) {
  const pack = I18N[currentLang] || I18N[DEFAULT_LANG] || {};
  return pack[key] ?? I18N[DEFAULT_LANG]?.[key] ?? "";
}

function getLiveLines() {
  const lines = t("liveLines");
  return Array.isArray(lines) ? lines : [];
}

function languageLabelForForm(code) {
  const meta = LANG_META[code];
  if (!meta) return code;
  return `${meta.native} (${meta.label})`;
}

function applyLanguage(lang, { persist = true } = {}) {
  if (!I18N[lang]) lang = DEFAULT_LANG;
  currentLang = lang;

  if (persist) {
    try {
      localStorage.setItem(LANG_KEY, lang);
    } catch (_) {
      /* ignore */
    }
  }

  document.documentElement.lang = t("htmlLang") || lang;

  const setMeta = (id, value) => {
    const el = document.getElementById(id);
    if (el && value) el.setAttribute("content", value);
  };

  const titleEl = document.getElementById("doc-title");
  if (titleEl) titleEl.textContent = t("title");
  setMeta("meta-description", t("metaDescription"));
  setMeta("og-title", t("ogTitle"));
  setMeta("og-description", t("ogDescription"));
  setMeta("twitter-title", t("ogTitle"));
  setMeta("twitter-description", t("ogDescription"));

  const localeMap = { en: "en_US", sl: "sl_SI", it: "it_IT", de: "de_DE" };
  setMeta("og-locale", localeMap[lang] || "en_US");

  document.querySelectorAll("[data-i18n]").forEach((el) => {
    const key = el.getAttribute("data-i18n");
    const value = t(key);
    if (value !== undefined && value !== null && typeof value !== "object") {
      el.textContent = value;
    }
  });

  document.querySelectorAll("[data-i18n-html]").forEach((el) => {
    const key = el.getAttribute("data-i18n-html");
    const value = t(key);
    if (typeof value === "string") el.innerHTML = value;
  });

  document.querySelectorAll("[data-i18n-placeholder]").forEach((el) => {
    const key = el.getAttribute("data-i18n-placeholder");
    const value = t(key);
    if (value) el.setAttribute("placeholder", value);
  });

  document.querySelectorAll("[data-i18n-aria]").forEach((el) => {
    const key = el.getAttribute("data-i18n-aria");
    const value = t(key);
    if (value) el.setAttribute("aria-label", value);
  });

  if (formSubject) formSubject.value = t("formSubject");
  if (formLanguage) formLanguage.value = languageLabelForForm(lang);
  if (privacyContent) privacyContent.innerHTML = t("privacyHtml");

  if (langCodeEl) langCodeEl.textContent = lang.toUpperCase();

  document.querySelectorAll("#lang-menu [data-lang]").forEach((item) => {
    const selected = item.getAttribute("data-lang") === lang;
    item.setAttribute("aria-selected", selected ? "true" : "false");
    item.classList.toggle("is-active", selected);
  });

  // Refresh live line + confirmation copy for active language
  const lines = getLiveLines();
  if (seatsLiveText && lines.length) {
    liveIndex = liveIndex % lines.length;
    seatsLiveText.textContent = lines[liveIndex];
  }

  if (confirmMode && !confirmSection.hidden) {
    showConfirmation(confirmMode, { skipScroll: true });
  }
}

function startLiveSeats() {
  if (!seatsLiveText) return;
  if (liveTimer) clearInterval(liveTimer);

  liveTimer = setInterval(() => {
    const lines = getLiveLines();
    if (!lines.length) return;
    liveIndex = (liveIndex + 1) % lines.length;
    seatsLiveText.classList.add("is-fading");
    window.setTimeout(() => {
      seatsLiveText.textContent = lines[liveIndex];
      seatsLiveText.classList.remove("is-fading");
    }, 280);
  }, 3800);
}

/* ---------- Language switcher UI ---------- */

function closeLangMenu() {
  if (!langMenu || !langBtn) return;
  langMenu.hidden = true;
  langBtn.setAttribute("aria-expanded", "false");
}

function openLangMenu() {
  if (!langMenu || !langBtn) return;
  langMenu.hidden = false;
  langBtn.setAttribute("aria-expanded", "true");
}

function initLanguageSwitcher() {
  if (!langBtn || !langMenu) return;

  langBtn.addEventListener("click", (event) => {
    event.stopPropagation();
    if (langMenu.hidden) openLangMenu();
    else closeLangMenu();
  });

  langMenu.querySelectorAll("[data-lang]").forEach((item) => {
    item.addEventListener("click", () => {
      const lang = item.getAttribute("data-lang");
      applyLanguage(lang);
      closeLangMenu();
    });
  });

  document.addEventListener("click", (event) => {
    const root = document.getElementById("lang-switch");
    if (root && !root.contains(event.target)) closeLangMenu();
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeLangMenu();
  });
}

function detectInitialLang() {
  try {
    const saved = localStorage.getItem(LANG_KEY);
    if (saved && I18N[saved]) return saved;
  } catch (_) {
    /* ignore */
  }
  return DEFAULT_LANG;
}

/* ---------- Email one-time guard ---------- */

function normalizeEmail(email) {
  return email.trim().toLowerCase();
}

function getSubmittedEmails() {
  try {
    const raw = localStorage.getItem(EMAILS_KEY);
    const list = raw ? JSON.parse(raw) : [];
    return Array.isArray(list) ? list : [];
  } catch (_) {
    return [];
  }
}

function hasSubmittedEmail(email) {
  return getSubmittedEmails().includes(normalizeEmail(email));
}

function rememberSubmittedEmail(email) {
  try {
    const list = getSubmittedEmails();
    const key = normalizeEmail(email);
    if (!list.includes(key)) {
      list.push(key);
      localStorage.setItem(EMAILS_KEY, JSON.stringify(list));
    }
  } catch (_) {
    /* ignore */
  }
}

/* ---------- Confirmation ---------- */

function markRegistered() {
  try {
    localStorage.setItem(STORAGE_KEY, "true");
  } catch (_) {
    /* ignore */
  }
}

function isAlreadyRegistered() {
  try {
    return localStorage.getItem(STORAGE_KEY) === "true";
  } catch (_) {
    return false;
  }
}

function showConfirmation(mode, { skipScroll = false } = {}) {
  confirmMode = mode;
  const returning = mode === "returning";

  confirmTitle.textContent = returning
    ? t("confirmReturningTitle")
    : t("confirmFreshTitle");
  confirmText.textContent = returning
    ? t("confirmReturningText")
    : t("confirmFreshText");

  signupSection.hidden = true;
  confirmSection.hidden = false;

  if (!returning && !skipScroll) {
    confirmSection.scrollIntoView({ behavior: "smooth", block: "center" });
  }
}

/* ---------- Privacy modal ---------- */

function openPrivacyModal() {
  if (!privacyModal) return;
  privacyModal.hidden = false;
  document.body.classList.add("modal-open");
  privacyModal.querySelector(".modal__close")?.focus();
}

function closePrivacyModal() {
  if (!privacyModal) return;
  privacyModal.hidden = true;
  document.body.classList.remove("modal-open");
}

function initPrivacyModal() {
  document.querySelectorAll("[data-open-privacy]").forEach((el) => {
    el.addEventListener("click", (event) => {
      event.preventDefault();
      event.stopPropagation();
      openPrivacyModal();
    });
  });

  document.querySelectorAll("[data-close-privacy]").forEach((el) => {
    el.addEventListener("click", () => closePrivacyModal());
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape" && privacyModal && !privacyModal.hidden) {
      closePrivacyModal();
    }
  });
}

/* ---------- Form helpers ---------- */

function setLoading(isLoading) {
  submitBtn.classList.toggle("is-loading", isLoading);
  submitBtn.disabled = isLoading;
  submitBtn.setAttribute("aria-busy", isLoading ? "true" : "false");
}

function showFormError(message) {
  formError.textContent = message;
  formError.hidden = !message;
}

function isValidEmail(value) {
  const email = value.trim();
  if (!email) return false;
  return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/i.test(email);
}

function showEmailError() {
  emailError.hidden = false;
  emailError.textContent = t("emailError");
  emailInput.classList.add("is-invalid");
  emailInput.setAttribute("aria-invalid", "true");
  emailInput.focus();
}

function clearEmailError() {
  emailError.hidden = true;
  emailInput.classList.remove("is-invalid");
  emailInput.removeAttribute("aria-invalid");
}

function showConsentError() {
  consentError.hidden = false;
  consentError.textContent = t("consentError");
  consentInput.focus();
}

function clearConsentError() {
  consentError.hidden = true;
}

async function submitToSupabase(payload) {
  const res = await fetch(`${SUPABASE_URL}/rest/v1/${SUPABASE_TABLE}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
      Prefer: "return=minimal",
    },
    body: JSON.stringify(payload),
  });

  if (!res.ok) {
    throw new Error("Supabase error while saving.");
  }
}

async function submitToFormspree(formEl) {
  const action = formEl.getAttribute("action");

  if (!action || action.includes("YOUR_FORM_ID")) {
    throw new Error("Formspree is not configured.");
  }

  // Ensure language is current at submit time
  if (formLanguage) formLanguage.value = languageLabelForForm(currentLang);
  if (formSubject) formSubject.value = t("formSubject");

  const res = await fetch(action, {
    method: "POST",
    body: new FormData(formEl),
    headers: { Accept: "application/json" },
  });

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new Error(data.error || t("formErrorGeneric"));
  }
}

/* ---------- Events ---------- */

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  showFormError("");
  clearEmailError();
  clearConsentError();

  const email = emailInput.value.trim();

  if (!emailInput.checkValidity() || !isValidEmail(email)) {
    showEmailError();
    return;
  }

  if (!consentInput.checked) {
    showConsentError();
    return;
  }

  if (hasSubmittedEmail(email)) {
    markRegistered();
    showFormError(t("duplicateEmail"));
    showConfirmation("returning");
    return;
  }

  const name = document.getElementById("name").value.trim();

  setLoading(true);

  try {
    if (USE_SUPABASE) {
      await submitToSupabase({
        name: name || null,
        email,
        consent: true,
        language: languageLabelForForm(currentLang),
      });
    } else {
      await submitToFormspree(form);
    }

    rememberSubmittedEmail(email);
    markRegistered();
    showConfirmation("fresh");
  } catch (err) {
    showFormError(err.message || t("formErrorGeneric"));
  } finally {
    setLoading(false);
  }
});

emailInput.addEventListener("input", () => {
  if (!emailError.hidden) clearEmailError();
});

consentInput.addEventListener("change", () => {
  if (!consentError.hidden) clearConsentError();
});

/* ---------- Boot ---------- */

initPrivacyModal();
initLanguageSwitcher();
applyLanguage(detectInitialLang(), { persist: false });

if (isAlreadyRegistered()) {
  showConfirmation("returning");
} else {
  startLiveSeats();
}
