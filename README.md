# Online Ordering System


A full-stack web app for browsing a menu, placing orders, and tracking them in real time — with a separate admin area for managing menu items and incoming orders. Built with [Next.js](https://nextjs.org) (App Router), [Firebase](https://firebase.google.com), and TypeScript.


## Features


### Customers
- **Browse the menu** with item details, sizes, and flavors
- **Cart** that persists across page reloads (saved to `localStorage`)
- **Checkout flow** with an order confirmation step
- **Order tracking** to follow an order's status
- **Accounts** — register, log in, and manage a profile (with profile picture)
- Toast notifications for cart and account actions


### Admins
- Separate **admin login** and **dashboard**
- **Manage menu items** — add, edit, and update items, sizes, and flavors
- Role-based access (`admin` vs `user`) enforced through Firebase Auth


## Tech Stack


| Area | Technology |
|------|------------|
| Framework | Next.js 15 (App Router) + React 19 |
| Language | TypeScript |
| Auth & Database | Firebase Authentication + Cloud Firestore |
| Image hosting | Cloudinary |
| Styling | Tailwind CSS, Bootstrap / React-Bootstrap |
| Notifications | react-hot-toast |
| HTTP | axios |


## Project Structure


```
app/                 Next.js routes (App Router)
 menu/              Menu listing and item detail pages
 cart/              Shopping cart
 checkout/          Checkout and order confirmation
 order/, track/     Order placement and tracking
 order-status/      Order status view
 login/, register/  Customer authentication
 profile/           User profile
 admin/             Admin login, dashboard, and menu management
components/          Shared UI (Menu, SideBar, AdminNavbar)
context/             React context providers (Auth, Cart)
lib/                 Firebase, Cloudinary, and data-fetching helpers
public/              Static assets
```


## Getting Started


### 1. Prerequisites
- Node.js 18+ and npm
- A [Firebase](https://console.firebase.google.com) project (Authentication + Firestore enabled)
- A [Cloudinary](https://cloudinary.com) account (for menu images)


### 2. Install


```bash
cd online-ordering-system
npm install
```


### 3. Configure environment variables


Create a `.env.local` file in the project root:


```bash
# Firebase (client — safe to expose)
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your_project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your_project_id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your_project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id


# Cloudinary (server — keep secret)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
```


> Firestore should have a `menu` collection for items and a `users` collection for accounts. New sign-ups default to the `user` role; set `role: "admin"` on a user document to grant admin access.


### 4. Run the dev server


```bash
npm run dev
```


Open [http://localhost:3000](http://localhost:3000) in your browser.


## Available Scripts


| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server |
| `npm run build` | Build for production |
| `npm run start` | Run the production build |
| `npm run lint` | Run ESLint |


## Deployment


The easiest way to deploy is [Vercel](https://vercel.com/new). Add the same environment variables in your Vercel project settings before deploying. See the [Next.js deployment docs](https://nextjs.org/docs/app/building-your-application/deploying) for details.


## Developer


- **Kenan Ben Polgo**
