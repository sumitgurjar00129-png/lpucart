/**
 * LPUcart - Core Website Script & Master Configuration
 * =====================================================
 * MASTER OWNER CONFIGURATION
 * Single configuration object used across the entire website.
 */

const OWNER_CONFIG = {
  OWNER_NAME: "Sumit Gurjar",
  OWNER_PHONE: "919680040551",
  OWNER_PHONE_DISPLAY: "+91 96800 40551",
  OWNER_EMAIL: "sumitgurjar00129@gmail.com"
};

const OWNER_NAME = OWNER_CONFIG.OWNER_NAME;
const OWNER_PHONE = OWNER_CONFIG.OWNER_PHONE;
const OWNER_PHONE_DISPLAY = OWNER_CONFIG.OWNER_PHONE_DISPLAY;
const OWNER_EMAIL = OWNER_CONFIG.OWNER_EMAIL;

/**
 * MASTER HOSTEL & CAMPUS BUILDINGS CONFIGURATION
 * Edit this single object to update all hostels across the entire website.
 */
const HOSTELS = {
  boys: [
    "Boys Hostel 1",
    "Boys Hostel 2",
    "Boys Hostel 3",
    "Boys Hostel 4",
    "Boys Hostel 5",
    "Boys Hostel 6",
    "Boys Hostel 7",
    "Boys Hostel 8",
    "Boys Hostel 9",
    "Boys Hostel 10"
  ],
  girls: [
    "Girls Hostel 11",
    "Girls Hostel 12",
    "Girls Hostel 13"
  ],
  other: [] // extra buildings can be added here later
};

// Backwards-compatible aliases
const SUPPORT_CONFIG = {
  SUPPORT_PHONE: OWNER_PHONE,
  SUPPORT_EMAIL: OWNER_EMAIL
};
const SUPPORT_PHONE = OWNER_PHONE;
const SUPPORT_EMAIL = OWNER_EMAIL;

// Make globally available across all pages and scripts
window.OWNER_CONFIG = OWNER_CONFIG;
window.OWNER_NAME = OWNER_NAME;
window.OWNER_PHONE = OWNER_PHONE;
window.OWNER_PHONE_DISPLAY = OWNER_PHONE_DISPLAY;
window.OWNER_EMAIL = OWNER_EMAIL;
window.HOSTELS = HOSTELS;
window.SUPPORT_CONFIG = SUPPORT_CONFIG;
window.SUPPORT_PHONE = SUPPORT_PHONE;
window.SUPPORT_EMAIL = SUPPORT_EMAIL;

/**
 * Determine the category of a given hostel: 'boys' | 'girls' | 'other'
 */
function getHostelCategory(hostelName) {
  if (!hostelName) return "other";
  const trimmed = hostelName.trim();
  if ((HOSTELS.boys || []).includes(trimmed)) return "boys";
  if ((HOSTELS.girls || []).includes(trimmed)) return "girls";
  return "other";
}
window.getHostelCategory = getHostelCategory;

/**
 * Populate any <select> element with grouped hostel options:
 * - <optgroup label="Boys Hostels">
 * - <optgroup label="Girls Hostels">
 * - <optgroup label="Other Buildings">
 * 
 * Also handles the "Other building" option with a companion custom input container.
 * 
 * @param {HTMLSelectElement} selectEl 
 * @param {HTMLElement|null} customContainerEl 
 * @param {HTMLInputElement|null} customInputEl 
 * @param {string} selectedVal 
 */
