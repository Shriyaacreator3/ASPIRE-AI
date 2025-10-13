// journalEntries.jsx
import "./journal.css"; // Import the CSS file
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { auth, database } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  deleteDoc,
  doc,
} from "firebase/firestore";

const MOOD_EMOJI = {
  Happy: "😀",
  Good: "🙂",
  Neutral: "😐",
  Sad: "😢",
  Angry: "😡",
};

export default function Entries() {
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);

  // track auth user
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // subscribe to Firestore entries for the signed-in user
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
            mood: data.mood || "Neutral",
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

  const handleDelete = async (id) => {
    if (!user) {
      alert("Please sign in to delete entries.");
      return;
    }
    try {
      await deleteDoc(doc(database, "users", user.uid, "journalEntries", id));
      // onSnapshot will update the UI automatically
    } catch (err) {
      console.error("Failed to delete entry:", err);
      alert("Failed to delete entry. Try again.");
    }
  };

  return (
    <div className="journal-container">
      <div className="title-container">
        <h2 className="journal-title">📖 All Entries</h2>
      </div>

      <div className="journal-entries">
        {entries.length === 0 && <p className="journal-no-entries">You have no saved entries.</p>}
        {entries.map((entry) => (
          <div key={entry.id} className="journal-entry">
            <div className="entry-content">
              <div className="entry-mood-row">
                <span className="entry-mood-emoji" aria-hidden>
                  {MOOD_EMOJI[entry.mood] || "😐"}
                </span>
              </div>
              <p className="journal-entry-text">{entry.text}</p>
              <p className="journal-entry-date">{entry.createdAt}</p>
            </div>
            <button onClick={() => handleDelete(entry.id)} className="delete-btn" type="button">
              🗑
            </button>
          </div>
        ))}
      </div>

      <div className="back-container">
        <Link to="/journal" className="nav-link-btn">
          Back to Journal
        </Link>
      </div>
    </div>
  );
}
