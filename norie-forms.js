(() => {
  const headers = { "Content-Type": "application/json" };
  const DELIVERY_FEE = 5;

  function clean(value) {
    return String(value || "").replace(/\s+/g, " ").trim();
  }

  function selectedLabel(form, name, fallback) {
    const input = form.querySelector(`input[name="${name}"]:checked`);
    if (!input) {
      return fallback;
    }

    const label = input.closest("label");
    if (!label) {
      return clean(input.value) || fallback;
    }

    const labelCopy = label.cloneNode(true);
    labelCopy.querySelectorAll("small,input").forEach((element) => element.remove());
    return clean(labelCopy.textContent) || clean(input.value) || fallback;
  }

  function setStatus(button, message, { id, isError = false } = {}) {
    const container = button.parentElement;
    let status = container.querySelector(".form-status");

    if (!status) {
      status = document.createElement("p");
      status.className = "form-status";
      status.setAttribute("role", "status");
      status.style.marginTop = "12px";
      status.style.color = "#6b243d";
      button.insertAdjacentElement("afterend", status);
    }

    if (id) {
      status.id = id;
    }
    status.dataset.state = isError ? "error" : "message";
    status.textContent = message;
    return status;
  }

  function setBusy(button, busy) {
    if (busy) {
      button.setAttribute("aria-busy", "true");
      button.setAttribute("aria-disabled", "true");
      return;
    }
    button.removeAttribute("aria-busy");
    button.removeAttribute("aria-disabled");
  }

  function isBusy(button) {
    return button.getAttribute("aria-busy") === "true";
  }

  function appendDescription(input, id) {
    const ids = new Set(clean(input.getAttribute("aria-describedby")).split(" ").filter(Boolean));
    ids.add(id);
    input.setAttribute("aria-describedby", [...ids].join(" "));
  }

  function removeDescription(input, id) {
    const ids = clean(input.getAttribute("aria-describedby"))
      .split(" ")
      .filter((value) => value && value !== id);
    if (ids.length) {
      input.setAttribute("aria-describedby", ids.join(" "));
      return;
    }
    input.removeAttribute("aria-describedby");
  }

  function clearFieldError(input, statusId) {
    input.removeAttribute("aria-invalid");
    removeDescription(input, statusId);
    const status = document.querySelector(`#${statusId}`);
    if (status?.dataset.state === "error") {
      status.textContent = "";
    }
  }

  function showFieldError(input, button, statusId, message) {
    input.setAttribute("aria-invalid", "true");
    appendDescription(input, statusId);
    setStatus(button, message, { id: statusId, isError: true });
    input.focus();
  }

  function orderRequestId(form) {
    const input = form.elements.requestId;
    if (!input.value) {
      input.value = crypto.randomUUID();
    }
    return input.value;
  }

  function selectedFulfillment(form) {
    return clean(form.elements.fulfillment?.value);
  }

  function updateFulfillment(form) {
    const isDelivery = selectedFulfillment(form) === "delivery";
    const address = form.querySelector("#deliveryAddress");
    const subtotal = Number.parseInt(form.dataset.itemSubtotal, 10) || 0;
    const fee = isDelivery ? DELIVERY_FEE : 0;

    address.hidden = !isDelivery;
    address.querySelectorAll("input").forEach((input) => {
      input.disabled = !isDelivery;
    });
    form.querySelector("#deliveryFee").textContent = `CAD $${fee}`;
    form.querySelector("#totalPrice").textContent = `CAD $${subtotal + fee}`;
  }

  function orderPayload(form) {
    return {
      requestId: orderRequestId(form),
      product: clean(form.elements.product?.value),
      variant: clean(form.elements.variant?.value),
      quantity: Number.parseInt(form.elements.quantity?.value, 10) || 1,
      rhinestoneColor: selectedLabel(form, "stoneColor", "Not selected"),
      customText: clean(form.querySelector("#customText")?.value),
      customerName: clean(form.querySelector("#customerName")?.value),
      customerEmail: clean(form.querySelector("#orderEmail")?.value),
      customerContact: clean(form.querySelector("#customerContact")?.value),
      fulfillment: clean(form.elements.fulfillment?.value),
      streetAddress: clean(form.elements.streetAddress?.value),
      addressUnit: clean(form.elements.addressUnit?.value),
      city: clean(form.elements.city?.value),
      province: clean(form.elements.province?.value),
      postalCode: clean(form.elements.postalCode?.value),
      pageUrl: window.location.href
    };
  }

  async function postJson(url, payload) {
    const response = await fetch(url, {
      method: "POST",
      headers,
      body: JSON.stringify(payload)
    });
    const data = await response.json().catch(() => ({}));

    if (!response.ok) {
      throw new Error(data.error || "Request failed");
    }
    return data;
  }

  function bindOrderForm() {
    const form = document.querySelector("#customForm");
    const button = form?.querySelector("button[type='submit']");
    const customerName = form?.querySelector("#customerName");
    const customerEmail = form?.querySelector("#orderEmail");
    const customerContact = form?.querySelector("#customerContact");
    const fulfillmentInputs = [...(form?.querySelectorAll("input[name='fulfillment']") || [])];
    const deliveryAddress = form?.querySelector("#deliveryAddress");
    if (!form || !button || !customerName || !customerEmail || !customerContact || !deliveryAddress) {
      return;
    }

    customerName.addEventListener("input", () => clearFieldError(customerName, "order-status"));
    customerEmail.addEventListener("input", () => clearFieldError(customerEmail, "order-status"));
    customerContact.addEventListener("input", () => clearFieldError(customerContact, "order-status"));
    fulfillmentInputs.forEach((input) => input.addEventListener("change", () => {
      clearFieldError(input, "order-status");
      updateFulfillment(form);
    }));
    deliveryAddress.querySelectorAll("input").forEach((input) => {
      input.addEventListener("input", () => clearFieldError(input, "order-status"));
    });
    form.addEventListener("norie:pricechange", () => updateFulfillment(form));
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isBusy(button)) {
        return;
      }
      if (!clean(customerName.value)) {
        showFieldError(customerName, button, "order-status", "Name: enter your name.");
        return;
      }
      if (!clean(customerEmail.value) || !customerEmail.validity.valid) {
        showFieldError(customerEmail, button, "order-status", "Email address: enter a valid email address.");
        return;
      }
      if (!clean(customerContact.value)) {
        showFieldError(customerContact, button, "order-status", "Contact: enter your WeChat ID.");
        return;
      }
      const fulfillment = selectedFulfillment(form);
      if (!fulfillment) {
        showFieldError(fulfillmentInputs[0], button, "order-status", "Fulfillment: choose Delivery or Pickup.");
        return;
      }
      if (fulfillment === "delivery") {
        const requiredAddressFields = [
          [form.elements.streetAddress, "Street address: enter the delivery street address."],
          [form.elements.city, "City: enter the delivery city."],
          [form.elements.province, "Province: enter the delivery province."],
          [form.elements.postalCode, "Postal code: enter the delivery postal code."]
        ];
        const missing = requiredAddressFields.find(([input]) => !clean(input.value));
        if (missing) {
          showFieldError(missing[0], button, "order-status", missing[1]);
          return;
        }
      }

      setBusy(button, true);
      setStatus(button, "Sending your custom order request...", { id: "order-status" });

      try {
        await postJson("/api/custom-order", orderPayload(form));
        setStatus(button, "Sent. We will reply by email soon.", { id: "order-status" });
      } catch (error) {
        setStatus(button, error.message || "Could not send right now.", {
          id: "order-status",
          isError: true
        });
      } finally {
        setBusy(button, false);
      }
    });
    updateFulfillment(form);
  }

  function bindSubscribeForm() {
    const form = document.querySelector("#subscribeForm");
    const input = form?.querySelector("input[type='email']");
    const button = form?.querySelector("button[type='submit']");
    if (!form || !input || !button) {
      return;
    }

    input.addEventListener("input", () => clearFieldError(input, "subscribe-status"));
    form.addEventListener("submit", async (event) => {
      event.preventDefault();
      if (isBusy(button)) {
        return;
      }
      const email = clean(input.value);

      if (!email || !input.validity.valid) {
        showFieldError(input, button, "subscribe-status", "Email address: enter a valid email address.");
        return;
      }

      clearFieldError(input, "subscribe-status");
      setBusy(button, true);
      setStatus(button, "Adding you to the Norie list...", { id: "subscribe-status" });

      try {
        await postJson("/api/subscribe", { email, pageUrl: window.location.href });
        form.reset();
        setStatus(button, "Subscribed. Please check your inbox for the welcome email.", {
          id: "subscribe-status"
        });
      } catch (error) {
        setStatus(button, error.message || "Could not subscribe right now.", {
          id: "subscribe-status",
          isError: true
        });
      } finally {
        setBusy(button, false);
      }
    });
  }

  document.addEventListener("DOMContentLoaded", () => {
    bindOrderForm();
    bindSubscribeForm();
  });
})();
