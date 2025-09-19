import "./style.css";
import { auth, database } from "./firebase";
import { doc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const ProfileSetup = () => {
  const [name, setName] = useState("");
  const [role, setRole] = useState("");
  const navigate = useNavigate();

  const saveProfile = async () => {
    if (!name.trim() || !role.trim()) {
      alert("Please fill both fields");
      return;
    }

    try {
      const uid = auth.currentUser?.uid;
      if (!uid) {
        alert("No user is logged in");
        return;
      }

      await updateDoc(doc(database, "users", uid), {
        name,
        role,
      });

      navigate("/home"); // Go to home after saving
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="profile-setup-container">
      <h2>Complete Your Profile 🚀</h2>
      <p>We would love to know you better!</p>

      <input
        type="text"
        placeholder="👤 Your Name"
        onChange={(e) => setName(e.target.value)}
      />
      <input
        type="text"
        placeholder="💻 Your Role"
        onChange={(e) => setRole(e.target.value)}
      />

      <button onClick={saveProfile}>Save & Continue</button>
    </div>
  );
};