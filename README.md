# 📦 LPUcart - 3D Campus Parcel Delivery Service

> **LPUcart** is an interactive, modern, multi-page 3D website built for university hostel students. It connects online shopping parcel pickups at **Uni Mall** (Amazon, Flipkart, Myntra, etc.) directly to student hostels, rooms, or live GPS campus coordinates.

Built with **pure HTML5, CSS3 3D transforms, vanilla JavaScript, and Three.js (via CDN)**. No frameworks, no external build tools, and no backend needed. All data persists client-side in `localStorage`.

---

## 🚀 How to Run the Website

You can run LPUcart simply by opening `index.html` in any modern web browser:

### Option 1: Direct File Open
Double click `index.html` or drag and drop it into Google Chrome, Microsoft Edge, Safari, or Firefox.

### Option 2: Using VS Code Live Server
1. Open the `cse326project` folder in Visual Studio Code.
2. Right-click `index.html` and click **"Open with Live Server"**.

### Option 3: Python Built-in Server (Terminal)
Open your terminal inside this directory and run:
```bash
python3 -m http.server 8000
```
Then visit: `http://localhost:8000` in your browser.

---

## ⚙️ Configuration Guide (Where to Change Prices, Blocks, Slots & Logins)

All configurable business rules, rates, locations, and demo credentials are placed cleanly at the top of their respective JavaScript files with clear comments:

### 1. Change Delivery Prices
File: [`js/pricing.js`](js/pricing.js)
```javascript
const PRICES = {
  single: 11,   // 1 parcel, Uni Mall to hostel gate: ₹11
  multi: 22,    // 2 or more parcels, Uni Mall to hostel gate: ₹22
  room: 10,     // Delivery up to the room (extra): +₹10
  live: 19      // Delivery outside hostel to student's live location: ₹19
};
```
*Note: Any change made here updates the price calculator on the Order page, the master pricing matrix, and the live order totals immediately.*

### 2. Change Campus Hostels & Buildings
File: [`js/main.js`](js/main.js) (located at the top of the file as the single source of truth)
```javascript
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
  other: [] // extra buildings (e.g. "Uni-Hotel", "Faculty Apartments") can be added here
};
```
* **How it works**:
  - The dropdown automatically organizes entries under `<optgroup>` headers: **"Boys Hostels"**, **"Girls Hostels"**, and **"Other Buildings"**.
  - Students can also pick **"Other building (Type name/number)..."** to reveal a custom text input for any unlisted campus location.
  - The selected building is saved with the order and displayed across the Student Tracker, Order History, Delivery Boy dashboard, and Admin portal.
  - The Admin portal includes instant filtering by **All / Boys / Girls / Other**.
  - To add or modify hostels, simply edit the arrays inside `HOSTELS` in `js/main.js`. Never hardcode hostel names elsewhere.

### 3. Change Delivery Time Slots
File: [`js/pricing.js`](js/pricing.js)
```javascript
const TIME_SLOTS = [
  "10:00 AM - 12:00 PM (Morning Slot)",
  "12:00 PM - 02:00 PM (Afternoon Slot)",
  "04:00 PM - 06:00 PM (Evening Slot 1)",
  "06:00 PM - 08:00 PM (Evening Slot 2)"
];
```

### 4. Change Coupons & Promo Discounts
File: [`js/pricing.js`](js/pricing.js)
```javascript
const COUPONS = {
  "FIRST5": { code: "FIRST5", discount: 5, description: "₹5 off for first-time orders" },
  "CAMPUS10": { code: "CAMPUS10", discount: 10, description: "₹10 Off on orders ≥ ₹20" }
};
```

### 5. Change Delivery Boy Login & Profile
File: [`js/storage.js`](js/storage.js)
```javascript
const DEMO_DELIVERY_CREDS = {
  username: "deliveryboy",
  password: "lpu123",
  profile: {
    name: "Rahul Kumar",
    phone: "9876543210",
    vehicle: "Hero E-Scooter (PB-08-LP-1024)",
    rating: 4.9
  }
};
```

