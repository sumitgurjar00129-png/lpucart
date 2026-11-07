# 📦 LPUcart - Campus Parcel Delivery Service

> **LPUcart** is an interactive, modern, multi-page campus parcel delivery web application designed for university hostel students. It connects online shopping parcel pickups at **Uni Mall** (Amazon, Flipkart, Myntra, Meesho, Bluedart, etc.) directly to student hostels, rooms, or live GPS campus coordinates.
> 
> 🌐 **Live URL**: [https://lpucart-delivery.netlify.app](https://lpucart-delivery.netlify.app)
> 🎓 **Status**: Student project demo. Not an official LPU service.

Built with **pure HTML5, modern CSS3 (3D transforms & glassmorphism), vanilla JavaScript (ES6+), and Three.js (via CDN)**. No complex build pipelines or external frameworks needed. All data is reliably persisted client-side in `localStorage` via a robust storage module.

---

## 🚀 How to Run the Website

You can run LPUcart by opening `index.html` in any modern web browser:

### Option 1: Direct File Open
Double-click `index.html` or drag and drop it into Google Chrome, Microsoft Edge, Safari, or Firefox.

### Option 2: Python Built-in Server (Recommended)
Open your terminal inside this project directory and run:
```bash
python3 -m http.server 8000
```
Then visit: `http://localhost:8000` in your browser.

### Option 3: Using VS Code Live Server
1. Open the `cse326project` folder in Visual Studio Code.
2. Right-click `index.html` and select **"Open with Live Server"**.

---

## ⚙️ Master Configuration Guide

All configurable business rules, rates, locations, and owner details are centralized in one single configuration block at the top of their respective JavaScript files:

### 1. Owner & Founder Details
File: [`js/main.js`](js/main.js)
```javascript
const OWNER_CONFIG = {
  OWNER_NAME: "Sumit Gurjar",
  OWNER_PHONE: "919680040551",
  OWNER_PHONE_DISPLAY: "+91 96800 40551",
  OWNER_EMAIL: "sumitgurjar00129@gmail.com"
};
```
*Note: These details automatically populate all contact info, WhatsApp dispatch links (`wa.me`), phone dials, and email links across every page.*

### 2. Guaranteed Campus Delivery Pricing
File: [`js/pricing.js`](js/pricing.js)
```javascript
const PRICES = {
  single: 11,   // 1 parcel, Uni Mall to hostel gate: ₹11
  multi: 22,    // 2 or more parcels, Uni Mall to hostel gate: ₹22
  room: 10,     // Delivery up to the room (extra): +₹10
  live: 19      // Delivery outside hostel to student's live location: ₹19
};
```
*Note: Any rate modification updates the real-time Order page price breakdown, the master tariff tables, and active quotes.*

### 3. Campus Hostels & Buildings
File: [`js/main.js`](js/main.js)
```javascript
const HOSTELS = {
  boys: [
    "Boys Hostel 1", "Boys Hostel 2", "Boys Hostel 3", "Boys Hostel 4", "Boys Hostel 5",
    "Boys Hostel 6", "Boys Hostel 7", "Boys Hostel 8", "Boys Hostel 9", "Boys Hostel 10"
  ],
  girls: [
    "Girls Hostel 11", "Girls Hostel 12", "Girls Hostel 13"
  ],
  other: [] // extra campus buildings can be added here
};
```
* **How it works**:
  - The dropdown automatically organizes entries under `<optgroup>` headers: **"Boys Hostels"**, **"Girls Hostels"**, and **"Other Buildings"**.
  - Students can select **"Other building (Type name/number)..."** to reveal a custom text input for any unlisted campus location.
  - The selected building is saved with the order and displayed across the Student Tracker, Order History, Partner Portal, and Owner Portal.
  - The Owner Portal includes instant filtering by **All / Boys / Girls / Other**.

### 4. Delivery Time Slots & Weekly Pass
File: [`js/pricing.js`](js/pricing.js)
- **Time Slots**: `10:00 AM - 12:00 PM`, `12:00 PM - 02:00 PM`, `04:00 PM - 06:00 PM`, `06:00 PM - 08:00 PM`.
- **Weekly Pass**: 10 campus deliveries for ₹99 flat.

---

## 🌐 Pages & Security Architecture

### Public Student Pages (Zero Staff Links)
Public pages contain **no links** to staff portals in headers, footers, or mobile drawers:

| Page | File | URL | Description |
|---|---|---|---|
| **Home** | `index.html` | `/` | 3D Three.js hero with rotating parcel, CSS 3D fallback box, honest "Why LPUcart" features, pricing summary, 3D flip steps. |
| **Order Now** | `order.html` | `/order` | Dynamic price calculator, room toggle, HTML5 Geolocation pin, UPI QR ("Demo QR - no real payment"), 4-digit OTP handover modal. |
| **Track Order** | `track.html` | `/track` | **Privacy-protected tracker**: requires Tracking ID + last 4 digits of phone number. Shows runner's first name, OTP, and post-delivery 5-star rating. |
| **Order History** | `history.html` | `/history` | **Device-private history**: shows only orders placed from the current browser session (`lpucart_my_orders`), with filters and one-click re-order. |
| **How It Works** | `how-it-works.html` | `/how-it-works` | Uni Mall distance problem vs LPUcart solution, transparent price matrix table, 4-digit OTP guarantee, and FAQs. |
| **Contact Support** | `contact.html` | `/contact` | Founder: Sumit Gurjar, campus contact details, local demo contact form, and direct WhatsApp support. |

### Private Staff Portals (Hidden & Protected)
Staff portals are omitted from `sitemap.xml`, not listed in `robots.txt`, and tagged with `<meta name="robots" content="noindex, nofollow">`:

| Portal | File | Access & Privacy |
|---|---|---|
| **Owner Portal** | `owner-portal.html` | Protected by SHA-256 Web Crypto hashing, 30-min session timeout, and 5-min lockout after 5 incorrect attempts. Controls partner management, credential sharing, master order ledger, delivery confirmation, support messages, and password resets. |
| **Delivery Partner Portal** | `runner-portal.html` | Dedicated runner interface. Partner only sees orders explicitly assigned to them. Requires student's 4-digit OTP to complete handover. Student phone numbers are permanently masked once delivery completes. |

---

## 🔐 Owner & Staff Management Workflow

### 1. Owner Portal Login (`owner-portal.html`)
1. Open `owner-portal.html` in your browser.
2. Sign in with username `owner`.
3. Enter your temporary owner password (printed in your handover chat message).
4. **Forced Password Change**: On first login, you will immediately be prompted to create your new permanent password.
5. You can also update your password at any time inside the **Settings** tab.

### 2. Managing Delivery Partners
1. In `owner-portal.html`, navigate to the **Delivery Partners** tab.
2. Click **"Add Delivery Partner"**.
3. Enter the partner's full name, 10-digit mobile number, and set an optional password (or let the system generate an 8-character secure password).
4. Once saved, a **Partner Credentials Share Card** appears with:
   - Direct runner portal URL (`/runner-portal.html`).
   - Username and initial temporary password.
   - **One-click "Copy Credentials"** button.
   - **"Share via WhatsApp"** button which prepares a friendly pre-formatted onboarding message.
5. In the Partners table, the owner can at any time:
   - **Disable / Enable** any partner account.
   - **Reset Password** to generate a new temporary password and force a change on next login.
   - **Delete** a partner account.

### 3. Delivery Partner Handover (`runner-portal.html`)
1. The partner opens `runner-portal.html` and logs in with their phone number or username and initial password.
2. If it is their first login or their password was reset, they are prompted to set a permanent password.
3. The partner sees **only their assigned orders** (never other runners' orders or total earnings).
4. The partner clicks **"Accept & Pick Up"** (status: `Picked`), then **"Start Delivery"** (status: `On the way`).
5. When arriving at the student's hostel or room:
   - Partner asks the student for their **4-digit handover OTP**.
   - Partner enters the OTP. If incorrect, delivery is rejected. If correct, status becomes **Delivered**.
   - Student's phone number is immediately masked in the partner portal for privacy.

### 4. Owner Confirmation
1. In `owner-portal.html`, orders marked `Delivered` display an amber **"Waiting for owner confirmation"** badge.
2. The owner reviews the handover and clicks **"Confirm Delivery"**.
3. Status changes to **Confirmed** and student rating is logged.

---

## 🔒 Student Privacy Guarantee

1. **Order Tracking Security (`track.html`)**:
   - Students cannot view orders by guessing random IDs.
   - Entering an Order ID requires verifying the **last 4 digits of the phone number** used during checkout.
   - Unauthorized attempts show a clear `"Order not found or verification failed"` notice.
   - The student's specific room number is masked on the tracker for privacy, and only the delivery partner's first name is shown.
2. **Order History Device Isolation (`history.html`)**:
   - Reads exclusively from `lpucart_my_orders` stored on that browser device.
   - Other users sharing the network or viewing the page cannot see past orders placed by other students.

---

## 🎨 Technology Highlights
- **Three.js Scene**: Interactive procedural 3D parcel with custom canvas textures, electric campus delivery scooter with rotating wheels, and mouse parallax.
- **CSS 3D Fallback**: 6-faced rotating CSS cube if WebGL or CDN is unavailable.
- **3D Interactive CSS**: Perspective tilt cards (`rotateX`, `rotateY`, `translateZ`), 3D flip steps, and tactile push buttons.
- **Web Crypto API**: SHA-256 password hashing client-side. Zero plain text passwords stored in state.
- **Dark Mode**: Persisted in `localStorage` across page navigations with a rounded white pill behind the logo.
- **Responsive**: Fully optimized for mobile phones, tablets, and desktops.
