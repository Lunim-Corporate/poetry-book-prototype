function initNewsletterSignup() {
  const newsletterEl = document.getElementById("newsletter");
  const newsletterForm = document.getElementById("newsletter-form");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("newsletter-submit");
  const errorEl = newsletterForm?.querySelector("[data-newsletter-error]");

  if (!newsletterEl || !newsletterForm || !emailInput || !submitBtn) return;

  emailInput.addEventListener("input", () => {
    if (errorEl) errorEl.hidden = true;
  });

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!emailInput.checkValidity()) {
      if (errorEl) errorEl.hidden = false;
      emailInput.focus();
      return;
    }
    if (errorEl) errorEl.hidden = true;

    const emailAddress = String(emailInput.value || "").trim();
    const capturedEmailAddress = emailAddress;
    void capturedEmailAddress;

    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    newsletterEl.setAttribute("aria-busy", "true");

    window.setTimeout(() => {
      newsletterEl.removeAttribute("aria-busy");
      newsletterEl.innerHTML = "";

      const title = document.createElement("h2");
      title.className = "cardTitle";
      title.textContent = "You're Signed Up!";

      const copy = document.createElement("p");
      copy.className = "muted";
      copy.textContent = `Thank you. You'll now receive occasional updates to the email address ${capturedEmailAddress} that you provided.`;

      const unsubscribe = document.createElement("p");
      unsubscribe.className = "fineprint";
      unsubscribe.textContent = "You can unsubscribe at any time.";

      newsletterEl.appendChild(title);
      newsletterEl.appendChild(copy);
      newsletterEl.appendChild(unsubscribe);
    }, 3000);
  });
}

function initContactForm() {
  const contactCard = document.getElementById("contact-form");
  if (!contactCard) return;

  const form = contactCard.querySelector("form");
  const emailInput = document.getElementById("contact-email");
  const newsletterCheckbox = document.getElementById("contact-newsletter");
  const submitBtn = document.getElementById("contact-submit") || contactCard.querySelector("button[type=\"submit\"]");
  const errorEl = contactCard.querySelector("[data-contact-error]");

  if (!form || !emailInput || !submitBtn) return;

  form.addEventListener("input", () => {
    if (errorEl) errorEl.hidden = true;
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate all required fields (name/email/message)
    if (!form.checkValidity()) {
      if (errorEl) errorEl.hidden = false;
      form.querySelector(":invalid")?.focus();
      return;
    }
    if (errorEl) errorEl.hidden = true;

    const emailAddress = String(emailInput.value || "").trim();
    const wantsNewsletter = Boolean(newsletterCheckbox && newsletterCheckbox.checked);

    submitBtn.disabled = true;
    submitBtn.classList.add("is-loading");
    contactCard.setAttribute("aria-busy", "true");

    window.setTimeout(() => {
      contactCard.removeAttribute("aria-busy");
      contactCard.innerHTML = "";

      const title = document.createElement("h2");
      title.className = "cardTitle";
      title.textContent = "Message Sent!";

      const copy = document.createElement("p");
      copy.className = "muted";
      copy.textContent = `Thank you. We'll be in touch soon to the email address ${emailAddress}.`;

      contactCard.appendChild(title);
      contactCard.appendChild(copy);

      if (wantsNewsletter) {
        const newsletterCopy = document.createElement("p");
        newsletterCopy.className = "muted";
        newsletterCopy.textContent = "You'll also receive the occasional newsletter updates.";
        contactCard.appendChild(newsletterCopy);
      }

      const note = document.createElement("p");
      note.className = "fineprint";
      note.textContent = "You can unsubscribe at any time.";
      contactCard.appendChild(note);
    }, 3000);
  });
}

function initHomeFormsWhenReady() {
  initNewsletterSignup();
  initContactForm();
}

if (window.__includesLoaded) {
  initHomeFormsWhenReady();
} else {
  document.addEventListener("includes:loaded", initHomeFormsWhenReady, { once: true });
}