function renderHostelDropdown(selectEl, customContainerEl = null, customInputEl = null, selectedVal = "") {
  if (!selectEl) return;

  let html = '<option value="" disabled selected>-- Select Hostel / Building --</option>';

  // 1. Boys Hostels
  if (HOSTELS.boys && HOSTELS.boys.length > 0) {
    html += '<optgroup label="Boys Hostels">';
    HOSTELS.boys.forEach(h => {
      const isSel = (h === selectedVal) ? 'selected' : '';
      html += `<option value="${h}" ${isSel}>${h}</option>`;
    });
    html += '</optgroup>';
  }

  // 2. Girls Hostels
  if (HOSTELS.girls && HOSTELS.girls.length > 0) {
    html += '<optgroup label="Girls Hostels">';
    HOSTELS.girls.forEach(h => {
      const isSel = (h === selectedVal) ? 'selected' : '';
      html += `<option value="${h}" ${isSel}>${h}</option>`;
    });
    html += '</optgroup>';
  }

  // 3. Other Buildings
  html += '<optgroup label="Other Buildings">';
  if (HOSTELS.other && HOSTELS.other.length > 0) {
    HOSTELS.other.forEach(h => {
      const isSel = (h === selectedVal) ? 'selected' : '';
      html += `<option value="${h}" ${isSel}>${h}</option>`;
    });
  }
  const isOtherCustom = selectedVal && !HOSTELS.boys.includes(selectedVal) && !HOSTELS.girls.includes(selectedVal) && !(HOSTELS.other || []).includes(selectedVal);
  html += `<option value="__OTHER__" ${isOtherCustom ? 'selected' : ''}>Other building (Type name/number)...</option>`;
  html += '</optgroup>';

  selectEl.innerHTML = html;

  // Manage custom input toggling
  if (customContainerEl && customInputEl) {
    function toggleCustom() {
      if (selectEl.value === "__OTHER__") {
        customContainerEl.style.display = "block";
        customInputEl.required = true;
        customInputEl.focus();
      } else {
        customContainerEl.style.display = "none";
        customInputEl.required = false;
        customInputEl.value = "";
      }
    }

    selectEl.removeEventListener("change", toggleCustom);
    selectEl.addEventListener("change", toggleCustom);

    if (isOtherCustom) {
      customContainerEl.style.display = "block";
      customInputEl.required = true;
      customInputEl.value = selectedVal;
    } else if (selectEl.value === "__OTHER__") {
      customContainerEl.style.display = "block";
      customInputEl.required = true;
    } else {
      customContainerEl.style.display = "none";
      customInputEl.required = false;
    }
  }
}
window.renderHostelDropdown = renderHostelDropdown;

/**
 * Returns the final chosen hostel string (either selected option or custom text).
 */
function getSelectedHostelValue(selectEl, customInputEl = null) {
  if (!selectEl) return "";
  if (selectEl.value === "__OTHER__") {
    const custom = customInputEl ? customInputEl.value.trim() : "";
    return custom || "Other Building";
  }
  return selectEl.value;
}
window.getSelectedHostelValue = getSelectedHostelValue;

// ==========================================
// 1. THEME MANAGEMENT (Dark / Light with safe localStorage)
// ==========================================
function initTheme() {
  let savedTheme = "dark";
  try {
    savedTheme = localStorage.getItem("lpucart_theme") || "dark";
  } catch (e) {
    console.warn("localStorage theme read failed, falling back to dark:", e);
  }
  document.documentElement.setAttribute("data-theme", savedTheme);
  updateThemeToggleButtons(savedTheme);
}

function toggleTheme() {
  const current = document.documentElement.getAttribute("data-theme") || "dark";
  const newTheme = current === "dark" ? "light" : "dark";
  document.documentElement.setAttribute("data-theme", newTheme);
  try {
    localStorage.setItem("lpucart_theme", newTheme);
  } catch (e) {
    console.warn("localStorage theme write failed:", e);
  }
  updateThemeToggleButtons(newTheme);
  showToast(`Switched to ${newTheme === "dark" ? "Dark 🌙" : "Light ☀️"} mode`, "info");

  // Re-draw any active charts on page if admin dashboard is open
  if (typeof window.refreshAdminChartsTheme === "function") {
    window.refreshAdminChartsTheme();
  }
}

function updateThemeToggleButtons(theme) {
  const btns = document.querySelectorAll(".theme-toggle-btn");
  btns.forEach(btn => {
    if (theme === "dark") {
      btn.innerHTML = `<i class="fa-solid fa-sun text-amber-400"></i>`;
      btn.setAttribute("title", "Switch to Light Mode");
      btn.setAttribute("aria-label", "Switch to Light Mode");
    } else {
      btn.innerHTML = `<i class="fa-solid fa-moon text-blue-400"></i>`;
      btn.setAttribute("title", "Switch to Dark Mode");
      btn.setAttribute("aria-label", "Switch to Dark Mode");
    }
  });
}

