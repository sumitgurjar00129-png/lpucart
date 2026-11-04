/**
 * LPUcart - Robust Data Storage & Business Logic (localStorage)
 * =============================================================
 * Safe, glitch-free storage manager with defensive error handling,
 * OTP verification, demo data seeding, and admin analytics.
 */

const STORAGE_KEYS = {
  ORDERS: "lpucart_orders",
  WEEKLY_PASS: "lpucart_weekly_pass",
  THEME: "lpucart_theme",
  DELIVERY_USER: "lpucart_delivery_user",
  ADMIN_USER: "lpucart_admin_user",
  CONTACT_MESSAGES: "lpucart_contact_messages",
  HAS_ORDERED: "lpucart_has_ordered"
};

// Defensive Storage Wrapper: Never crashes on private mode or quota errors
const SafeStore = {
  get: function(key, defaultValue = null) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined || raw === "") return defaultValue;
      return JSON.parse(raw);
    } catch (err) {
      console.warn(`SafeStore.get failed for [${key}]:`, err);
      return defaultValue;
    }
  },
  set: function(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (err) {
      console.warn(`SafeStore.set failed for [${key}]:`, err);
      return false;
    }
  },
  remove: function(key) {
    try {
      localStorage.removeItem(key);
      return true;
    } catch (err) {
      console.warn(`SafeStore.remove failed for [${key}]:`, err);
      return false;
    }
  }
};

// Demo Delivery Partner Profile & Credentials
const DEMO_DELIVERY_CREDS = {
  username: "deliveryboy",
  password: "lpu123",
  profile: {
    id: "DB-01",
    name: "Rahul Kumar",
    phone: "9876543210",
    vehicle: "Hero E-Scooter (PB-08-LP-1024)",
    rating: 4.9,
    completedDeliveries: 342,
    avatar: "/assets/delivery-avatar.svg"
  }
};

// Demo Admin Credentials
const DEMO_ADMIN_CREDS = {
  username: "admin",
  password: "admin123",
  role: "Campus Logistics Manager"
};

/**
 * Generate a random 4-digit OTP for secure parcel handover.
 */
function generateOTP() {
  return Math.floor(1000 + Math.random() * 9000).toString();
}

/**
 * Generate a clean Order Reference ID (e.g., LPU-4921)
 */
function generateOrderId() {
  const num = Math.floor(1000 + Math.random() * 9000);
  return `LPU-${num}`;
}

/**
 * Seed realistic initial demo data if localStorage is empty.
 * Uses the official HOSTELS list ("Boys Hostel 3", "Girls Hostel 11", etc.).
 */
