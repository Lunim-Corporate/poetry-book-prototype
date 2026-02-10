function initNewsletterSignup() {
  const newsletterEl = document.getElementById("newsletter");
  const newsletterForm = document.getElementById("newsletter-form");
  const emailInput = document.getElementById("email");
  const submitBtn = document.getElementById("newsletter-submit");
  const showFieldErrors = (form) => {
    if (!form) return false;
    form.querySelectorAll(".formError").forEach((error) => {
      error.hidden = true;
    });
    const invalidFields = form.querySelectorAll(":invalid");
    invalidFields.forEach((field) => {
      const error = form.querySelector(`[data-error-for="${field.id}"]`);
      if (error) error.hidden = false;
    });
    invalidFields[0]?.focus();
    return invalidFields.length === 0;
  };

  if (!newsletterEl || !newsletterForm || !emailInput || !submitBtn) return;

  emailInput.addEventListener("input", () => {
    newsletterForm?.querySelectorAll(".formError").forEach((error) => {
      error.hidden = true;
    });
  });

  newsletterForm.addEventListener("submit", (e) => {
    e.preventDefault();

    if (!showFieldErrors(newsletterForm)) return;

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

  if (!form || !emailInput || !submitBtn) return;

  form.addEventListener("input", () => {
    form.querySelectorAll(".formError").forEach((error) => {
      error.hidden = true;
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    // Validate all required fields (name/email/message)
    if (!showFieldErrors(form)) return;

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

