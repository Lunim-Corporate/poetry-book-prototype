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
  const step4 = document.querySelector(".wizardStep__circle--step4");
  const stepsCircles = document.querySelector(".wizardSteps__circles");
  const step1Wrap = step1?.closest(".wizardStep");
  const step2Wrap = step2?.closest(".wizardStep");
  const step3Wrap = step3?.closest(".wizardStep");
  const step4Wrap = step4?.closest(".wizardStep");
  const line1 = document.querySelector(".wizardSteps__line1");
  const line2 = document.querySelector(".wizardSteps__line2");
  const line3 = document.querySelector(".wizardSteps__line3");

  if (!formCard || !form || !step1 || !step2 || !step3 || !step4 || !line1 || !line2 || !line3) return;

  const step2Html = formCard.innerHTML;
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
  let isWizardLocked = false;
  let step1Complete = false;
  let step2Complete = false;
  let step3Complete = false;
  const isDemoMode = new URLSearchParams(window.location.search).has("demo");
  const getBookLabel = () => {
    const count = Number.parseInt(step1Values.bookCount, 10);
    return Number.isNaN(count) || count === 1 ? "book" : "books";
  };

  const getPaymentAmount = () => {
    const amountMatch = selectedLabel.match(/£\s*\d+(?:\.\d{1,2})?/i);
    return amountMatch ? amountMatch[0].replace(/\s+/g, " ").trim() : "fee";
  };

  const getPaymentLabel = () => {
    return `Pay ${getPaymentAmount()} and continue to post ${getBookLabel()}`;
  };

  const updateStep4Label = () => {
    const step4Label = step4?.closest(".wizardStep")?.querySelector(".wizardStep__labelText--desktop");
    const step4LabelMobile = step4
      ?.closest(".wizardStep")
      ?.querySelector(".wizardStep__labelText--mobile");
    if (step4Label) {
      step4Label.textContent = `Print out label and post your ${getBookLabel()}`;
    }
    if (step4LabelMobile) {
      step4LabelMobile.textContent = `Post ${getBookLabel()}`;
    }
  };

  const showFieldErrors = (formEl) => {
    if (!formEl) return false;
    formEl.querySelectorAll(".formError").forEach((error) => {
      error.hidden = true;
    });
    const invalidFields = formEl.querySelectorAll(":invalid");
    invalidFields.forEach((field) => {
      const error = formEl.querySelector(`[data-error-for="${field.id}"]`);
      if (error) error.hidden = false;
    });
    invalidFields[0]?.focus();
    return invalidFields.length === 0;
  };

  const setDemoValues = () => {
    step1Values.name = "Demo Author";
    step1Values.email = "demo@example.com";
    step1Values.bookCount = "2";
    selectedLabel = "Two books: £70 GBP";
    step2Values.billingStreet = "123 Demo Street\nDemo Town";
    step2Values.billingPostcode = "DE1 2MO";
    step2Values.cardNumber = "4111 1111 1111 1111";
    step2Values.cardExpiry = "12/28";
    step2Values.cardCvc = "123";
    step1Complete = true;
    step2Complete = true;
    step3Complete = true;
    visitedSteps.add("step2");
    visitedSteps.add("step3");
    updateStep4Label();
  };

  const wizardModal = document.createElement("div");
  wizardModal.className = "wizardModal";
  wizardModal.hidden = true;
  wizardModal.innerHTML = `
    <div class="wizardModal__overlay" data-modal-close></div>
    <div class="wizardModal__dialog" role="dialog" aria-modal="true" aria-live="polite">
      <p class="wizardModal__message" data-modal-message></p>
      <div class="wizardModal__actions">
        <button class="btn" type="button" data-modal-close>Understood</button>
      </div>
    </div>
  `;
  document.body.appendChild(wizardModal);
  const modalMessage = wizardModal.querySelector("[data-modal-message]");
  const closeModal = () => {
    wizardModal.hidden = true;
  };
  wizardModal.querySelectorAll("[data-modal-close]").forEach((closeBtn) => {
    closeBtn.addEventListener("click", closeModal);
  });
  const showWizardModal = (message) => {
    if (modalMessage) modalMessage.textContent = message;
    wizardModal.hidden = false;
  };
  const getClickTapLabel = () =>
    window.matchMedia("(max-width: 728px)").matches ? "tap" : "click";

  const scrollToWizardSteps = () => {
    if (!stepsCircles) return;
    const scrollToTarget = (behavior) => {
      const offset = 80;
      const top = window.scrollY + stepsCircles.getBoundingClientRect().top - offset;
      window.scrollTo({ top, left: 0, behavior });
    };

    requestAnimationFrame(() => {
      scrollToTarget("smooth");
      window.setTimeout(() => scrollToTarget("auto"), 140);
    });
  };

  const updateClickable = () => {
    const step1Active = step1.classList.contains("wizardStep__circle--active");
    const step2Active = step2.classList.contains("wizardStep__circle--active");
    const step3Active = step3.classList.contains("wizardStep__circle--active");
    const step4Active = step4.classList.contains("wizardStep__circle--active");
    const step1Clickable = !step1Active;
    const step2Clickable = !step2Active;
    const step3Clickable = !step3Active;
    const step4Clickable = !step4Active;
    step1Wrap?.classList.toggle("wizardStep--clickable", step1Clickable);
    step2Wrap?.classList.toggle("wizardStep--clickable", step2Clickable);
    step3Wrap?.classList.toggle("wizardStep--clickable", step3Clickable);
    step4Wrap?.classList.toggle("wizardStep--clickable", step4Clickable);
    step1.classList.toggle("wizardStep__circle--visited", visitedSteps.has("step1"));
    step2.classList.toggle("wizardStep__circle--visited", visitedSteps.has("step2"));
    step3.classList.toggle("wizardStep__circle--visited", visitedSteps.has("step3"));
    step4.classList.toggle("wizardStep__circle--visited", visitedSteps.has("step4"));
    const lockSteps = isWizardLocked && visitedSteps.has("step4");
    step1.classList.toggle("wizardStep__circle--locked", lockSteps);
    step2.classList.toggle("wizardStep__circle--locked", lockSteps);
    step3.classList.toggle("wizardStep__circle--locked", lockSteps);
    step4.classList.remove("wizardStep__circle--locked");
    line1.classList.toggle("wizardSteps__line--complete", visitedSteps.has("step2"));
    line2.classList.toggle("wizardSteps__line--complete", visitedSteps.has("step3"));
    line3.classList.toggle("wizardSteps__line--complete", visitedSteps.has("step4"));
  };

  const setActive = (activeStep) => {
    step1.classList.remove("wizardStep__circle--active");
    step2.classList.remove("wizardStep__circle--active");
    step3.classList.remove("wizardStep__circle--active");
    step4.classList.remove("wizardStep__circle--active");
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

  const bindStep2Form = () => {
    const step2Form = formCard.querySelector("form");
    if (!step2Form) return;
    if (isDemoMode) setDemoValues();
    applyStep1Values(step2Form);
    step2Form?.addEventListener("submit", (e) => {
      e.preventDefault();
      const selected = step2Form.querySelector('input[name="bookCount"]:checked');
      if (!showFieldErrors(step2Form) || !selected) return;
      step2Complete = true;
      captureStep1Values(step2Form);
      selectedLabel =
        selected.closest("label")?.querySelector("span")?.textContent?.trim() || "";
      updateStep4Label();
      renderStep3();
    });
  };

  const renderStep1 = (shouldScroll = true) => {
    isWizardLocked = false;
    setActive(step1);
    if (isDemoMode) setDemoValues();
    formCard.innerHTML = `
      <h2 class="cardTitle">Competition Rules</h2>
      <p class="muted">Please review the competition rules before submitting your entry.</p>
      <ul>
        <li>This is an international competition and we accept poetry books &amp; pamphlets from anywhere in the world provided all submissions are in English. The competition is open to anyone aged 18 or over at the time of entering.</li>
        <li>Each book must only be sent once. We only accept physical copies (i.e. paperbacks or pamphlets) as we then donate your book(s) to local libraries (RCT), Storyville Books (free library/bookshop), and Tesco (free books) each autumn/Christmas.</li>
        <li>Only poetry books published by small, truly independent presses and self-published books are eligible to enter. Publishers that receive grants from arts councils, universities and other sponsorships are not considered independent.</li>
        <li>Only individual poets are eligible to enter (although if a book is co-authored we may <em>bend the rules</em> – please contact us first). The poet must be living. We do not accept anthologies. Translations of other poets’ works are not accepted.</li>
        <li>Entry fees are payable via credit or debit card. Unfortunately, we can no longer accept UK cheques due to our bank charging excessive fees.</li>
        <li>You may enter the competition as many times as you wish, as long as each submission is accompanied by an entry fee.</li>
        <li>There is no publication date requirement but books should not be out of print.</li>
        <li>Only books under 200 pages are eligible. If in doubt, please email us first.</li>
        <li>Unpublished manuscripts are not accepted and will not be returned. No refund will be issued.</li>
        <li>Entries cannot be returned but all books will be donated to local libraries in south Wales, so your book will have the chance to be read by even more people.</li>
        <li>The Maya Poetry Book Awards holds no responsibility for incomplete or ineligible entries.</li>
        <li>It is your responsibility to ensure the correct postage is applied to your parcel and to pay for it. Incorrect postage could result in your package being returned to you and possibly in you missing the deadline.</li>
        <li>If posting from overseas (outside the UK), it is exclusively your responsibility to fill out any customs forms and declarations that may be needed.</li>
        <li>All prizes will be paid in pounds sterling by card. The Poetry Book Awards cannot be held responsible for any payment processing or currency conversion fees.</li>
        <li>By entering, you agree that if you win one of our awards, you will send us a photo and short biography for us to post on our website, to share on social media, as well as for any other advertising/press releases.</li>
        <li>The judge(s) will read all entries. Their decision is final and no correspondence will be entered into.</li>
        <li>The competition organisers reserve the right to change the judge(s) without notice.</li>
        <li>No feedback is offered and no personal comments regarding entries will be given.</li>
        <li>No refunds will be given.</li>
        <li>Entrants will be signed up for the newsletter to be kept informed of changes in announcement dates, judges, winners, etc.</li>
        <li>Winners will be awarded a cash prize and emailed a certificate and logo to use for publicity, and will also receive a review from us on the relevant Goodreads and Amazon UK web pages, if your book is listed on these platforms.</li>
        <li>Any entries received after the closing date will automatically be put forward for the following year’s competition. No returns will be given.</li>
        <li>You retain all rights to your work.</li>
        <li>By entering this competition, each entrant agrees to be bound by these rules.</li>
      </ul>

      <div class="wizardSteps__confirm">
        <div class="form__row">
          <label class="checkRow" for="rules-confirm">
            <input id="rules-confirm" name="rulesConfirm" type="checkbox" />
            <span>I confirm I have read and understood the rules of the competition</span>
          </label>
        </div>
      </div>
      <p class="formError" data-rules-error role="alert" hidden>
        Please confirm you have read and understood the rules before continuing.
      </p>

      <button class="btn btn--full" type="button" data-continue="1">
        <span class="btn__spinner" aria-hidden="true"></span>
        <span class="btn__label">Continue to enter details</span>
      </button>
    `;

    if (isDemoMode) {
      const rulesConfirm = formCard.querySelector("#rules-confirm");
      const rulesError = formCard.querySelector("[data-rules-error]");
      if (rulesConfirm) rulesConfirm.checked = true;
      if (rulesError) rulesError.hidden = true;
    }
    formCard.querySelector('[data-continue="1"]')?.addEventListener("click", (e) => {
      e.preventDefault();
      const rulesConfirm = formCard.querySelector("#rules-confirm");
      const rulesError = formCard.querySelector("[data-rules-error]");
      if (!rulesConfirm?.checked) {
        if (rulesError) rulesError.hidden = false;
        rulesConfirm?.focus();
        return;
      }
      if (rulesError) rulesError.hidden = true;
      step1Complete = true;
      renderStep2();
    });
    if (shouldScroll) scrollToWizardSteps();
  };

  const renderStep2 = (shouldScroll = true) => {
    isWizardLocked = false;
    visitedSteps.add("step2");
    setActive(step2);
    formCard.innerHTML = step2Html;
    if (isDemoMode) setDemoValues();
    updateStep4Label();
    const step2Title = formCard.querySelector(".cardTitle");
    if (step2Title) {
      step2Title.insertAdjacentHTML(
        "afterend",
        '<a class="wizardSteps__back" href="#" data-back="1">&laquo; Back to step 1</a>',
      );
    }
    bindStep2Form();
    formCard.querySelector('[data-back="1"]')?.addEventListener("click", (e) => {
      e.preventDefault();
      const step2Form = formCard.querySelector("form");
      if (step2Form) captureStep1Values(step2Form);
      renderStep1(false);
    });
    if (shouldScroll) scrollToWizardSteps();
  };

  const renderStep3 = (shouldScroll = true) => {
    isWizardLocked = false;
    visitedSteps.add("step3");
    setActive(step3);
    formCard.innerHTML = `
      <h2 class="cardTitle">Enter card details and pay</h2>
      <p class="muted">${selectedLabel}</p>
      <a class="wizardSteps__back" href="#" data-back="2">&laquo; Back to step 2</a>
      <form class="form" action="#" method="post" novalidate>
        <h3>Card details</h3>
        <div class="form__row">
          <label class="label label--text" for="card-number">Card number</label>
          <input id="card-number" name="cardNumber" type="text" inputmode="numeric" autocomplete="cc-number" required />
          <p class="formError" data-error-for="card-number" role="alert" hidden>
            Please enter your card number.
          </p>
        </div>

        <div class="formRow formRow--split">
          <div class="formRow__item">
            <div class="form__row">
              <label class="label label--text" for="card-expiry">Expiry date</label>
              <input id="card-expiry" name="cardExpiry" type="text" autocomplete="cc-exp" required />
              <p class="formError" data-error-for="card-expiry" role="alert" hidden>
                Please enter your expiry date.
              </p>
            </div>
          </div>
          <div class="formRow__item">
            <div class="form__row">
              <label class="label label--text" for="card-cvc">Security code</label>
              <input id="card-cvc" name="cardCvc" type="text" inputmode="numeric" autocomplete="cc-csc" required />
              <p class="formError" data-error-for="card-cvc" role="alert" hidden>
                Please enter your security code.
              </p>
            </div>
          </div>
        </div>

        <h3>Billing address</h3>
        <div class="form__row">
          <label class="label label--text" for="billing-street">Street and town</label>
          <textarea id="billing-street" name="billingStreet" rows="2" required></textarea>
          <p class="formError" data-error-for="billing-street" role="alert" hidden>
            Please enter your street and town.
          </p>
        </div>

        <div class="form__row">
          <label class="label label--text" for="billing-postcode">Postcode</label>
          <input class="input--half" id="billing-postcode" name="billingPostcode" type="text" autocomplete="postal-code" required />
          <p class="formError" data-error-for="billing-postcode" role="alert" hidden>
            Please enter your postcode.
          </p>
        </div>
        <div class="formSpacer"></div>
        <button class="btn btn--full" type="submit">
          <span class="btn__spinner" aria-hidden="true"></span>
          <span class="btn__label">${getPaymentLabel()}</span>
        </button>
      </form>
    `;

    if (isDemoMode) {
      setDemoValues();
    }
    formCard.querySelector('[data-back="2"]')?.addEventListener("click", (e) => {
      e.preventDefault();
      const step3Form = formCard.querySelector("form");
      if (step3Form) captureStep2Values(step3Form);
      renderStep2(false);
    });

    formCard.querySelector("form")?.addEventListener("submit", (e) => {
      e.preventDefault();
      const step3Form = formCard.querySelector("form");
      if (!step3Form) return;
      if (!showFieldErrors(step3Form)) return;
      step3Complete = true;
      captureStep2Values(step3Form);
      renderStep4();
    });

    const step3Form = formCard.querySelector("form");
    if (step3Form) applyStep2Values(step3Form);
    if (shouldScroll) scrollToWizardSteps();
  };

  const renderStep4 = (shouldScroll = true) => {
    visitedSteps.add("step4");
    isWizardLocked = true;
    setActive(step4);
    formCard.innerHTML = `
      <div class="wizardSteps__info" role="status">
        Thank you, payment of ${getPaymentAmount()} was made successfully.
      </div>
      <h2 class="cardTitle">Print label and send your ${getBookLabel()}</h2>
      <p class="muted">Click the "Print label" button to print out the details shown below, then stick this on the parcel for the book/s you're sending. Or, if you prefer, copy the details by hand - make sure to include the proof of payment reference.</p>
      <div class="wizardSteps__labelGrid">
        <div class="wizardSteps__labelInfo">
          <h3>Address</h3>
          <p>
            <strong>Maya Poetry Book Awards</strong><br />
            9 The Avenue<br />
            The Common<br />
            Pontypridd<br />
            CF37 4DF<br />
            United Kingdom
          </p>
        </div>
        <div class="wizardSteps__labelPayment">
          <div class="wizardSteps__labelHeader">
            <h3>Reference</h3>
            <div class="wizardSteps__tooltipWrap">
              <button class="wizardSteps__tooltip" type="button" aria-label="Reference info" data-tooltip-trigger>
                <span aria-hidden="true">⚙</span>
              </button>
              <div class="wizardSteps__tooltipContent" role="tooltip" hidden>
                When it comes to implementing the "point the phone's camera at the QR code to confirm receipt" functionality for the organiser, make sure this only works for a signed in and authorised user.
              </div>
            </div>
          </div>
          <div class="wizardSteps__qr">
            <img src="./assets/qr-code.png" alt="QR code" />
          </div>
          <p class="wizardSteps__labelNumber">5809147823</p>
        </div>
      </div>
      <button class="btn btn--full" type="submit">
        <span class="btn__spinner" aria-hidden="true"></span>
        <span class="btn__label">Print label</span>
      </button>
      <p>The reference QR code and number are for the organiser's use only. If printing the label, please keep these elements visible. If manually copying the details, just be sure to write out the reference number.</p>
      <p>It is your responsibility to ensure the correct postage is applied to your parcel and to pay for it. Incorrect postage could result in your package being returned to you and possibly in you missing the deadline.</li>
      <p>If posting from overseas (outside the UK), it is exclusively your responsibility to fill out any customs forms and declarations that may be needed.</p>
    `;

    formCard.querySelector("button")?.addEventListener("click", (e) => {
      e.preventDefault();
    });
    const tooltipTrigger = formCard.querySelector("[data-tooltip-trigger]");
    const tooltipContent = formCard.querySelector(".wizardSteps__tooltipContent");
    if (tooltipTrigger && tooltipContent) {
      tooltipTrigger.addEventListener("click", () => {
        tooltipContent.hidden = !tooltipContent.hidden;
      });
    }
    if (shouldScroll) scrollToWizardSteps();
  };

  const captureActiveStepValues = () => {
    if (step2.classList.contains("wizardStep__circle--active")) {
      const step2Form = formCard.querySelector("form");
      if (step2Form) captureStep1Values(step2Form);
    }
    if (step3.classList.contains("wizardStep__circle--active")) {
      const step3Form = formCard.querySelector("form");
      if (step3Form) captureStep2Values(step3Form);
    }
  };

  const handleStepClick = (targetStep) => {
    if (targetStep === 1 && step1.classList.contains("wizardStep__circle--active")) return;
    if (targetStep === 2 && step2.classList.contains("wizardStep__circle--active")) return;
    if (targetStep === 3 && step3.classList.contains("wizardStep__circle--active")) return;
    if (targetStep === 4 && step4.classList.contains("wizardStep__circle--active")) return;

    if (isWizardLocked && targetStep !== 4) {
      showWizardModal("The competition entry process is now complete. You can no longer change any details.");
      return;
    }

    if (targetStep === 2 && !step1Complete) {
      showWizardModal(
        `To continue to step 2, please first confirm you have read the rules then ${getClickTapLabel()} "Continue to enter details" at the bottom of Step 1.`,
      );
      return;
    }

    if (targetStep === 3 && !step2Complete) {
      showWizardModal(
        `To continue to step 3, please first enter your personal details and the number of books you're entering, then ${getClickTapLabel()} "Continue to enter card and pay" at the bottom of Step 2.`,
      );
      return;
    }

    if (targetStep === 4 && !step3Complete) {
      showWizardModal(
        `To continue to step 4, please enter all card details then ${getClickTapLabel()} "Pay ${getPaymentAmount()} and continue" at the bottom of Step 3.`,
      );
      return;
    }

    captureActiveStepValues();
    if (targetStep === 1) renderStep1(false);
    if (targetStep === 2) renderStep2(false);
    if (targetStep === 3) renderStep3(false);
    if (targetStep === 4) renderStep4(false);
  };

  if (isDemoMode) setDemoValues();
  renderStep1(false);

  step1Wrap?.addEventListener("click", () => handleStepClick(1));
  step2Wrap?.addEventListener("click", () => handleStepClick(2));
  step3Wrap?.addEventListener("click", () => handleStepClick(3));
  step4Wrap?.addEventListener("click", () => handleStepClick(4));
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

