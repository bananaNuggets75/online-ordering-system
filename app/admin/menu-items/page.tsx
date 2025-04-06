"use client";

import { useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { collection, getDocs, addDoc, updateDoc, deleteDoc, doc } from "firebase/firestore";
import { onAuthStateChanged } from "firebase/auth";
import { useRouter } from "next/navigation";
import { Button } from "react-bootstrap";
import Image from "next/image";

interface MenuItem {
  id: string;
  name: string;
  image: string;
  inStock: boolean;
  isAvailable: boolean;
  options: { size: string; price: number }[];
  flavors: { name: string; isOutOfStock: boolean }[];
}

const ADMIN_UID = process.env.NEXT_PUBLIC_ADMIN_UID;

const MenuItemsPage = () => {
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newItem, setNewItem] = useState({ name: "", image: "", options: [{ size: "", price: 0 }] });
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [loading, setLoading] = useState(true);
  const [authChecked, setAuthChecked] = useState(false);
  const router = useRouter();

  // Admin authentication check
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      if (!currentUser || currentUser.uid !== ADMIN_UID) {
        router.replace("/admin/login");
      } else {
        setAuthChecked(true);
      }
    });

    return () => unsubscribe();
  }, [router]);

  // Fetch and normalize menu items
  const fetchMenuItems = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, "menu"));
      const items: MenuItem[] = querySnapshot.docs.map((doc) => {
        const data = doc.data() as Partial<MenuItem>;
        return {
          id: doc.id,
          name: data.name || "Unnamed Item",
          image: data.image || "",
          inStock: data.inStock ?? true,
          isAvailable: data.isAvailable ?? true,
          options: Array.isArray(data.options) ? data.options : [],
          flavors: Array.isArray(data.flavors) ? data.flavors : [],
        };
      });
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

  const handleSave = async () => {
    if (!newItem.name || newItem.options.length === 0) return;

    try {
      if (editingItem) {
        await updateDoc(doc(db, "menu", editingItem.id), {
          name: newItem.name,
          image: newItem.image || "",
          options: newItem.options,
        });
      } else {
        await addDoc(collection(db, "menu"), {
          name: newItem.name,
          image: newItem.image || "",
          options: newItem.options,
          inStock: true,
        });
      }
      fetchMenuItems();
      setNewItem({ name: "", image: "", options: [{ size: "", price: 0 }] });
      setEditingItem(null);
    } catch (error) {
      console.error("Error saving menu item:", error);
    }
  };

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

  const handleEdit = (item: MenuItem) => {
    setEditingItem(item);
    setNewItem({ name: item.name, image: item.image || "", options: item.options });
  };

  if (!authChecked) return <p>Loading...</p>;

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
          type="text"
          placeholder="Image URL"
          value={newItem.image}
          onChange={(e) => setNewItem({ ...newItem, image: e.target.value })}
          className="border p-2 w-full mb-2"
        />

        {/* Options Section */}
        <div className="mb-2">
          {newItem.options.map((option, index) => (
            <div key={index} className="flex gap-2 mb-2">
              <input
                type="text"
                placeholder="Size"
                value={option.size}
                onChange={(e) => {
                  const updatedOptions = [...newItem.options];
                  updatedOptions[index].size = e.target.value;
                  setNewItem({ ...newItem, options: updatedOptions });
                }}
                className="border p-2 w-32"
              />
              <input
                type="number"
                placeholder="Price"
                value={option.price}
                onChange={(e) => {
                  const updatedOptions = [...newItem.options];
                  updatedOptions[index].price = Number(e.target.value);
                  setNewItem({ ...newItem, options: updatedOptions });
                }}
                className="border p-2 w-32"
              />
              <button
                type="button"
                onClick={() => {
                  const updatedOptions = newItem.options.filter((_, idx) => idx !== index);
                  setNewItem({ ...newItem, options: updatedOptions });
                }}
                className="text-red-600"
              >
                Remove
              </button>
            </div>
          ))}
          <button
            type="button"
            onClick={() => setNewItem({ ...newItem, options: [...newItem.options, { size: "", price: 0 }] })}
            className="text-blue-600"
          >
            Add Option
          </button>
        </div>

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
              <div className="text-gray-700">
                {Array.isArray(item.options) && item.options.length > 0 ? (
                  item.options.map((option, idx) => (
                    <p key={idx}>
                      {option.size}: ${option.price.toFixed(2)}
                    </p>
                  ))
                ) : (
                  <p className="text-sm text-gray-500 italic">No options available</p>
                )}
              </div>

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
