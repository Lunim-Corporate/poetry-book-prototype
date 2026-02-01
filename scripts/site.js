async function loadIncludes() {
  const includeEls = Array.from(document.querySelectorAll("[data-include]"));
  await Promise.all(
    includeEls.map(async (el) => {
      const url = el.getAttribute("data-include");
      if (!url) return;
      const res = await fetch(url, { cache: "no-cache" });
      if (!res.ok) throw new Error(`Failed to load include: ${url}`);
      el.innerHTML = await res.text();
      el.removeAttribute("data-include");
    }),
  );
}

function setCurrentYear() {
  const yearEl = document.getElementById("year");
  if (yearEl) yearEl.textContent = String(new Date().getFullYear());
}

function setActiveNavLink() {
  const links = Array.from(document.querySelectorAll(".nav a.nav__link--real"));
  if (!links.length) return;

  const currentPathname = window.location.pathname;
  const pathParts = currentPathname.split("/").filter(Boolean);
  const currentFile = pathParts[pathParts.length - 1] || "index.html";
  const currentSlug = pathParts.length > 1 ? pathParts[0] : currentFile.replace(".html", "");
  const isPastWinnersRoute = pathParts[0] === "past-winners" || currentFile === "past-winners.html";

  const surrounds = Array.from(document.querySelectorAll(".nav__link--surround"));
  for (const surround of surrounds) {
    surround.classList.remove("is-active");
  }

  for (const a of links) {
    a.classList.remove("is-active");
    if (a.getAttribute("aria-current") === "page") a.removeAttribute("aria-current");
  }

  if (isPastWinnersRoute) {
    const pastWinnersSurround = document.querySelector(".nav__link--surround");
    if (pastWinnersSurround) pastWinnersSurround.classList.add("is-active");
    return;
  }

  for (const a of links) {
    const href = a.getAttribute("href") || "";
    const linkFile = new URL(href, window.location.href).pathname.split("/").pop() || "index.html";
    const linkSlug = linkFile.replace(".html", "");
    if (linkFile === currentFile || linkSlug === currentSlug) {
      const surround = a.closest(".nav__link--surround");
      if (surround) {
        surround.classList.add("is-active");
      } else {
        a.classList.add("is-active");
        a.setAttribute("aria-current", "page");
      }
      break;
    }
  }
}

function initMobileNav() {
  const navToggle = document.querySelector(".navToggle");
  const nav = document.getElementById("site-nav");
  const navOverlay = document.querySelector(".navOverlay");

  if (!navToggle || !nav || !navOverlay) return;

  const navClose = nav.querySelector(".navClose");

  const closeNav = () => {
    nav.classList.remove("is-open");
    navOverlay.hidden = true;
    document.body.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  const openNav = () => {
    nav.classList.add("is-open");
    navOverlay.hidden = false;
    document.body.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    (navClose || nav.querySelector("a"))?.focus();
  };

  navToggle.addEventListener("click", () => {
    const isOpen = nav.classList.contains("is-open");
    if (isOpen) closeNav();
    else openNav();
  });

  navClose?.addEventListener("click", closeNav);
  navOverlay.addEventListener("click", closeNav);

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && nav.classList.contains("is-open")) closeNav();
  });

  window.matchMedia("(min-width: 900px)").addEventListener("change", (e) => {
    if (e.matches) closeNav();
  });
}

function initNavDropdowns() {
  const toggles = Array.from(document.querySelectorAll("[data-dropdown-toggle]"));
  if (!toggles.length) return;

  const closeAll = () => {
    for (const toggle of toggles) {
      const dropdown = toggle.closest(".nav__dropdown");
      if (!dropdown) continue;
      dropdown.classList.remove("is-open");
      toggle.setAttribute("aria-expanded", "false");
    }
  };

  for (const toggle of toggles) {
    toggle.addEventListener("click", (e) => {
      const dropdown = toggle.closest(".nav__dropdown");
      if (!dropdown) return;
      e.preventDefault();
      const isOpen = dropdown.classList.contains("is-open");
      closeAll();
      if (!isOpen) {
        dropdown.classList.add("is-open");
        toggle.setAttribute("aria-expanded", "true");
      }
    });
  }

  document.addEventListener("click", (e) => {
    if (e.target instanceof Element && e.target.closest(".nav__dropdown")) return;
    closeAll();
  });

  document.addEventListener("keydown", (e) => {
    if (e.key !== "Escape") return;
    closeAll();
  });
}