// ==========================================
// 2. 3D TILT EFFECT ON CARDS
// Glitch-free, disabled on touch devices
// ==========================================
function init3DTiltCards() {
  // Check if touch device / mobile screen
  const isTouchDevice = window.matchMedia("(pointer: coarse)").matches || 
                        ('ontouchstart' in window) || 
                        (navigator.maxTouchPoints > 0);

  const cards = document.querySelectorAll(".tilt-card");

  cards.forEach(card => {
    if (isTouchDevice) {
      // Keep static on touch screens so cards don't jitter, shake, or stick!
      card.style.transform = "none";
      return;
    }

    card.addEventListener("mousemove", e => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      // Soft tilt angles (max +- 8 degrees) to prevent jarring perspective shifts
      const rotateX = ((centerY - y) / centerY) * 7;
      const rotateY = ((x - centerX) / centerX) * 7;

      card.style.transform = `perspective(1000px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) translateZ(8px)`;
    });

    card.addEventListener("mouseleave", () => {
      card.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) translateZ(0px)`;
    });
  });
}

// ==========================================
// 3. 3D FLIP CARDS
// ==========================================
function initFlipCards() {
  const flipCards = document.querySelectorAll(".card-3d-flip");
  flipCards.forEach(card => {
    // Accessible keyboard toggle
    card.setAttribute("tabindex", "0");
    card.setAttribute("role", "button");
    card.setAttribute("aria-label", "Flip card to view more details");

    card.addEventListener("click", () => {
      card.classList.toggle("is-flipped");
    });

    card.addEventListener("keydown", e => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        card.classList.toggle("is-flipped");
      }
    });
  });
}

// ==========================================
// 4. TOAST NOTIFICATION SYSTEM
// ==========================================
function showToast(message, type = "info", duration = 3800) {
  let toastContainer = document.getElementById("toast-container");
  if (!toastContainer) {
    toastContainer = document.createElement("div");
    toastContainer.id = "toast-container";
    toastContainer.className = "toast-container";
    toastContainer.setAttribute("aria-live", "polite");
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement("div");
  toast.className = `toast-item toast-${type} glass-card`;

  let icon = "fa-circle-info";
  if (type === "success") icon = "fa-circle-check text-emerald-400";
  if (type === "error") icon = "fa-circle-exclamation text-rose-400";
  if (type === "warning") icon = "fa-triangle-exclamation text-amber-400";

  toast.innerHTML = `
    <div class="toast-content">
      <i class="fa-solid ${icon} toast-icon"></i>
      <span class="toast-msg">${message}</span>
    </div>
    <button class="toast-close" aria-label="Close notification" onclick="this.parentElement.remove()">&times;</button>
  `;

  toastContainer.appendChild(toast);

  // Trigger GPU-friendly entry animation
  requestAnimationFrame(() => {
    toast.classList.add("toast-show");
  });

  setTimeout(() => {
    toast.classList.remove("toast-show");
    setTimeout(() => {
      if (toast.parentElement) toast.remove();
    }, 400);
  }, duration);
}

// ==========================================
// 5. ANIMATED NUMBER COUNTERS
// ==========================================
function initCounters() {
  const counters = document.querySelectorAll(".counter-num");
  if (!counters.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          const counter = entry.target;
          const target = parseInt(counter.getAttribute("data-target"), 10) || 0;
          const prefix = counter.getAttribute("data-prefix") || "";
          const suffix = counter.getAttribute("data-suffix") || "";
          let current = 0;
          const step = Math.max(1, Math.floor(target / 35));

          const timer = setInterval(() => {
            current += step;
            if (current >= target) {
              counter.textContent = `${prefix}${target.toLocaleString()}${suffix}`;
              clearInterval(timer);
            } else {
              counter.textContent = `${prefix}${current.toLocaleString()}${suffix}`;
            }
          }, 35);

          obs.unobserve(counter);
        }
      });
    },
    { threshold: 0.2 }
  );

  counters.forEach(c => observer.observe(c));
}

// ==========================================
// 6. SCROLL REVEAL ANIMATIONS
// ==========================================
function initScrollReveal() {
  const elements = document.querySelectorAll(".reveal-on-scroll");
  if (!elements.length) return;

  const observer = new IntersectionObserver(
    (entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    },
    { threshold: 0.1 }
  );

  elements.forEach(el => observer.observe(el));
}

// ==========================================
// 7. ACTIVE NAVIGATION LINK
// ==========================================
function setActiveNavLink() {
  const rawPath = window.location.pathname.split("/").pop() || "index.html";
  const currentPath = rawPath.split("#")[0].split("?")[0] || "index.html";
  const navLinks = document.querySelectorAll(".nav-link");

  navLinks.forEach(link => {
    const rawHref = link.getAttribute("href") || "";
    const cleanHref = rawHref.split("#")[0].split("?")[0];
    if (cleanHref === currentPath || (currentPath === "" && cleanHref === "index.html")) {
      link.classList.add("active");
    } else {
      link.classList.remove("active");
    }
  });
}

// ==========================================
// 8. MOBILE MENU TOGGLE
// ==========================================
function initMobileMenu() {
  const toggleBtn = document.getElementById("mobile-menu-btn");
  const navMenu = document.getElementById("mobile-nav-menu");
  const overlay = document.getElementById("mobile-nav-overlay");

  if (!toggleBtn || !navMenu) return;

  function toggleMenu() {
    const isOpen = navMenu.classList.toggle("open");
    if (overlay) overlay.classList.toggle("open", isOpen);
    document.body.classList.toggle("menu-lock", isOpen);
    toggleBtn.setAttribute("aria-expanded", isOpen ? "true" : "false");
  }

  toggleBtn.addEventListener("click", toggleMenu);
  if (overlay) overlay.addEventListener("click", toggleMenu);

  navMenu.querySelectorAll("a").forEach(a => {
    a.addEventListener("click", () => {
      navMenu.classList.remove("open");
      if (overlay) overlay.classList.remove("open");
      document.body.classList.remove("menu-lock");
      toggleBtn.setAttribute("aria-expanded", "false");
    });
  });
}

// ==========================================
// 9. ACCESSIBLE MODALS
// ==========================================
function openModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.add("modal-open");
    document.body.classList.add("modal-lock");
    modal.setAttribute("aria-hidden", "false");
    const focusable = modal.querySelector("button, input, [tabindex='0']");
    if (focusable) focusable.focus();
  }
}

function closeModal(modalId) {
  const modal = document.getElementById(modalId);
  if (modal) {
    modal.classList.remove("modal-open");
    document.body.classList.remove("modal-lock");
    modal.setAttribute("aria-hidden", "true");
  }
}

window.addEventListener("click", e => {
  if (e.target.classList.contains("modal-backdrop")) {
    e.target.classList.remove("modal-open");
    document.body.classList.remove("modal-lock");
  }
});

window.addEventListener("keydown", e => {
  if (e.key === "Escape") {
    document.querySelectorAll(".modal-backdrop.modal-open").forEach(m => {
      m.classList.remove("modal-open");
    });
    document.body.classList.remove("modal-lock");
  }
});

// ==========================================
// 10. WHATSAPP & PHONE HELPERS
// ==========================================
function openWhatsAppOrder(phone, orderId, studentName = "") {
  const targetPhone = phone || (window.OWNER_CONFIG && window.OWNER_CONFIG.OWNER_PHONE) || "919680040551";
  const cleanPhone = targetPhone.replace(/[^0-9]/g, "");
  const text = encodeURIComponent(
    `Hello LPUcart Delivery! Regarding order ${orderId} (${studentName}): When will my parcel be delivered?`
  );
  window.open(`https://wa.me/${cleanPhone}?text=${text}`, "_blank");
}

function applySupportConfig() {
  const name = (window.OWNER_CONFIG && window.OWNER_CONFIG.OWNER_NAME) || "Sumit Gurjar";
  const phone = (window.OWNER_CONFIG && window.OWNER_CONFIG.OWNER_PHONE) || "919680040551";
  const phoneDisplay = (window.OWNER_CONFIG && window.OWNER_CONFIG.OWNER_PHONE_DISPLAY) || "+91 96800 40551";
  const email = (window.OWNER_CONFIG && window.OWNER_CONFIG.OWNER_EMAIL) || "sumitgurjar00129@gmail.com";

  document.querySelectorAll(".owner-name-val, #owner-name-val").forEach(el => {
    el.textContent = name;
  });

  document.querySelectorAll(".owner-phone-val, #owner-phone-val, .support-phone-val, #support-phone-val, #contact-phone-display, #runner-phone, .support-phone-text").forEach(el => {
    el.textContent = phoneDisplay;
  });

  document.querySelectorAll(".owner-email-val, #owner-email-val, .support-email-val, #support-email-val").forEach(el => {
    el.textContent = email;
    if (el.tagName === "A") {
      el.href = `mailto:${email}`;
    }
  });

  const waBtn = document.getElementById("contact-whatsapp-link");
  if (waBtn) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    waBtn.href = `https://wa.me/${cleanPhone}`;
    waBtn.onclick = null;
  }

  const callBtn = document.getElementById("call-runner-btn");
  if (callBtn) {
    const cleanPhone = phone.replace(/[^0-9]/g, "");
    callBtn.href = "tel:" + cleanPhone;
    callBtn.onclick = null;
  }
}

// INITIALIZE ON DOM READY
document.addEventListener("DOMContentLoaded", () => {
  initTheme();
  init3DTiltCards();
  initFlipCards();
  initCounters();
  initScrollReveal();
  setActiveNavLink();
  initMobileMenu();
  applySupportConfig();
});

// Window Exports
window.showToast = showToast;
window.toggleTheme = toggleTheme;
window.openModal = openModal;
window.closeModal = closeModal;
window.openWhatsAppOrder = openWhatsAppOrder;
window.init3DTiltCards = init3DTiltCards;
window.applySupportConfig = applySupportConfig;
