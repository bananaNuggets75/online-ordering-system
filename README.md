# Online Ordering System

A web app for a food stall ("Food Dae") where customers scan a QR code, browse
the menu, and place orders — no customer login required. A separate, hidden
admin area manages menu items, inventory, and incoming orders in real time.
Built with [Next.js](https://nextjs.org) (App Router), [Firebase](https://firebase.google.com), and TypeScript.

## Features

### Customers (no account needed)
- **Scan the QR code → browse the menu** with item images, sizes, and flavors
- **Cart** that persists across page reloads (saved to `localStorage`)
- **Anonymous checkout** — just enter name and contact at the cart; agree to a
  short Terms confirmation before placing the order
- **Order confirmation** with a queue number and GCash / over-the-counter payment
- **Real-time order tracking** on the order-status page

### Admins
- **Hidden admin login** at a secret path (see `ADMIN_LOGIN_PATH` below)
- **Dashboard** — live incoming orders, status updates, total revenue, archiving
- **Manage menu items** — add/edit items, sizes, flavors, and **stock counts**
- **Inventory** — stock is decremented atomically when an order is placed, so
  items can't be oversold and sell out automatically at zero

## Tech Stack

| Area | Technology |
|------|------------|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript |
| Auth & Database | Firebase Authentication + Cloud Firestore |
| Images | Static files in `/public` (or any image URL) |
| Styling | Tailwind CSS, custom design system, Poppins (`next/font`) |
| Icons | Font Awesome |
| Notifications | react-hot-toast |

## Project Structure

```
app/                 Next.js routes (App Router)
 menu/              Menu listing (add-to-cart modal)
 cart/              Cart + anonymous checkout
 checkout/confirm/  Order confirmation, queue number, payment
 order/, track/     Order placement and tracking
 order-status/      Real-time order status view
 admin/[gate]/      Secret-path admin login
 admin/dashboard/   Orders dashboard
 admin/menu-items/  Menu + inventory management
components/          Shared UI (SideBar, AdminNavbar)
context/             React context providers (Auth, Cart)
lib/                 Firebase + data-fetching helpers
scripts/             seedMenu.mjs — seed starter products
public/              Static assets (menu images)
```

> Customers never authenticate. The only login is the admin, identified by
> their Firebase Auth UID (`NEXT_PUBLIC_ADMIN_UID`).

## Getting Started

### 1. Prerequisites
- Node.js 18+ and npm
- A [Firebase](https://console.firebase.google.com) project with **Authentication**
  (Email/Password) and **Cloud Firestore** enabled

### 2. Install

```bash
cd online-ordering-system
npm install
```

### 3. Configure environment variables

Copy `.env.local.example` to `.env.local` and fill in your values:

```bash
# Firebase (client — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id

# Firebase Auth UID of the admin account (Authentication > Users)
NEXT_PUBLIC_ADMIN_UID=your_admin_uid

# Secret path segment for the admin login (server-only, NOT exposed to the
# browser). The admin logs in at /admin/<this value>. Generate one with:
#   openssl rand -hex 6
ADMIN_LOGIN_PATH=your_secret_path
```

> Firestore uses a `menu` collection for items and an `orders` collection for
> orders. Create the admin user in Firebase Authentication, then put its UID in
> `NEXT_PUBLIC_ADMIN_UID`.

### 4. Seed the menu (optional)

Populate the `menu` collection with starter products that use the images in
`/public`:

```bash
node --env-file=.env.local scripts/seedMenu.mjs
```

### 5. Run the dev server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000). The admin logs in at
`http://localhost:3000/admin/<ADMIN_LOGIN_PATH>`.

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |
| `node --env-file=.env.local scripts/seedMenu.mjs` | Seed/refresh starter menu items |

## Deployment

Deploy on [Vercel](https://vercel.com/new). Before deploying:

1. Add **all** environment variables (including `NEXT_PUBLIC_ADMIN_UID` and the
   server-only `ADMIN_LOGIN_PATH`) in your Vercel project settings.
2. In Firebase Console → Authentication → Settings → **Authorized domains**, add
   your Vercel domain so admin login works in production.

## Developer

- **Kenan Ben Polgo**
