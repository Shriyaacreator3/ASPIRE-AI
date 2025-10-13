import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import "./journal.css"; // Import the CSS file

// Firebase imports (uses your existing firebase exports)
import { auth, database } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
} from "firebase/firestore";

export default function Journal() {
  const [entryText, setEntryText] = useState("");
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState(""); // <-- message shown after save

  // Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Subscribe to Firestore journal entries for the signed-in user
  useEffect(() => {
    if (!user) {
      setEntries([]);
      return;
    }

    const colRef = collection(database, "users", user.uid, "journalEntries");
    const q = query(colRef, orderBy("createdAt", "desc"));

    const unsub = onSnapshot(
      q,
      (snapshot) => {
        const docs = snapshot.docs.map((d) => {
          const data = d.data();
          return {
            id: d.id,
            text: data.text || "",
            createdAt:
              data.createdAt && typeof data.createdAt.toDate === "function"
                ? data.createdAt.toDate().toLocaleString()
                : "",
          };
        });
        setEntries(docs);
      },
      (err) => {
        console.error("Failed to load journal entries:", err);
        setEntries([]);
      }
    );

    return () => unsub();
  }, [user]);

  const handleSave = async () => {
    if (!entryText.trim()) return;
    if (!user) {
      alert("Please sign in to save journal entries.");
      return;
    }

    setSaving(true);
    try {
      const colRef = collection(database, "users", user.uid, "journalEntries");
      await addDoc(colRef, {
        text: entryText.trim(),
        createdAt: serverTimestamp(),
      });
      setEntryText("");

      // show saved message briefly
      setSavedMessage("Saved!");
      setTimeout(() => setSavedMessage(""), 2500);
    } catch (err) {
      console.error("Error saving entry:", err);
      alert("Failed to save entry. Try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="journal-container">
      <h2 className="journal-title">📝 Your Journal</h2>

      <textarea
        value={entryText}
        onChange={(e) => setEntryText(e.target.value)}
        placeholder="Write your thoughts here..."
        className="journal-textarea"
      />

      <button
        onClick={handleSave}
        className="journal-save-btn"
        disabled={saving}
        type="button"
      >
        {saving ? "Saving…" : "Save Entry"}
      </button>

      {/* saved message */}
      {savedMessage && <div className="journal-saved-msg">{savedMessage}</div>}

      <div className="view-all-container">
        <Link to="/entries" className="nav-link-btn">
          View All Entries
        </Link>
      </div>
    </div>
  );
}