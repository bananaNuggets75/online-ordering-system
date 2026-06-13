/**
 * Seeds the Firestore "menu" collection with starter products that use the
 * images already in /public.
 *
 * Idempotent: each product is written to a fixed slug id, so re-running
 * updates existing items instead of creating duplicates.
 *
 *   node --env-file=.env.local scripts/seedMenu.mjs
 */
import { initializeApp } from "firebase/app";
import { getFirestore, doc, setDoc } from "firebase/firestore";

const slugify = (s) =>
  s.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

if (!firebaseConfig.apiKey) {
  console.error("Missing Firebase env. Run with: node --env-file=.env.local scripts/seedMenu.mjs");
  process.exit(1);
}

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// Products based on the images in /public
const items = [
  {
    name: "Classic Burger",
    description: "Juicy beef patty, melted cheese, fresh veggies in a toasted bun.",
    image: "/burger.png",
    stock: 25,
    isAvailable: true,
    inStock: true,
    options: [
      { size: "Single", price: 89 },
      { size: "Double", price: 129 },
    ],
    flavors: [],
  },
  {
    name: "Cheesy Pizza",
    description: "Stone-baked pizza loaded with mozzarella and rich tomato sauce.",
    image: "/pizza.png",
    stock: 15,
    isAvailable: true,
    inStock: true,
    options: [
      { size: "Slice", price: 60 },
      { size: "Whole", price: 299 },
    ],
    flavors: [],
  },
  {
    name: "Crispy Fries",
    description: "Golden, crispy fries served hot with a sprinkle of salt.",
    image: "/fries.png",
    stock: 40,
    isAvailable: true,
    inStock: true,
    options: [
      { size: "Regular", price: 49 },
      { size: "Large", price: 69 },
    ],
    flavors: [
      { name: "Plain Salted", isOutOfStock: false },
      { name: "Cheese", isOutOfStock: false },
      { name: "Sour Cream", isOutOfStock: false },
    ],
  },
  {
    name: "Coke",
    description: "Ice-cold classic Coca-Cola to wash it all down.",
    image: "/coke.png",
    stock: 50,
    isAvailable: true,
    inStock: true,
    options: [
      { size: "Regular", price: 25 },
      { size: "Large", price: 40 },
    ],
    flavors: [],
  },
  {
    name: "Churro Donuts",
    description: "Soft donuts rolled in cinnamon sugar with a dipping sauce.",
    image: "/churro-donut.jpg",
    stock: 20,
    isAvailable: true,
    inStock: true,
    options: [
      { size: "3 pcs", price: 39 },
      { size: "5 pcs", price: 59 },
    ],
    flavors: [
      { name: "Nutella", isOutOfStock: false },
      { name: "Caramel", isOutOfStock: false },
      { name: "Biscoff", isOutOfStock: false },
    ],
  },
  {
    name: "Croffles",
    description: "Flaky croissant-waffles with a crisp edge and creamy toppings.",
    image: "/croffles.jpg",
    stock: 18,
    isAvailable: true,
    inStock: true,
    options: [
      { size: "Mini", price: 59 },
      { size: "Regular", price: 89 },
    ],
    flavors: [
      { name: "Biscoff Cream", isOutOfStock: false },
      { name: "Cookies and Cream", isOutOfStock: false },
      { name: "Matcha Almond", isOutOfStock: false },
    ],
  },
  {
    name: "Chewy Soda",
    description: "Refreshing fruit soda topped with chewy popping boba.",
    image: "/popping-boba.jpg",
    stock: 30,
    isAvailable: true,
    inStock: true,
    price: 45,
    options: [],
    flavors: [
      { name: "Strawberry", isOutOfStock: false },
      { name: "Blueberry", isOutOfStock: false },
      { name: "Lychee", isOutOfStock: false },
      { name: "Green Apple", isOutOfStock: false },
    ],
  },
];

async function main() {
  for (const item of items) {
    const id = slugify(item.name);
    await setDoc(doc(db, "menu", id), item, { merge: true });
    console.log(`  ✓ ${item.name} (${id})`);
  }
  console.log(`\nDone — upserted ${items.length} products.`);
  process.exit(0);
}

main().catch((err) => {
  console.error("Seed failed:", err.message || err);
  process.exit(1);
});
