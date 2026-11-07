/**
 * LPUcart - Pricing & Delivery Calculations
 * ==========================================
 * Master pricing rules, coupon logic, and delivery fee calculation.
 * 
 * EXACT PRICING RULES:
 * - 1 parcel, Uni Mall to hostel gate: ₹11
 * - 2 or more parcels, Uni Mall to hostel gate: ₹22
 * - Delivery up to the room (extra): +₹10
 * - Delivery outside the hostel to student's live location: ₹19
 */

// 1. EXACT PRICING CONFIGURATION (Must stay exact)
const PRICES = {
  single: 11,   // 1 parcel, Uni Mall to hostel gate: ₹11
  multi: 22,    // 2 or more parcels, Uni Mall to hostel gate: ₹22
  room: 10,     // Delivery up to the room (extra): +₹10
  live: 19      // Delivery outside hostel to student's live location: ₹19
};

// 2. DELIVERY TIME SLOTS
const TIME_SLOTS = [
  "10:00 AM - 12:00 PM (Morning Slot)",
  "12:00 PM - 02:00 PM (Afternoon Slot)",
  "04:00 PM - 06:00 PM (Evening Slot 1)",
  "06:00 PM - 08:00 PM (Evening Slot 2)"
];

// 3. PROMO & COUPON CODES
const COUPONS = {
  "FIRST5": {
    code: "FIRST5",
    discount: 5,
    minOrder: 0,
    firstOrderOnly: true,
    description: "₹5 Instant Discount on your first order"
  },
  "CAMPUS10": {
    code: "CAMPUS10",
    discount: 10,
    minOrder: 20,
    firstOrderOnly: false,
    description: "₹10 Off on orders of ₹20 or more"
  },
  "LPUMALL": {
    code: "LPUMALL",
    discount: 11,
    minOrder: 22,
    firstOrderOnly: false,
    description: "₹11 Uni Mall Super Saver discount"
  }
};

// 4. WEEKLY PASS SUBSCRIPTION CONFIG
const WEEKLY_PASS_CONFIG = {
  title: "LPUcart Student Weekly Pass",
  price: 99,
  deliveriesAllowed: 10,
  validityDays: 7,
  badge: "Best Value for Regular Shoppers",
  description: "10 deliveries for Rs 99"
};

/**
 * Calculate order price breakdown based on user inputs.
 * 
 * Rules:
 * - If deliveryType === 'live': base rate is ₹19 (fixed live location).
 * - Otherwise:
 *     - If parcelCount === 1: ₹11
 *     - If parcelCount >= 2: ₹22
 *     - If deliveryType === 'room': add ₹10 room delivery charge.
 * - If weeklyPassCovered: delivery fee is waived (₹0) and marked as covered by pass.
 * - Coupon discount applied up to subtotal (cannot result in negative price).
 * - Guaranteed: Never returns NaN, negative, or blank total.
 * 
 * @param {Object} options
 * @param {number} options.parcels - Number of parcels
 * @param {string} options.deliveryType - 'gate' | 'room' | 'live'
 * @param {string} options.coupon - Coupon code (optional)
 * @param {boolean} options.useWeeklyPass - Whether user is using weekly pass credits
 * @param {boolean} options.isFirstOrder - Whether this is the user's first order
 * @returns {Object} Full breakdown of prices and final total
 */
function calculateOrderPrice({ parcels = 1, deliveryType = "gate", coupon = "", useWeeklyPass = false, isFirstOrder = true }) {
  // Normalize and sanitize parcel count (minimum 1, integer only)
  let count = parseInt(parcels, 10);
  if (isNaN(count) || count < 1) {
    count = 1;
  }

  // Normalize delivery type
  const normalizedType = (deliveryType === "room" || deliveryType === "live") ? deliveryType : "gate";

  let basePrice = 0;
  let roomExtra = 0;
  let calculationNote = "";

  if (normalizedType === "live") {
    // Delivery outside hostel to student's live location: ₹19 flat
    basePrice = PRICES.live;
    calculationNote = "Live Location delivery (outside hostel): ₹" + PRICES.live;
  } else {
    // Uni Mall to Hostel Gate
    if (count === 1) {
      basePrice = PRICES.single; // ₹11
      calculationNote = "1 Parcel to hostel gate: ₹" + PRICES.single;
    } else {
      basePrice = PRICES.multi; // ₹22
      calculationNote = count + " Parcels to hostel gate: ₹" + PRICES.multi;
    }

    // Room delivery extra
    if (normalizedType === "room") {
      roomExtra = PRICES.room; // +₹10
      calculationNote += " + Room delivery extra: ₹" + PRICES.room;
    }
  }

  const subtotal = Math.max(0, basePrice + roomExtra);

  // Handle Weekly Pass (Total becomes ₹0)
  if (useWeeklyPass) {
    return {
      parcelCount: count,
      deliveryType: normalizedType,
      basePrice: basePrice,
      roomExtra: roomExtra,
      subtotal: subtotal,
      discount: subtotal,
      couponDiscount: 0,
      couponApplied: null,
      weeklyPassCovered: true,
      total: 0,
      calculationNote: "Covered by Weekly Pass (1 credit used) - ₹0 Payable"
    };
  }

  // Handle Coupon Code
  let discount = 0;
  let couponApplied = null;
  const cleanCoupon = (coupon || "").trim().toUpperCase();

  if (cleanCoupon && COUPONS[cleanCoupon]) {
    const couponDef = COUPONS[cleanCoupon];
    // Check first-order restriction if applicable
    if (couponDef.firstOrderOnly && !isFirstOrder) {
      // Not applicable on subsequent orders
      couponApplied = null;
      discount = 0;
    } else if (subtotal >= couponDef.minOrder) {
      discount = Math.min(subtotal, couponDef.discount);
      couponApplied = couponDef;
      calculationNote += ` - Coupon ${cleanCoupon} discount: ₹${discount}`;
    }
  }

  // Final Total: strictly non-negative integer
  let finalTotal = Math.max(0, subtotal - discount);
  if (isNaN(finalTotal)) {
    finalTotal = 11;
  }

  return {
    parcelCount: count,
    deliveryType: normalizedType,
    basePrice: basePrice,
    roomExtra: roomExtra,
    subtotal: subtotal,
    discount: discount,
    couponApplied: couponApplied,
    weeklyPassCovered: false,
    total: finalTotal,
    calculationNote: calculationNote
  };
}

// Export to window for vanilla JS access across all pages
window.LPU_PRICING = {
  PRICES,
  TIME_SLOTS,
  COUPONS,
  WEEKLY_PASS_CONFIG,
  calculateOrderPrice
};