function closeMobileNavIfOpen() {
  const navToggle = document.querySelector(".navToggle");
  const nav = document.getElementById("site-nav");
  const navOverlay = document.querySelector(".navOverlay");

  if (!navToggle || !nav || !navOverlay) return;
  if (!nav.classList.contains("is-open")) return;

  nav.classList.remove("is-open");
  navOverlay.hidden = true;
  document.body.classList.remove("nav-open");
  navToggle.setAttribute("aria-expanded", "false");
}

function scrollToContactFormOrRedirect() {
  const currentFile = (window.location.pathname.split("/").pop() || "index.html").toLowerCase();
  const targetId = "contact-form";

  // On Enter page, always go to Home then scroll.
  if (currentFile === "enter.html") {
    window.location.href = `./index.html#${targetId}`;
    return;
  }

  const el = document.getElementById(targetId);
  if (el) {
    closeMobileNavIfOpen();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  // Fallback if this page doesn't have the contact form.
  window.location.href = `./index.html#${targetId}`;
}

function initContactNavBehavior() {
  const links = Array.from(document.querySelectorAll("a[data-contact-link], a[data-faq-link]"));
  if (!links.length) return;

  for (const a of links) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToContactFormOrRedirect();
    });
  }
}

function initFaqNavBehavior() {
  const links = Array.from(document.querySelectorAll("a[data-faq-link]"));
  if (!links.length) return;

  for (const a of links) {
    a.addEventListener("click", (e) => {
      e.preventDefault();
      scrollToFaqOrRedirect();
    });
  }
}

function scrollToFaqOrRedirect() {
  const pathParts = window.location.pathname.split("/").filter(Boolean);
  const currentFile = (pathParts[pathParts.length - 1] || "index.html").toLowerCase();
  const isHomePage = pathParts.length === 0 || (pathParts.length === 1 && currentFile === "index.html");
  const targetId = "faq";

  if (!isHomePage) {
    sessionStorage.setItem("scrollTargetId", targetId);
    window.location.href = "./index.html";
    return;
  }

  const el = document.getElementById(targetId);
  if (el) {
    closeMobileNavIfOpen();
    el.scrollIntoView({ behavior: "smooth", block: "start" });
    return;
  }

  window.location.href = `./index.html#${targetId}`;
}

function scrollToHashTargetIfPresent() {
  const hash = (window.location.hash || "").replace("#", "");
  if (!hash) return;
  const el = document.getElementById(hash);
  if (!el) return;
  // Wait a frame so layout stabilizes after includes.
  requestAnimationFrame(() => el.scrollIntoView({ behavior: "smooth", block: "start" }));
}

