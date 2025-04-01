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
    <div className="profile-container">
      <div className="profile-card">
        <h2 className="text-center text-3xl">Profile</h2>

        <div className="profile-content">
          <Image
              src={profilePic} 
              alt="Profile Picture"
              width={160}
              height={160}
              className="profile-picture"
            />

          {isEditing && (
            <div className="file-upload">
              <p>{newProfilePic ? newProfilePic.name : "No file chosen"}</p>
              <label htmlFor="fileUpload" className="button button-save">
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
              className="profile-input"
              value={displayName}
              onChange={(e) => setDisplayName(e.target.value)}
            />
          ) : (
            <h3 className="text-center">{displayName}</h3>
          )}
          
          <p className="text-center">{email || "No email available"}</p>
        </div>

        <div className="description">
          <h4>Description</h4>
          {isEditing ? (
            <textarea
              className="description-box"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          ) : (
            <p>{description || "No description provided."}</p>
          )}
        </div>

        <div className="profile-buttons">
          {isEditing ? (
            <>
              <button onClick={handleSave} className="button button-save">
                Save
              </button>
              <button onClick={() => setIsEditing(false)} className="button button-cancel">
                Cancel
              </button>
            </>
          ) : (
            <button onClick={() => setIsEditing(true)} className="button button-edit">
              Edit Profile
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
