"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { getAuth, onAuthStateChanged, User } from "firebase/auth";
import { doc, getDoc, setDoc, getFirestore } from "firebase/firestore";
import app from "@/lib/firebase";
import axios from "axios";

const ProfilePage = () => {
  const auth = getAuth(app);
  const db = getFirestore(app);
  const [user, setUser] = useState<User | null>(null);
  const [displayName, setDisplayName] = useState("");
  const [description, setDescription] = useState("");
  const [profilePic, setProfilePic] = useState("/default-avatar.png");
  const [email, setEmail] = useState(""); // Store email
  const [role, setRole] = useState(""); // Store role but don’t show in UI
  const [newProfilePic, setNewProfilePic] = useState<File | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  //todo:
  //email?
  //password this is only for the firestore the same with the role
  //role but this is only for the firestore to store and not show in the profile
  //because if we change this without the role technically your credentials or your way of login won't be possible

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        setUser(currentUser);
        setEmail(currentUser.email || ""); // ✅ Set email

        const userRef = doc(db, "users", currentUser.uid);
        const userSnap = await getDoc(userRef);
        if (userSnap.exists()) {
          const data = userSnap.data();
          setDisplayName(data.displayName || "");
          setDescription(data.description || "");
          setProfilePic(data.profilePic || "/default-avatar.png");
          setRole(data.role || ""); // Store role in Firestore but don't display it
        }
      }
    });

    return () => unsubscribe();
  }, [auth, db]);

  const handleSave = async () => {
    if (!user) return;

    try {
      let imageUrl = profilePic;
      if (newProfilePic) {
        const formData = new FormData();
        formData.append("file", newProfilePic);
        formData.append("upload_preset", "profile_pictures");

        const response = await axios.post(
          "https://api.cloudinary.com/v1_1/dedt8hfda/image/upload",
          formData
        );

        imageUrl = response.data.secure_url;
      }

      const userRef = doc(db, "users", user.uid);
      await setDoc(userRef, {
        displayName,
        description,
        profilePic: imageUrl,
        role, // ✅ Keep role in Firestore (but not editable in UI)
      }, { merge: true });

      setProfilePic(imageUrl);
      setIsEditing(false);
    } catch (error) {
      console.error("Error saving profile:", error);
    }
  };

  return (
    <div className="min-h-screen flex flex-col justify-center items-start pb-80"> 
    <div className="w-[70%] max-w-6xl mx-auto mt-4 p-6 shadow-lg rounded-lg text-black dark:text-white bg-transparent overflow-hidden min-w-[80vh]">
      <h2 className="text-2xl font-bold mb-4 text-center">Profile</h2>
      <div className="flex flex-col items-center">
        <Image
          src={profilePic} 
          alt="Profile Picture"
          width={30}
          height={30}
          className="rounded-full w-40 h-40 object-cover border border-gray-300 dark:border-gray-600"
        />
        {isEditing && (
        <div className="flex flex-col items-center mt-4">
            <p className="text-gray-600 dark:text-gray-400">
            {newProfilePic ? newProfilePic.name : "No file chosen"}
            </p>
            <label
            htmlFor="fileUpload"
            className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 cursor-pointer mt-2"
            >
            Choose File
            </label>
            <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={(e) => setNewProfilePic(e.target.files?.[0] || null)}
            className="hidden"
            />
        </div>
        )}
        {isEditing ? (
          <input
            type="text"
            className="mt-3 text-xl font-semibold text-black dark:text-white text-center border border-gray-300 dark:border-gray-600 p-1 rounded bg-transparent"
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
          />
        ) : (
          <h3 className="mt-3 text-xl font-semibold">{displayName}</h3>
        )}
        <p className="text-gray-600 dark:text-gray-400">{email || "No email available"}</p>
      </div>
      <div className="mt-4">
        <h4 className="font-semibold text-black dark:text-white">Description</h4>
        {isEditing ? (
          <textarea
            className="w-full border border-gray-300 dark:border-gray-600 p-2 rounded text-black dark:text-white bg-transparent"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        ) : (
          <p className="text-black dark:text-white">{description || "No description provided."}</p>
        )}
      </div>
      <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
        {isEditing ? (
          <>
            <button
              onClick={handleSave}
              className="bg-green-500 text-white px-5 py-2 rounded-md text-base hover:bg-green-600"
            >
              Save
            </button>
            <button
              onClick={() => setIsEditing(false)}
              className="bg-gray-400 dark:bg-gray-600 text-white px-5 py-2 rounded-md text-base hover:bg-gray-500 dark:hover:bg-gray-700"
            >
              Cancel
            </button>
          </>
        ) : (
          <button
            onClick={() => setIsEditing(true)}
            className="bg-blue-500 text-white px-5 py-2 rounded-md text-base hover:bg-blue-600"
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
    </div>
  );
};


export default ProfilePage;