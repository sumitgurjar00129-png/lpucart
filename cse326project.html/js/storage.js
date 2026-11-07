/**
 * LPUcart - Storage & Data Access Layer
 * =====================================
 * Single unified storage module for:
 * - Orders ledger & status workflows
 * - Owner authentication (SHA-256 via Web Crypto API, session timeout, lockout)
 * - Delivery partner management & authentication
 * - Contact inquiries (stored locally)
 * - Student device privacy (device-specific order history & 4-digit phone verification for tracking)
 * 
 * Cleanly abstracted so it can be swapped with Firebase / Supabase later without modifying pages.
 */

// Master Storage Keys
const STORAGE_KEYS = {
  ORDERS: "lpucart_orders",
  MY_ORDERS: "lpucart_my_orders",
  PARTNERS: "lpucart_partners",
  MESSAGES: "lpucart_contact_messages",
  OWNER_AUTH: "lpucart_owner_auth",
  OWNER_LOCKOUT: "lpucart_owner_lockout",
  PARTNER_LOCKOUT: "lpucart_partner_lockout",
  WEEKLY_PASS: "lpucart_weekly_pass",
  THEME: "lpucart_theme"
};

const SESSION_KEYS = {
  OWNER_SESSION: "lpucart_owner_session",
  PARTNER_SESSION: "lpucart_partner_session"
};

// Safe JSON LocalStorage Wrapper
const SafeStore = {
  get(key, defaultValue = null) {
    try {
      const val = localStorage.getItem(key);
      if (val === null || val === undefined) return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      console.warn(`[SafeStore] Error reading key "${key}":`, e);
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`[SafeStore] Error writing key "${key}":`, e);
      return false;
    }
  },
  remove(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (e) {
      console.error(`[SafeStore] Error removing key "${key}":`, e);
      return false;
    }
  }
};

// Safe SessionStorage Wrapper
const SafeSession = {
  get(key, defaultValue = null) {
    try {
      const val = sessionStorage.getItem(key);
      if (val === null || val === undefined) return defaultValue;
      return JSON.parse(val);
    } catch (e) {
      return defaultValue;
    }
  },
  set(key, value) {
    try {
      sessionStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      return false;
    }
  },
  remove(key) {
    try {
      sessionStorage.removeItem(key);
      return true;
    } catch (e) {
      return false;
    }
  }
};

/**
 * Compute SHA-256 hex digest using Web Crypto API
 * Never stores or handles plain text passwords in master state.
 */
