"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged, } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  price: number;
  image?: string;
  inStock: boolean;
}

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

const MenuItemsPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", price: "", image: "" });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // 🔐 Admin authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.uid !== ADMIN_UID) {
        router.replace("/admin/login"); // Redirect non-admins
      } else {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "menu"));
      const items: MenuItem[] = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...(doc.data() as Omit<MenuItem, "id">),
      }));
      setMenuItems(items);
    } catch (error) {
      console.error("Error fetching menu items:", error);
    }
    setLoading(false);
  };

  useEffect(() => {
    if (authChecked) {
      fetchMenuItems();
    }
  }, [authChecked]);

  // Add or update a menu item
  const handleSave = async () => {
    if (!newItem.name || !newItem.price) return;

    try {
      if (editingItem) {
        await updateDoc(doc(db, "menu", editingItem.id), {
          name: newItem.name,
          price: Number(newItem.price),
          image: newItem.image || "",
        });
      } else {
        await addDoc(collection(db, "menu"), {
          name: newItem.name,
          price: Number(newItem.price),
          image: newItem.image || "",
          inStock: true,
        });
      }
      fetchMenuItems();
      setNewItem({ name: "", price: "", image: "" });
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

  // Delete a menu item
  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this item?")) {
      try {
        await deleteDoc(doc(db, "menu", id));
        fetchMenuItems();
      } catch (error) {
        console.error("Error deleting menu item:", error);
      }
    }
  };

  // Start editing an item
  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({ name: item.name, price: item.price.toString(), image: item.image || "" });
  };

  if (!authChecked) return <p>Loading...</p>; // Prevent rendering until authentication is confirmed

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Manage Menu Items</h1>

      {/* Add/Edit Form */}
      <div className="mb-4 p-4 border rounded-md bg-gray-50">
        <input
          type="text"
          placeholder="Item Name"
          value={newItem.name}
          onChange={(e) => setNewItem({ ...newItem, name: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="number"
          placeholder="Price"
          value={newItem.price}
          onChange={(e) => setNewItem({ ...newItem, price: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <input
          type="text"
          placeholder="Image URL"
          value={newItem.image}
          onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
          className="border p-2 w-full mb-2"
        />
        <Button onClick={handleSave}>{editingItem ? "Update Item" : "Add Item"}</Button>
      </div>

      {/* Loading Indicator */}
      {loading ? (
        <p>Loading menu items...</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {menuItems.map((item) => (
            <div key={item.id} className="p-4 border rounded-md flex flex-col gap-2 bg-white">
              <div className="relative w-full h-40 overflow-hidden rounded-md">
                {item.image ? (
                  <Image
                    src={item.image}
                    alt={item.name}
                    width={300}
                    height={160}
                    objectFit="cover"
                    className="w-full h-full rounded-md"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-gray-200 text-gray-500">
                    No Image
                  </div>
                )}
              </div>

              <h2 className="text-lg font-semibold">{item.name}</h2>
              <p className="text-gray-700">${item.price?.toFixed(2) ?? "0.00"}</p>

              <div className="flex gap-2 mt-2">
                <Button onClick={() => handleEdit(item)}>Edit</Button>
                <Button variant="danger" onClick={() => handleDelete(item.id)}>
                  Delete
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MenuItemsPage;