function seedDemoDataIfEmpty() {
  const existingOrders = SafeStore.get(STORAGE_KEYS.ORDERS, null);
  
  // Seed only if no orders exist yet
  if (!existingOrders || !Array.isArray(existingOrders) || existingOrders.length === 0) {
    const demoOrders = [
      {
        id: "LPU-8842",
        otp: "5821",
        name: "Aman Verma",
        phone: "9876512340",
        hostelBlock: "Boys Hostel 3",
        roomNo: "412-B",
        trackingId: "AMZ-IN-8890214",
        parcels: 2,
        deliveryType: "room",
        timeSlot: "04:00 PM - 06:00 PM (Evening Slot 1)",
        photoUrl: "",
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        coupon: "FIRST5",
        priceBreakdown: {
          basePrice: 22,
          roomExtra: 10,
          subtotal: 32,
          discount: 5,
          total: 27,
          calculationNote: "2 Parcels to hostel gate: ₹22 + Room delivery extra: ₹10 - Coupon ₹5"
        },
        liveLocation: null,
        status: "On the way",
        statusHistory: [
          { status: "Placed", time: "03:15 PM, Today", note: "Order placed by student" },
          { status: "Picked", time: "03:45 PM, Today", note: "Parcel picked from Uni Mall by Rahul Kumar" },
          { status: "On the way", time: "04:10 PM, Today", note: "Out for delivery near Boys Hostel 3 gate" }
        ],
        deliveryBoy: DEMO_DELIVERY_CREDS.profile,
        rating: 0,
        feedback: "",
        createdAt: new Date(Date.now() - 45 * 60 * 1000).toISOString()
      },
      {
        id: "LPU-8710",
        otp: "3490",
        name: "Pooja Sharma",
        phone: "9812345678",
        hostelBlock: "Girls Hostel 11",
        roomNo: "N/A (Live Location)",
        trackingId: "FK-77123901",
        parcels: 1,
        deliveryType: "live",
        timeSlot: "12:00 PM - 02:00 PM (Afternoon Slot)",
        photoUrl: "",
        paymentMethod: "COD",
        paymentStatus: "Pay on Delivery",
        coupon: "",
        priceBreakdown: {
          basePrice: 19,
          roomExtra: 0,
          subtotal: 19,
          discount: 0,
          total: 19,
          calculationNote: "Live Location delivery (outside hostel): ₹19"
        },
        liveLocation: {
          latitude: 31.2536,
          longitude: 75.7032,
          mapsUrl: "https://www.google.com/maps?q=31.2536,75.7032"
        },
        status: "Picked",
        statusHistory: [
          { status: "Placed", time: "01:20 PM, Today", note: "Order placed by student" },
          { status: "Picked", time: "01:50 PM, Today", note: "Picked up from Uni Mall Desk #3" }
        ],
        deliveryBoy: DEMO_DELIVERY_CREDS.profile,
        rating: 0,
        feedback: "",
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "LPU-7650",
        otp: "8914",
        name: "Rohan Kapoor",
        phone: "9789012345",
        hostelBlock: "Boys Hostel 1",
        roomNo: "201",
        trackingId: "MYN-998122",
        parcels: 1,
        deliveryType: "gate",
        timeSlot: "10:00 AM - 12:00 PM (Morning Slot)",
        photoUrl: "",
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        coupon: "",
        priceBreakdown: {
          basePrice: 11,
          roomExtra: 0,
          subtotal: 11,
          discount: 0,
          total: 11,
          calculationNote: "1 Parcel to hostel gate: ₹11"
        },
        liveLocation: null,
        status: "Delivered",
        statusHistory: [
          { status: "Placed", time: "09:30 AM, Yesterday", note: "Order placed" },
          { status: "Picked", time: "10:15 AM, Yesterday", note: "Picked from Uni Mall" },
          { status: "On the way", time: "10:40 AM, Yesterday", note: "En route to Boys Hostel 1" },
          { status: "Delivered", time: "11:05 AM, Yesterday", note: "Handed over safely with OTP verification" }
        ],
        deliveryBoy: DEMO_DELIVERY_CREDS.profile,
        rating: 5,
        feedback: "Super fast delivery! Saved me from walking to Uni Mall in the sun.",
        createdAt: new Date(Date.now() - 26 * 60 * 60 * 1000).toISOString()
      },
      {
        id: "LPU-6512",
        otp: "7128",
        name: "Dr. Vikram Singh",
        phone: "9872112233",
        hostelBlock: "Uni-Hotel & Faculty Apartments",
        roomNo: "Suite 304",
        trackingId: "BLUEDART-882190",
        parcels: 3,
        deliveryType: "room",
        timeSlot: "12:00 PM - 02:00 PM (Afternoon Slot)",
        photoUrl: "",
        paymentMethod: "UPI",
        paymentStatus: "Paid",
        coupon: "CAMPUS10",
        priceBreakdown: {
          basePrice: 22,
          roomExtra: 10,
          subtotal: 32,
          discount: 10,
          total: 22,
          calculationNote: "3 Parcels to gate: ₹22 + Room extra: ₹10 - Coupon ₹10 = ₹22"
        },
        liveLocation: null,
        status: "Delivered",
        statusHistory: [
          { status: "Placed", time: "11:00 AM, 2 days ago", note: "Order placed" },
          { status: "Picked", time: "11:30 AM, 2 days ago", note: "Picked from Uni Mall" },
          { status: "Delivered", time: "12:15 PM, 2 days ago", note: "Delivered with OTP verification" }
        ],
        deliveryBoy: DEMO_DELIVERY_CREDS.profile,
        rating: 5,
        feedback: "Very convenient for staff apartments.",
        createdAt: new Date(Date.now() - 50 * 60 * 60 * 1000).toISOString()
      }
    ];
    SafeStore.set(STORAGE_KEYS.ORDERS, demoOrders);
  }

  // Seed default Weekly pass state if not set
  if (!SafeStore.get(STORAGE_KEYS.WEEKLY_PASS, null)) {
    const defaultPass = {
      active: true,
      remaining: 7,
      total: 10,
      price: 99,
      purchasedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
      expiresAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString()
    };
    SafeStore.set(STORAGE_KEYS.WEEKLY_PASS, defaultPass);
  }
}

