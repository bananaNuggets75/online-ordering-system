// lib/getMenuItems.js
import { collection, getDocs } from "firebase/firestore";
import { db } from "@/lib/firebase"; // adjust if file path is different

export async function getMenuItems() {
  try {
    console.log("🔥 Fetching menu items..."); // Debug start

    const querySnapshot = await getDocs(collection(db, "menu"));
    console.log("✅ Query snapshot received:", querySnapshot);

    const menuItems = querySnapshot.docs.map((doc) => ({
      id: doc.id,
      ...doc.data(),
    }));

    console.log("✅ Menu items fetched:", menuItems); // Debug output
    return menuItems;
  } catch (error) {
    console.error("❌ Error fetching menu items:", error); // Detailed error output
    return [];
  }
}
