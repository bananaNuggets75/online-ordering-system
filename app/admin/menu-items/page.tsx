"use client";

import { useEffect, useState } from "react";
import { db } from "@/lib/firebase";
import { collection, getDocs } from "firebase/firestore";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  description?: string;
  image?: string;
  inStock?: boolean;
  options?: { size: string; price: number }[];
  flavors?: { name: string; isOutOfStock: boolean }[];
}

const MenuItemsPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]); // ✅ Initialize as an empty array
  const [loading, setLoading] = useState(true);

  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "menu"));
      const items: MenuItem[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<MenuItem, "id">),
      }));
      setMenuItems(items || []); // ✅ Ensure items is always an array
    } catch (error) {
      console.error("Error fetching menu items:", error);
      setMenuItems([]); // ✅ Set empty array on error
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchMenuItems();
  }, []);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Menu Items</h1>

      {loading ? (
        <p>Loading menu items...</p>
      ) : menuItems.length > 0 ? (
        <ul className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {menuItems.map((item) => (
            <li key={item.id} className="border p-4 rounded-lg shadow-md bg-white">
              {/* Optimized Image */}
              <div className="relative w-full h-40 overflow-hidden rounded-md">
                {item.image ? (
                    <Image
                    src={item.image}
                    alt={item.name}
                    width={300} // ✅ Set fixed width
                    height={160} // ✅ Set fixed height
                    objectFit="cover"
                    className="w-full h-full rounded-md"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    No Image
                    </div>
                )}
                </div>

              <h2 className="font-semibold mt-2">{item.name}</h2>
              <p className="text-sm text-gray-600">{item.description || "No description available."}</p>

              {/* Flavors */}
              {item.flavors && item.flavors.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-xs font-semibold text-gray-500">Flavors:</h3>
                  <ul className="text-sm">
                    {item.flavors.map((flavor, index) => (
                      <li key={index} className={flavor.isOutOfStock ? "text-red-500" : ""}>
                        {flavor.name} {flavor.isOutOfStock ? "(Out of Stock)" : ""}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Options */}
              {item.options && item.options.length > 0 && (
                <div className="mt-2">
                  <h3 className="text-xs font-semibold text-gray-500">Options:</h3>
                  <ul className="text-sm">
                    {item.options.map((option, index) => (
                      <li key={index}>
                        {option.size} - ${option.price}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p>No menu items available.</p>
      )}
    </div>
  );
};

export default MenuItemsPage;