async function sha256(text) {
  if (typeof crypto !== "undefined" && crypto.subtle) {
    const buffer = new TextEncoder().encode(text);
    const hashBuffer = await crypto.subtle.digest("SHA-256", buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    return hashArray.map(b => b.toString(16).padStart(2, "0")).join("");
  }
  // Fallback simple hash if Web Crypto unavailable in tests
  let hash = 0;
  for (let i = 0; i < text.length; i++) {
    const chr = text.charCodeAt(i);
    hash = ((hash << 5) - hash) + chr;
    hash |= 0;
  }
  return "fallback_" + Math.abs(hash).toString(16);
}

// ========================================================
// 1. OWNER AUTHENTICATION & MANAGEMENT
// ========================================================

// Initial temporary owner password hash for "LPUcart#Owner2026"
const DEFAULT_OWNER_HASH = "0525ebddbaaf66fd586c06c1905dcd2b7d20605130c229207d8143bf0a141c4b";

function initOwnerAuthIfMissing() {
  const existing = SafeStore.get(STORAGE_KEYS.OWNER_AUTH, null);
  if (!existing) {
    SafeStore.set(STORAGE_KEYS.OWNER_AUTH, {
      username: "owner",
      passwordHash: DEFAULT_OWNER_HASH,
      mustChangePassword: true,
      updatedAt: new Date().toISOString()
    });
  }
}
initOwnerAuthIfMissing();

const LOCKOUT_THRESHOLD = 5;
const LOCKOUT_DURATION_MS = 5 * 60 * 1000; // 5 minutes
const SESSION_TIMEOUT_MS = 30 * 60 * 1000;  // 30 minutes

function checkOwnerLockout() {
  const lockout = SafeStore.get(STORAGE_KEYS.OWNER_LOCKOUT, { attempts: 0, lockedUntil: 0 });
  const now = Date.now();
  if (lockout.lockedUntil && now < lockout.lockedUntil) {
    const remainingSec = Math.ceil((lockout.lockedUntil - now) / 1000);
    const remainingMin = Math.ceil(remainingSec / 60);
    return { locked: true, message: `Account locked due to 5 failed attempts. Please wait ${remainingMin} minute(s).` };
  }
  return { locked: false };
}

function recordOwnerFailedAttempt() {
  const lockout = SafeStore.get(STORAGE_KEYS.OWNER_LOCKOUT, { attempts: 0, lockedUntil: 0 });
  lockout.attempts = (lockout.attempts || 0) + 1;
  if (lockout.attempts >= LOCKOUT_THRESHOLD) {
    lockout.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    lockout.attempts = 0;
  }
  SafeStore.set(STORAGE_KEYS.OWNER_LOCKOUT, lockout);
}

function clearOwnerLockout() {
  SafeStore.remove(STORAGE_KEYS.OWNER_LOCKOUT);
}

async function ownerLogin(username, password) {
  const lockoutCheck = checkOwnerLockout();
  if (lockoutCheck.locked) {
    return { success: false, error: lockoutCheck.message };
  }

  const auth = SafeStore.get(STORAGE_KEYS.OWNER_AUTH, null);
  if (!auth) {
    return { success: false, error: "Authentication system not initialized." };
  }

  const cleanUser = (username || "").trim();
  const allowedUsers = [auth.username.toLowerCase(), "owner", "admin"];
  if (!allowedUsers.includes(cleanUser.toLowerCase())) {
    recordOwnerFailedAttempt();
    return { success: false, error: "Invalid username or password." };
  }

  const inputHash = await sha256(password);
  if (inputHash !== auth.passwordHash) {
    recordOwnerFailedAttempt();
    return { success: false, error: "Invalid username or password." };
  }

  // Login successful
  clearOwnerLockout();
  const session = {
    username: auth.username,
    role: "owner",
    mustChangePassword: !!auth.mustChangePassword,
    loginTime: Date.now(),
    lastActive: Date.now()
  };
  SafeSession.set(SESSION_KEYS.OWNER_SESSION, session);

  return {
    success: true,
    mustChangePassword: !!auth.mustChangePassword,
    session
  };
}

function getOwnerSession() {
  const session = SafeSession.get(SESSION_KEYS.OWNER_SESSION, null);
  if (!session) return null;

  const now = Date.now();
  if (now - session.lastActive > SESSION_TIMEOUT_MS) {
    SafeSession.remove(SESSION_KEYS.OWNER_SESSION);
    return null; // Expired
  }

  // Update activity timestamp
  session.lastActive = now;
  SafeSession.set(SESSION_KEYS.OWNER_SESSION, session);
  return session;
}

function ownerLogout() {
  SafeSession.remove(SESSION_KEYS.OWNER_SESSION);
}

async function ownerChangePassword(currentPassword, newPassword) {
  const auth = SafeStore.get(STORAGE_KEYS.OWNER_AUTH, null);
  if (!auth) return { success: false, error: "Owner account not found." };

  const currentHash = await sha256(currentPassword);
  if (currentHash !== auth.passwordHash) {
    return { success: false, error: "Current password does not match." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  const newHash = await sha256(newPassword);
  auth.passwordHash = newHash;
  auth.mustChangePassword = false;
  auth.updatedAt = new Date().toISOString();
  SafeStore.set(STORAGE_KEYS.OWNER_AUTH, auth);

  // Update session
  const session = getOwnerSession();
  if (session) {
    session.mustChangePassword = false;
    SafeSession.set(SESSION_KEYS.OWNER_SESSION, session);
  }

  return { success: true, message: "Password updated successfully!" };
}

// ========================================================
// 2. DELIVERY PARTNERS MANAGEMENT & AUTHENTICATION
// ========================================================

function getPartners() {
  const partners = SafeStore.get(STORAGE_KEYS.PARTNERS, []);
  return Array.isArray(partners) ? partners : [];
}

async function addPartner({ name, phone, username, password }) {
  const partners = getPartners();
  const cleanUser = (username || phone || "").trim().toLowerCase();

  if (partners.some(p => p.username.toLowerCase() === cleanUser)) {
    return { success: false, error: "Username already exists. Please choose a different one." };
  }

  const id = "PARTNER-" + Math.floor(1000 + Math.random() * 9000);
  const passwordHash = await sha256(password);

  const newPartner = {
    id,
    name: name.trim(),
    phone: phone.trim(),
    username: cleanUser,
    passwordHash,
    status: "Active", // "Active" | "Disabled"
    mustChangePassword: true,
    deliveriesDone: 0,
    totalEarnings: 0,
    rating: 5.0,
    createdAt: new Date().toISOString()
  };

  partners.push(newPartner);
  SafeStore.set(STORAGE_KEYS.PARTNERS, partners);

  return {
    success: true,
    partner: newPartner,
    tempPassword: password
  };
}

function updatePartnerStatus(partnerId, newStatus) {
  const partners = getPartners();
  const partner = partners.find(p => p.id === partnerId);
  if (!partner) return false;

  if (typeof newStatus === "boolean") {
    partner.status = newStatus ? "Active" : "Disabled";
  } else {
    partner.status = newStatus; // "Active" or "Disabled"
  }
  SafeStore.set(STORAGE_KEYS.PARTNERS, partners);
  return true;
}

async function resetPartnerPassword(partnerId, newTempPassword) {
  const partners = getPartners();
  const partner = partners.find(p => p.id === partnerId);
  if (!partner) return { success: false, error: "Partner not found." };

  partner.passwordHash = await sha256(newTempPassword);
  partner.mustChangePassword = true;
  SafeStore.set(STORAGE_KEYS.PARTNERS, partners);

  return { success: true, partner, tempPassword: newTempPassword };
}

function deletePartner(partnerId) {
  let partners = getPartners();
  partners = partners.filter(p => p.id !== partnerId);
  SafeStore.set(STORAGE_KEYS.PARTNERS, partners);
  return true;
}

function checkPartnerLockout(username) {
  const key = (username || "").trim().toLowerCase();
  const allLockouts = SafeStore.get(STORAGE_KEYS.PARTNER_LOCKOUT, {});
  const lockout = allLockouts[key] || { attempts: 0, lockedUntil: 0 };
  const now = Date.now();

  if (lockout.lockedUntil && now < lockout.lockedUntil) {
    const remainingMin = Math.ceil((lockout.lockedUntil - now) / 60000);
    return { locked: true, message: `Account locked due to 5 failed attempts. Please wait ${remainingMin} minute(s).` };
  }
  return { locked: false };
}

function recordPartnerFailedAttempt(username) {
  const key = (username || "").trim().toLowerCase();
  const allLockouts = SafeStore.get(STORAGE_KEYS.PARTNER_LOCKOUT, {});
  const lockout = allLockouts[key] || { attempts: 0, lockedUntil: 0 };

  lockout.attempts = (lockout.attempts || 0) + 1;
  if (lockout.attempts >= LOCKOUT_THRESHOLD) {
    lockout.lockedUntil = Date.now() + LOCKOUT_DURATION_MS;
    lockout.attempts = 0;
  }
  allLockouts[key] = lockout;
  SafeStore.set(STORAGE_KEYS.PARTNER_LOCKOUT, allLockouts);
}

function clearPartnerLockout(username) {
  const key = (username || "").trim().toLowerCase();
  const allLockouts = SafeStore.get(STORAGE_KEYS.PARTNER_LOCKOUT, {});
  delete allLockouts[key];
  SafeStore.set(STORAGE_KEYS.PARTNER_LOCKOUT, allLockouts);
}

async function partnerLogin(username, password) {
  const cleanUser = (username || "").trim().toLowerCase();
  const lockoutCheck = checkPartnerLockout(cleanUser);
  if (lockoutCheck.locked) {
    return { success: false, error: lockoutCheck.message };
  }

  const partners = getPartners();
  const partner = partners.find(p => p.username.toLowerCase() === cleanUser);

  if (!partner) {
    recordPartnerFailedAttempt(cleanUser);
    return { success: false, error: "Invalid username or password." };
  }

  if (partner.status === "Disabled") {
    return { success: false, error: "Your delivery partner account has been disabled. Please contact the owner." };
  }

  const inputHash = await sha256(password);
  if (inputHash !== partner.passwordHash) {
    recordPartnerFailedAttempt(cleanUser);
    return { success: false, error: "Invalid username or password." };
  }

  clearPartnerLockout(cleanUser);
  const session = {
    partnerId: partner.id,
    name: partner.name,
    username: partner.username,
    role: "partner",
    mustChangePassword: !!partner.mustChangePassword,
    loginTime: Date.now(),
    lastActive: Date.now()
  };
  SafeSession.set(SESSION_KEYS.PARTNER_SESSION, session);

  return {
    success: true,
    mustChangePassword: !!partner.mustChangePassword,
    partner,
    session
  };
}

function getPartnerSession() {
  const session = SafeSession.get(SESSION_KEYS.PARTNER_SESSION, null);
  if (!session) return null;

  const now = Date.now();
  if (now - session.lastActive > SESSION_TIMEOUT_MS) {
    SafeSession.remove(SESSION_KEYS.PARTNER_SESSION);
    return null;
  }

  session.lastActive = now;
  SafeSession.set(SESSION_KEYS.PARTNER_SESSION, session);
  return session;
}

function partnerLogout() {
  SafeSession.remove(SESSION_KEYS.PARTNER_SESSION);
}

async function partnerChangePassword(partnerId, currentPassword, newPassword) {
  const partners = getPartners();
  const partner = partners.find(p => p.id === partnerId);
  if (!partner) return { success: false, error: "Partner account not found." };

  const currentHash = await sha256(currentPassword);
  if (currentHash !== partner.passwordHash) {
    return { success: false, error: "Current password does not match." };
  }

  if (!newPassword || newPassword.length < 6) {
    return { success: false, error: "New password must be at least 6 characters long." };
  }

  partner.passwordHash = await sha256(newPassword);
  partner.mustChangePassword = false;
  SafeStore.set(STORAGE_KEYS.PARTNERS, partners);

  // Update session
  const session = getPartnerSession();
  if (session) {
    session.mustChangePassword = false;
    SafeSession.set(SESSION_KEYS.PARTNER_SESSION, session);
  }

  return { success: true, message: "Password updated successfully!" };
}

// ========================================================
// 3. ORDERS MANAGEMENT & LIFECYCLE
// ========================================================

/**
 * Generate a random 4-digit OTP for secure parcel handover.
 */
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate an Order Reference ID (e.g. LPU-4921)
 */
function generateOrderId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LPU-${num}`;
}

/**
 * Get all orders from storage. Initially EMPTY (no fake demo orders!).
 */
function getOrders() {
  const orders = SafeStore.get(STORAGE_KEYS.ORDERS, []);
  return Array.isArray(orders) ? orders : [];
}

/**
 * Get a single order by ID
 */
function getOrderById(id) {
  if (!id) return null;
  const searchId = id.trim().toUpperCase();
  const orders = getOrders();
  return orders.find(o => (o.id && o.id.toUpperCase() === searchId) || (o.trackingId && o.trackingId.toUpperCase() === searchId)) || null;
}

/**
 * Create a new order placed by a student.
 */
function createOrder(orderData) {
  const orders = getOrders();
  const newId = generateOrderId();
  const otp = generateOTP();

  const fullOrder = {
    id: newId,
    otp: otp,
    name: orderData.name ? orderData.name.trim() : "Student",
    phone: orderData.phone ? orderData.phone.trim() : "",
    hostelBlock: orderData.hostelBlock ? orderData.hostelBlock.trim() : "Boys Hostel 1",
    roomNo: orderData.roomNo ? orderData.roomNo.trim() : "Room",
    trackingId: orderData.trackingId ? orderData.trackingId.trim() : "N/A",
    parcels: parseInt(orderData.parcels, 10) || 1,
    deliveryType: orderData.deliveryType || "gate",
    timeSlot: orderData.timeSlot || "10:00 AM - 12:00 PM (Morning Slot)",
    photoUrl: orderData.photoUrl || "",
    paymentMethod: orderData.paymentMethod || "UPI",
    paymentStatus: orderData.paymentMethod === "COD" ? "Pay on Delivery" : "Paid",
    coupon: orderData.coupon || "",
    priceBreakdown: orderData.priceBreakdown || { basePrice: 11, roomExtra: 0, subtotal: 11, discount: 0, total: 11 },
    liveLocation: orderData.liveLocation || null,
    partnerId: null,
    partnerName: null,
    partnerPhone: null,
    status: "Placed", // Placed -> Assigned -> Picked -> On the way -> Delivered -> Confirmed
    statusHistory: [
      {
        status: "Placed",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today",
        note: "Order placed by student. Awaiting partner assignment."
      }
    ],
    rating: 0,
    feedback: "",
    createdAt: new Date().toISOString()
  };

  orders.unshift(fullOrder);
  SafeStore.set(STORAGE_KEYS.ORDERS, orders);

  // Track that this order was created on this browser session for device privacy
  const myOrders = SafeStore.get(STORAGE_KEYS.MY_ORDERS, []);
  if (!myOrders.includes(newId)) {
    myOrders.unshift(newId);
    SafeStore.set(STORAGE_KEYS.MY_ORDERS, myOrders);
  }

  return fullOrder;
}

/**
 * Assign an order to a delivery partner (Owner action)
 */
function assignOrder(orderId, partnerId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return { success: false, error: "Order not found." };

  const partners = getPartners();
  const partner = partners.find(p => p.id === partnerId);
  if (!partner) return { success: false, error: "Partner not found." };

  order.partnerId = partner.id;
  order.partnerName = partner.name;
  order.partnerPhone = partner.phone;
  order.status = "Assigned";

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today";
  order.statusHistory.push({
    status: "Assigned",
    time: timeStr,
    note: `Assigned to delivery runner ${partner.name}.`
  });

  SafeStore.set(STORAGE_KEYS.ORDERS, orders);
  return { success: true, order };
}

/**
 * Delivery partner updates order status (Assigned -> Picked -> On the way -> Delivered)
 */
function updatePartnerOrderStatus(orderId, newStatus, otpInput, partnerId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return { success: false, message: "Order not found." };

  // Partner must be assigned to this order
  if (order.partnerId !== partnerId) {
    return { success: false, message: "You are not assigned to this order." };
  }

  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today";

  if (newStatus === "Delivered") {
    if (!otpInput || otpInput.trim() !== order.otp) {
      return {
        success: false,
        message: "Incorrect OTP! Please ask the student for their 4-digit verification code."
      };
    }

    order.status = "Delivered";
    order.paymentStatus = "Paid";
    order.statusHistory.push({
      status: "Delivered",
      time: timeStr,
      note: "4-Digit OTP verified. Handed over to student. Waiting for owner confirmation."
    });

    // Increment partner's completed deliveries
    const partners = getPartners();
    const partner = partners.find(p => p.id === partnerId);
    if (partner) {
      partner.deliveriesDone = (partner.deliveriesDone || 0) + 1;
      SafeStore.set(STORAGE_KEYS.PARTNERS, partners);
    }

    SafeStore.set(STORAGE_KEYS.ORDERS, orders);
    return { success: true, message: "Delivery verified with OTP! Waiting for owner confirmation.", order };
  }

  // Other statuses: Picked or On the way
  order.status = newStatus;
  let note = `Status updated to ${newStatus}`;
  if (newStatus === "Picked") note = `Parcel collected from Uni Mall by ${order.partnerName || "runner"}.`;
  if (newStatus === "On the way") note = `Runner is on the way to ${order.hostelBlock}.`;

  order.statusHistory.push({ status: newStatus, time: timeStr, note });
  SafeStore.set(STORAGE_KEYS.ORDERS, orders);

  return { success: true, message: `Status updated to ${newStatus}`, order };
}

/**
 * Owner confirms delivery (Delivered -> Confirmed)
 */
function confirmDelivery(orderId) {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return { success: false, error: "Order not found." };

  order.status = "Confirmed";
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today";
  order.statusHistory.push({
    status: "Confirmed",
    time: timeStr,
    note: "Delivery verified and officially confirmed by owner."
  });

  SafeStore.set(STORAGE_KEYS.ORDERS, orders);
  return { success: true, order };
}

// ========================================================
// 4. STUDENT PRIVACY & VERIFIED TRACK ACCESS (PART E)
// ========================================================

/**
 * Verified Tracking for Students:
 * Requires Order/Tracking ID AND the last 4 digits of the phone number used for the order.
 * If authorized, shows sanitized details. Never leaks other students' personal data.
 */
function verifyTrackAccess(orderIdInput, phoneLast4Input) {
  if (!orderIdInput) return { success: false, error: "Please enter your Order ID or Courier Reference." };

  const order = getOrderById(orderIdInput);
  if (!order) {
    return { success: false, error: "Order not found. Please check your Order ID." };
  }

  // Check last 4 digits of phone (Strict Verification: PART E.1)
  const cleanLast4 = (phoneLast4Input || "").replace(/[^0-9]/g, "");
  const orderPhoneClean = (order.phone || "").replace(/[^0-9]/g, "");

  const matchesPhone = cleanLast4.length === 4 && orderPhoneClean.endsWith(cleanLast4);

  if (!matchesPhone) {
    return {
      success: false,
      error: "Order not found. Please verify the Order ID and the last 4 digits of the phone number used."
    };
  }

  // Return sanitized object preserving privacy
  const runnerFirstName = order.partnerName ? order.partnerName.split(" ")[0] : "Assigned Partner";

  return {
    success: true,
    order: {
      id: order.id,
      trackingId: order.trackingId,
      status: order.status,
      statusHistory: order.statusHistory || [],
      parcels: order.parcels,
      deliveryType: order.deliveryType,
      timeSlot: order.timeSlot,
      hostelBlock: order.hostelBlock,
      runnerFirstName,
      runnerPhone: order.partnerPhone || (window.OWNER_CONFIG ? window.OWNER_CONFIG.OWNER_PHONE : "919680040551"),
      otp: order.otp, // Authorized recipient sees OTP
      priceBreakdown: order.priceBreakdown,
      paymentStatus: order.paymentStatus,
      paymentMethod: order.paymentMethod,
      liveLocation: order.liveLocation,
      rating: order.rating || 0,
      createdAt: order.createdAt
    }
  };
}

/**
 * Return only orders placed from this browser device.
 */
function getMyOrders() {
  const myOrderIds = SafeStore.get(STORAGE_KEYS.MY_ORDERS, []);
  const allOrders = getOrders();
  return allOrders.filter(o => myOrderIds.includes(o.id));
}

function rateOrder(orderId, rating, feedback = "") {
  const orders = getOrders();
  const order = orders.find(o => o.id === orderId);
  if (!order) return false;

  order.rating = rating;
  order.feedback = feedback.trim();
  SafeStore.set(STORAGE_KEYS.ORDERS, orders);
  return true;
}

// ========================================================
// 5. CONTACT MESSAGES (LOCALLY STORED FOR DEMO)
// ========================================================

function saveContactMessage(name, phone, hostel, msg) {
  const messages = SafeStore.get(STORAGE_KEYS.MESSAGES, []);
  const newMsg = {
    id: "MSG-" + Math.floor(1000 + Math.random() * 9000),
    name: name.trim(),
    phone: phone.trim(),
    hostel: hostel.trim(),
    message: msg.trim(),
    createdAt: new Date().toISOString()
  };
  messages.unshift(newMsg);
  SafeStore.set(STORAGE_KEYS.MESSAGES, messages);
  return newMsg;
}

function getContactMessages() {
  const msgs = SafeStore.get(STORAGE_KEYS.MESSAGES, []);
  return Array.isArray(msgs) ? msgs : [];
}

function deleteContactMessage(id) {
  let msgs = getContactMessages();
  msgs = msgs.filter(m => m.id !== id);
  SafeStore.set(STORAGE_KEYS.MESSAGES, msgs);
  return true;
}

// ========================================================
// 6. OWNER DASHBOARD ANALYTICS & STATS
// ========================================================

function getOwnerStats() {
  const orders = getOrders();
  const todayStr = new Date().toDateString();

  let todayOrdersCount = 0;
  let totalEarnings = 0;
  const statusCounts = {
    Placed: 0,
    Assigned: 0,
    Picked: 0,
    "On the way": 0,
    Delivered: 0,
    Confirmed: 0
  };
  const typeCounts = {
    gate: 0,
    room: 0,
    live: 0
  };

  orders.forEach(o => {
    const orderDate = new Date(o.createdAt).toDateString();
    if (orderDate === todayStr) {
      todayOrdersCount++;
    }

    if (o.status === "Delivered" || o.status === "Confirmed") {
      const amt = (o.priceBreakdown && typeof o.priceBreakdown.total === "number") ? o.priceBreakdown.total : 0;
      totalEarnings += amt;
    }

    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    }

    if (o.deliveryType && typeCounts[o.deliveryType] !== undefined) {
      typeCounts[o.deliveryType]++;
    }
  });

  const partners = getPartners();
  const activePartnersCount = partners.filter(p => p.status === "Active").length;

  return {
    totalOrders: orders.length,
    todayOrdersCount,
    totalEarnings,
    statusCounts,
    typeCounts,
    totalPartners: partners.length,
    activePartnersCount
  };
}

// Backwards-compatible alias for admin script
function getAdminStats() {
  return getOwnerStats();
}

// Reset data helper
function resetAllData() {
  SafeStore.remove(STORAGE_KEYS.ORDERS);
  SafeStore.remove(STORAGE_KEYS.MY_ORDERS);
  SafeStore.remove(STORAGE_KEYS.MESSAGES);
  return true;
}

// Backwards-compatible dummy helpers
function buyWeeklyPass() {
  const pass = { active: true, remaining: 10, total: 10, price: 99, purchasedAt: new Date().toISOString() };
  SafeStore.set(STORAGE_KEYS.WEEKLY_PASS, pass);
  return pass;
}

function getWeeklyPass() {
  return SafeStore.get(STORAGE_KEYS.WEEKLY_PASS, null);
}

// Export module globally
window.LPU_STORAGE = {
  SafeStore,
  SafeSession,
  STORAGE_KEYS,
  sha256,
  // Owner Auth
  ownerLogin,
  getOwnerSession,
  ownerLogout,
  ownerChangePassword,
  getOwnerStats,
  getAdminStats,
  // Partners
  getPartners,
  addPartner,
  updatePartnerStatus,
  resetPartnerPassword,
  deletePartner,
  partnerLogin,
  getPartnerSession,
  partnerLogout,
  partnerChangePassword,
  // Orders
  getOrders,
  getOrderById,
  createOrder,
  assignOrder,
  updatePartnerOrderStatus,
  confirmDelivery,
  rateOrder,
  // Student Privacy
  verifyTrackAccess,
  getMyOrders,
  // Messages
  saveContactMessage,
  getContactMessages,
  deleteContactMessage,
  // Misc
  resetAllData,
  buyWeeklyPass,
  getWeeklyPass
};
