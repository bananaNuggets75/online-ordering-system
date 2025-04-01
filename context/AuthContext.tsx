"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { auth, db } from "@/lib/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";
import { doc, getDoc, setDoc } from "firebase/firestore";
import { useRouter } from "next/navigation";

interface User {
  uid: string;
  email: string;
  role: "admin" | "user";
  profilePic?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  isAdmin: boolean;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser: FirebaseUser | null) => {
      setLoading(true);
      
      if (currentUser && currentUser.email) {
        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
  
        if (userSnap.exists()) {
          const userData = userSnap.data();
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            role: userData.role,
            profilePic: userData.profilePic || "/default-avatar.png",
          });
          setIsAdmin(userData.role === "admin");
        } else {
          await setDoc(userRef, { role: "user", profilePic: "/default-avatar.png" });
          setUser({
            uid: currentUser.uid,
            email: currentUser.email,
            role: "user",
            profilePic: "/default-avatar.png",
          });
          setIsAdmin(false);
        }
      } else {
        // ✅ User not authenticated, reset state
        setUser(null);
        setIsAdmin(false);
        router.replace("/admin/login");
      }
      
      setLoading(false);
    });
  
    return () => unsubscribe();
  }, [router]);
  

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAdmin(false);
    router.push("/admin/login");
  };

  return (
    <AuthContext.Provider value={{ user, loading, isAdmin, logout }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