function scrollToStoredTargetIfPresent() {
  const targetId = sessionStorage.getItem("scrollTargetId");
  if (!targetId) return;
  sessionStorage.removeItem("scrollTargetId");
  const scrollAfterShow = () => {
    const el = document.getElementById(targetId);
    if (!el) return;
    closeMobileNavIfOpen();
    // Ensure the top of the home view is visible first.
    window.scrollTo({ top: 0, left: 0, behavior: "auto" });
    requestAnimationFrame(() => {
      setTimeout(() => {
        el.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 120);
    });
  };

  if (document.visibilityState === "visible") {
    requestAnimationFrame(scrollAfterShow);
  } else {
    window.addEventListener("pageshow", () => requestAnimationFrame(scrollAfterShow), { once: true });
  }
}

function initFaqAccordion() {
  const items = Array.from(document.querySelectorAll(".faq__item"));
  if (!items.length) return;

  for (const item of items) {
    item.addEventListener("toggle", () => {
      if (!item.open) return;
      for (const other of items) {
        if (other !== item) other.open = false;
      }
    });
  }
}

function initEntryWizard() {
  const formCard = document.querySelector(".wizardSteps__form");
  const form = formCard?.querySelector("form");
  const step1 = document.querySelector(".wizardStep__circle--step1");
  const step2 = document.querySelector(".wizardStep__circle--step2");
  const step3 = document.querySelector(".wizardStep__circle--step3");
  const line1 = document.querySelector(".wizardSteps__line1");
  const line2 = document.querySelector(".wizardSteps__line2");

  if (!formCard || !form || !step1 || !step2 || !step3 || !line1 || !line2) return;

  const step1Html = formCard.innerHTML;
  let selectedLabel = "";
  const step1Values = {
    name: "",
    email: "",
    bookCount: "",
  };
  const step2Values = {
    billingStreet: "",
    billingPostcode: "",
    cardNumber: "",
    cardExpiry: "",
    cardCvc: "",
  };

  const visitedSteps = new Set(["step1"]);

  const updateClickable = () => {
    const step1Active = step1.classList.contains("wizardStep__circle--active");
    const step2Active = step2.classList.contains("wizardStep__circle--active");
    step1.classList.toggle("wizardStep__circle--clickable", visitedSteps.has("step1") && !step1Active);
    step2.classList.toggle("wizardStep__circle--clickable", visitedSteps.has("step2") && !step2Active);
    step1.classList.toggle("wizardStep__circle--visited", visitedSteps.has("step1"));
    step2.classList.toggle("wizardStep__circle--visited", visitedSteps.has("step2"));
    step3.classList.toggle("wizardStep__circle--visited", visitedSteps.has("step3"));
    line1.classList.toggle("wizardSteps__line--complete", visitedSteps.has("step2"));
    line2.classList.toggle("wizardSteps__line--complete", visitedSteps.has("step3"));
  };

  const setActive = (activeStep) => {
    step1.classList.remove("wizardStep__circle--active");
    step2.classList.remove("wizardStep__circle--active");
    step3.classList.remove("wizardStep__circle--active");
    activeStep.classList.add("wizardStep__circle--active");
    updateClickable();
  };

  const captureStep1Values = (step1Form) => {
    step1Values.name = step1Form.querySelector("#entry-name")?.value || "";
    step1Values.email = step1Form.querySelector("#entry-email")?.value || "";
    step1Values.bookCount =
      step1Form.querySelector('input[name="bookCount"]:checked')?.value || "";
  };

  const applyStep1Values = (step1Form) => {
    const nameInput = step1Form.querySelector("#entry-name");
    const emailInput = step1Form.querySelector("#entry-email");
    if (nameInput) nameInput.value = step1Values.name;
    if (emailInput) emailInput.value = step1Values.email;
    if (step1Values.bookCount) {
      const checked = step1Form.querySelector(
        `input[name="bookCount"][value="${step1Values.bookCount}"]`,
      );
      if (checked) checked.checked = true;
    }
  };

  const captureStep2Values = (step2Form) => {
    step2Values.billingStreet = step2Form.querySelector("#billing-street")?.value || "";
    step2Values.billingPostcode =
      step2Form.querySelector("#billing-postcode")?.value || "";
    step2Values.cardNumber = step2Form.querySelector("#card-number")?.value || "";
    step2Values.cardExpiry = step2Form.querySelector("#card-expiry")?.value || "";
    step2Values.cardCvc = step2Form.querySelector("#card-cvc")?.value || "";
  };

  const applyStep2Values = (step2Form) => {
    const street = step2Form.querySelector("#billing-street");
    const postcode = step2Form.querySelector("#billing-postcode");
    const cardNumber = step2Form.querySelector("#card-number");
    const cardExpiry = step2Form.querySelector("#card-expiry");
    const cardCvc = step2Form.querySelector("#card-cvc");
    if (street) street.value = step2Values.billingStreet;
    if (postcode) postcode.value = step2Values.billingPostcode;
    if (cardNumber) cardNumber.value = step2Values.cardNumber;
    if (cardExpiry) cardExpiry.value = step2Values.cardExpiry;
    if (cardCvc) cardCvc.value = step2Values.cardCvc;
  };

  const bindStep1Form = () => {
    const step1Form = formCard.querySelector("form");
    if (!step1Form) return;
    applyStep1Values(step1Form);
    step1Form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const selected = step1Form.querySelector('input[name="bookCount"]:checked');
      if (!selected) {
        step1Form.reportValidity();
        return;
      }
      captureStep1Values(step1Form);
      selectedLabel =
        selected.closest("label")?.querySelector("span")?.textContent?.trim() || "";
      renderStep2();
    });
  };

  const renderStep1 = () => {
    setActive(step1);
    formCard.innerHTML = step1Html;
    bindStep1Form();
  };

  const renderStep2 = () => {
    visitedSteps.add("step2");
    setActive(step2);
    formCard.innerHTML = `
      <h2 class="cardTitle">Enter card details and pay</h2>
      <p class="muted">${selectedLabel}</p>
      <a class="wizardSteps__back" href="#" data-back="1">&laquo; Back to step 1</a>
      <form class="form" action="#" method="post">
        <h3>Card details</h3>
        <label class="label" for="card-number">Card number</label>
        <input id="card-number" name="cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" required />

        <div class="formRow formRow--split">
          <div class="formRow__item">
            <label class="label" for="card-expiry">Expiry date</label>
            <input id="card-expiry" name="cardExpiry" type="text" autocomplete="cc-exp" required />
          </div>
          <div class="formRow__item">
            <label class="label" for="card-cvc">Security code</label>
            <input id="card-cvc" name="cardCvc" type="text" inputmode="numeric" autocomplete="cc-csc" required />
          </div>
        </div>

        <h3>Billing address</h3>
        <label class="label" for="billing-street">Street and town</label>
        <textarea id="billing-street" name="billingStreet" rows="2" required></textarea>

        <label class="label" for="billing-postcode">Postcode</label>
        <input class="input--half" id="billing-postcode" name="billingPostcode" type="text" autocomplete="postal-code" required />
        <div class="formSpacer"></div>
        <button class="btn btn--full" type="submit">
          <span class="btn__spinner" aria-hidden="true"></span>
          <span class="btn__label">Pay and continue</span>
        </button>
      </form>
    `;

    formCard.querySelector('[data-back="1"]')?.addEventListener("click", (e) => {
      e.preventDefault();
      const step2Form = formCard.querySelector("form");
      if (step2Form) captureStep2Values(step2Form);
      renderStep1();
    });

    formCard.querySelector("form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const step2Form = formCard.querySelector("form");
      if (step2Form) captureStep2Values(step2Form);
      renderStep3();
    });

    const step2Form = formCard.querySelector("form");
    if (step2Form) applyStep2Values(step2Form);
  };

  const renderStep3 = () => {
    visitedSteps.add("step3");
    setActive(step3);
    formCard.innerHTML = `
      <h2 class="cardTitle">Print or copy the label</h2>
      <a class="wizardSteps__back" href="#" data-back="2">&laquo; Back to step 2</a>
      <p class="muted">Click the "Print label" button to print out the details shown below, then stick this on the parcel for the book/s you're sending. Or, if you prefer, copy the details by hand - make sure to include the proof of payment reference.</p>
      <div class="wizardSteps__labelRow">
        <div class="wizardSteps__labelInfo">
          <p>
            <strong>Maya Poetry Book Awards</strong><br />
            9 The Avenue<br />
            The Common<br />
            Pontypridd<br />
            CF37 4DF<br />
            United Kingdom
          </p>
        </div>
        <div class="wizardSteps__qr">
          <img src="./assets/qr-code.png" alt="QR code" />
        </div>
      </div>
      <p><strong>Payment reference:</strong> 5809147823</p>
      <button class="btn btn--full" type="submit">
        <span class="btn__spinner" aria-hidden="true"></span>
        <span class="btn__label">Print label</span>
      </button>
    `;

    formCard.querySelector('[data-back="2"]')?.addEventListener("click", (e) => {
      e.preventDefault();
      renderStep2();
    });

    formCard.querySelector("button")?.addEventListener("click", (e) => {
      e.preventDefault();
    });
  };

  const captureActiveStepValues = () => {
    if (step2.classList.contains("wizardStep__circle--active")) {
      const step2Form = formCard.querySelector("form");
      if (step2Form) captureStep2Values(step2Form);
    }
  };

  bindStep1Form();
  updateClickable();

  step1.addEventListener("click", (e) => {
    if (visitedSteps.has("step1") && !step1.classList.contains("wizardStep__circle--active")) {
      e.preventDefault();
      captureActiveStepValues();
      renderStep1();
    }
  });

  step2.addEventListener("click", (e) => {
    if (visitedSteps.has("step2")) {
      e.preventDefault();
      captureActiveStepValues();
      renderStep2();
    }
  });
}

async function initSite() {
  await loadIncludes();
  setCurrentYear();
  setActiveNavLink();
  initMobileNav();
  initNavDropdowns();
  initContactNavBehavior();
  initFaqNavBehavior();
  scrollToHashTargetIfPresent();
  scrollToStoredTargetIfPresent();
  initFaqAccordion();
  initEntryWizard();

  // Allow page-specific scripts to initialize once includes are in the DOM.
  window.__includesLoaded = true;
  document.dispatchEvent(new Event("includes:loaded"));
}

initSite().catch((err) => {
  // Fail silently in the UI, but keep a breadcrumb for debugging.
  console.error(err);
});