// Automatically seed on evaluation
seedDemoDataIfEmpty();

/**
 * Get all orders from storage (latest first).
 */
function getOrders() {
  const orders = SafeStore.get(STORAGE_KEYS.ORDERS, []);
  return Array.isArray(orders) ? orders : [];
}

/**
 * Get a single order by ID (case-insensitive).
 */
function getOrderById(id) {
  if (!id) return null;
  const orders = getOrders();
  const searchId = id.trim().toUpperCase();
  return orders.find(o => o.id && o.id.toUpperCase() === searchId) || null;
}

/**
 * Save a new order to storage.
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
    priceBreakdown: orderData.priceBreakdown || {},
    liveLocation: orderData.liveLocation || null,
    status: "Placed", // Initial status: Placed, waiting for runner to pick at Uni Mall
    statusHistory: [
      {
        status: "Placed",
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today",
        note: "Order placed by student. Ready for Uni Mall pickup."
      }
    ],
    deliveryBoy: DEMO_DELIVERY_CREDS.profile,
    rating: 0,
    feedback: "",
    createdAt: new Date().toISOString()
  };

  // If weekly pass was used, decrement credits
  if (orderData.useWeeklyPass) {
    useWeeklyPassCredit();
  }

  // Mark user as having ordered
  SafeStore.set(STORAGE_KEYS.HAS_ORDERED, "true");

  orders.unshift(fullOrder);
  SafeStore.set(STORAGE_KEYS.ORDERS, orders);
  return fullOrder;
}

/**
 * Update an order's status (Placed -> Picked -> On the way -> Delivered).
 * If newStatus === 'Delivered', the correct 4-digit OTP is mandatory!
 */
function updateOrderStatus(orderId, newStatus, enteredOtp = null) {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) {
    return { success: false, message: "Order not found." };
  }

  const order = orders[index];

  // If status is Delivered, verify 4-digit OTP
  if (newStatus === "Delivered") {
    if (!enteredOtp || enteredOtp.trim() !== String(order.otp).trim()) {
      return {
        success: false,
        message: `Incorrect OTP! Expected 4-digit code provided to ${order.name}. Handover cannot be completed.`
      };
    }
    order.paymentStatus = "Paid"; // Marked paid upon successful OTP verified delivery
  }

  order.status = newStatus;
  const timeStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) + ", Today";
  
  let note = `Status changed to ${newStatus}`;
  if (newStatus === "Picked") note = "Picked up from Uni Mall Desk #3 by " + (order.deliveryBoy ? order.deliveryBoy.name : "runner");
  if (newStatus === "On the way") note = "Runner is en route to " + order.hostelBlock;
  if (newStatus === "Delivered") note = "Verified with 4-digit OTP and safely delivered.";

  if (!Array.isArray(order.statusHistory)) {
    order.statusHistory = [];
  }

  order.statusHistory.push({
    status: newStatus,
    time: timeStr,
    note: note
  });

  orders[index] = order;
  SafeStore.set(STORAGE_KEYS.ORDERS, orders);
  return { success: true, message: `Status updated to "${newStatus}"!`, order: order };
}

/**
 * Submit star rating and review for an order.
 */
function rateOrder(orderId, rating, feedbackText = "") {
  const orders = getOrders();
  const index = orders.findIndex(o => o.id === orderId);
  if (index === -1) return false;

  orders[index].rating = Math.min(5, Math.max(1, parseInt(rating, 10) || 5));
  orders[index].feedback = (feedbackText || "").trim();
  SafeStore.set(STORAGE_KEYS.ORDERS, orders);
  return true;
}

/**
 * Weekly Pass operations
 */
function getWeeklyPass() {
  const pass = SafeStore.get(STORAGE_KEYS.WEEKLY_PASS, null);
  if (!pass) return { active: false, remaining: 0 };
  const isExpired = new Date(pass.expiresAt) < new Date();
  if (isExpired || pass.remaining <= 0) {
    pass.active = false;
  }
  return pass;
}

function buyWeeklyPass() {
  const newPass = {
    active: true,
    remaining: 10,
    total: 10,
    price: 99,
    purchasedAt: new Date().toISOString(),
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
  };
  SafeStore.set(STORAGE_KEYS.WEEKLY_PASS, newPass);
  return newPass;
}