### 6. Change Admin Dashboard Passcode
File: [`js/storage.js`](js/storage.js)
```javascript
const DEMO_ADMIN_CREDS = {
  username: "admin",
  password: "admin123",
  role: "Campus Logistics Manager"
};
```

---

## 🌐 Pages Overview

| Page | File | Key Features |
|---|---|---|
| **Home** | `index.html` | 3D Three.js hero with rotating parcel & delivery scooter, mouse parallax, CSS 3D fallback box, price cards, 3D flip steps, animated counters. |
| **Order Now** | `order.html` | Real-time price breakdown calculator, room delivery toggle, browser Geolocation for Live Coordinates, base64 photo upload, UPI QR display, 4-digit OTP modal. |
| **Track Order** | `track.html` | 3-stage animated status stepper (`Picked` ➔ `On the way` ➔ `Delivered`), delivery boy info, WhatsApp runner chat button, 5-star post-delivery rating system. |
| **Order History** | `history.html` | Live feed of all orders from `localStorage`, tab filters (`All`, `Active`, `Delivered`), search bar, and one-click re-order. |
| **How It Works** | `how-it-works.html` | Uni Mall distance problem vs LPUcart solution, pricing comparison table, operational hours, 3D FAQ accordions. |
| **Contact Support** | `contact.html` | Campus dispatch desk details, student contact form (persisted locally), direct WhatsApp hotline. |
| **Delivery Boy Portal** | `delivery.html` | Secure runner login, student location maps link, status updates, **mandatory 4-digit OTP verification** before handover. |
| **Admin Dashboard** | `admin.html` | Today's revenue & order KPI cards, pure HTML5 Canvas bar charts, master ledger, and reset demo data button. |

---

## 🔄 End-to-End Testing Flow

1. **Place an Order** (`order.html`):
   - Enter your name and 10-digit mobile number.
   - Choose **Hostel Gate**, **Up to Room**, or **Live Location**.
   - Watch the price update live in the right-hand card.
   - Click **"Confirm Delivery"** to see your unique **4-digit handover OTP** (e.g. `4829`).
2. **Track the Order** (`track.html`):
   - View your order status (`Picked`), runner details, and OTP reminder.
   - Click **"Chat on WhatsApp"** to test the pre-filled order message.
3. **Delivery Partner Handover** (`delivery.html`):
   - Click **"Partner Login"** (use `deliveryboy` / `lpu123` or click demo login).
   - Find your active order. Click **"Mark On The Way"**.
   - Click **"Enter OTP & Mark Delivered"**. Enter the student's 4-digit OTP.
   - If incorrect, access is denied. If correct, status changes to **Delivered**!
4. **Rate Your Delivery** (`track.html`):
   - Refresh the tracking page; notice the status is now **Delivered**.
   - Rate the delivery 1 to 5 stars and leave a review.
5. **View History & Admin Stats** (`history.html` and `admin.html`):
   - Check the delivered order under `history.html`.
   - Log into `admin.html` (`admin` / `admin123`) to view updated total earnings and dynamic canvas charts.

---

## 🎨 Technology Highlights
- **Three.js Scene**: Procedural 3D parcel box with custom canvas-generated cardboard and barcode textures, 3D electric delivery bike with wheels, headlight, and floating parcel boxes.
- **CSS 3D Fallback**: 6-faced rotating CSS cube if WebGL or CDN is unavailable.
- **3D Interactive CSS**: Perspective tilt cards with dynamic cursor rotation (`rotateX`, `rotateY`, `translateZ`), 3D flip cards, and tactile push buttons.
- **Dark Mode**: Persisted in `localStorage` across page navigations.
- **HTML5 Geolocation**: Generates accurate Google Maps pins for students studying on lawns or at the library.
- **Responsive**: Fully optimized for mobile screens, tablets, and desktops.