function useWeeklyPassCredit() {
  const pass = getWeeklyPass();
  if (pass.active && pass.remaining > 0) {
    pass.remaining -= 1;
    if (pass.remaining === 0) {
      pass.active = false;
    }
    SafeStore.set(STORAGE_KEYS.WEEKLY_PASS, pass);
    return true;
  }
  return false;
}

/**
 * Contact Message storage
 */
function saveContactMessage(name, phone, hostel, message) {
  const existing = SafeStore.get(STORAGE_KEYS.CONTACT_MESSAGES, []);
  existing.unshift({
    id: "MSG-" + Date.now(),
    name: (name || "").trim(),
    phone: (phone || "").trim(),
    hostel: (hostel || "").trim(),
    message: (message || "").trim(),
    time: new Date().toLocaleString()
  });
  SafeStore.set(STORAGE_KEYS.CONTACT_MESSAGES, existing);
  return true;
}

/**
 * Check if current user is placing their first order
 */
function isUserFirstOrder(phone = "") {
  const orders = getOrders();
  if (!orders || orders.length === 0) return true;
  if (phone && phone.trim()) {
    const cleanPhone = phone.trim();
    return !orders.some(o => o.phone && o.phone.trim() === cleanPhone);
  }
  const flag = SafeStore.get(STORAGE_KEYS.HAS_ORDERED, null);
  return !flag;
}

/**
 * Admin Statistics Calculation
 */
function getAdminStats() {
  const orders = getOrders();
  const todayStr = new Date().toDateString();

  let totalEarnings = 0;
  let todayOrdersCount = 0;
  let statusCounts = {
    Placed: 0,
    Picked: 0,
    "On the way": 0,
    Delivered: 0
  };
  let typeCounts = {
    gate: 0,
    room: 0,
    live: 0
  };
  let hostelCategoryCounts = {
    boys: 0,
    girls: 0,
    other: 0
  };
  let totalRatingSum = 0;
  let ratedCount = 0;

  orders.forEach(o => {
    totalEarnings += (o.priceBreakdown && o.priceBreakdown.total !== undefined) ? o.priceBreakdown.total : 11;
    
    // Check if created today
    const orderDate = new Date(o.createdAt).toDateString();
    if (orderDate === todayStr) {
      todayOrdersCount++;
    }

    // Status tally
    if (statusCounts[o.status] !== undefined) {
      statusCounts[o.status]++;
    } else {
      statusCounts[o.status] = 1;
    }

    // Delivery Type tally
    const dtype = o.deliveryType || "gate";
    if (typeCounts[dtype] !== undefined) {
      typeCounts[dtype]++;
    }

    // Hostel Category tally
    const cat = window.getHostelCategory ? window.getHostelCategory(o.hostelBlock) : "other";
    if (hostelCategoryCounts[cat] !== undefined) {
      hostelCategoryCounts[cat]++;
    } else {
      hostelCategoryCounts.other++;
    }

    // Rating tally
    if (o.rating && o.rating > 0) {
      totalRatingSum += o.rating;
      ratedCount++;
    }
  });

  const avgRating = ratedCount > 0 ? (totalRatingSum / ratedCount).toFixed(1) : "4.9";
  const pass = getWeeklyPass();

  return {
    totalOrders: orders.length,
    todayOrdersCount,
    totalEarnings,
    statusCounts,
    typeCounts,
    hostelCategoryCounts,
    avgRating,
    ratedCount,
    weeklyPassRemaining: pass.remaining,
    weeklyPassActive: pass.active
  };
}

// Global Export
window.LPU_STORAGE = {
  STORAGE_KEYS,
  SafeStore,
  DEMO_DELIVERY_CREDS,
  DEMO_ADMIN_CREDS,
  generateOTP,
  generateOrderId,
  getOrders,
  getOrderById,
  createOrder,
  updateOrderStatus,
  rateOrder,
  getWeeklyPass,
  buyWeeklyPass,
  useWeeklyPassCredit,
  saveContactMessage,
  isUserFirstOrder,
  getAdminStats,
  resetDemoData: function() {
    SafeStore.remove(STORAGE_KEYS.ORDERS);
    SafeStore.remove(STORAGE_KEYS.WEEKLY_PASS);
    SafeStore.remove(STORAGE_KEYS.HAS_ORDERED);
    seedDemoDataIfEmpty();
    return true;
  }
};
