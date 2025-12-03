// Journal.jsx
import { useState, useEffect, useRef } from "react";
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

const MOODS = [
  { key: "Happy", emoji: "😄" },
  { key: "Good", emoji: "🙂" },
  { key: "Neutral", emoji: "😐" },
  { key: "Sad", emoji: "😢" },
  { key: "Angry", emoji: "😡" },
];

export default function Journal() {
  const [entryText, setEntryText] = useState("");
  const [entries, setEntries] = useState([]);
  const [user, setUser] = useState(null);
  const [saving, setSaving] = useState(false);
  const [savedMessage, setSavedMessage] = useState("");
  const [selectedMood, setSelectedMood] = useState("Neutral");
  const textareaRef = useRef(null);

  // Listen for auth state
  useEffect(() => {
    const unsub = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsub();
  }, []);

  // Optionally preview recent entries (keeps UI reactive)
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

  const handleMoodClick = (moodKey) => {
    setSelectedMood(moodKey);
    if (textareaRef.current) {
    textareaRef.current.focus();
  }
  };

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
        mood: selectedMood || "Neutral",
        createdAt: serverTimestamp(),
      });
      setEntryText("");

      setSavedMessage("Saved!");
      setTimeout(() => setSavedMessage(""), 2000);
    } catch (err) {
      console.error("Error saving entry:", err);
      alert("Failed to save entry. Try again.");
    } finally {
      setSaving(false);
    }
  };

  const selectedEmoji = MOODS.find((m) => m.key === selectedMood)?.emoji || "😐";

  return (
    <div className="journal-container">
      <div className="header-container">
        <Link to="/home" className="arrow-btn" aria-label="Back to home">
          ←
        </Link>
        <h2 className="journal-title">📝 Your Journal</h2>
      </div>

      {/* Mood selector */}
<div className="mood-selector">
  {MOODS.map((m) => (
    <button
      key={m.key}
      type="button"
      className={`mood-btn ${selectedMood === m.key ? "selected" : ""}`}
      onClick={() => handleMoodClick(m.key)}
      aria-pressed={selectedMood === m.key}
      title={m.key}
    >
      <span className="mood-desc">{m.key}</span> {/* Move description above emoji */}
      <span className="mood-emoji">{m.emoji}</span>
    </button>
  ))}
</div>

{/* Selected mood wrapper for textarea */}
<div className={`textarea-wrapper ${selectedMood ? "mood-selected" : ""}`}>
  <textarea
    ref={textareaRef}
    value={entryText}
    onChange={(e) => setEntryText(e.target.value)}
    placeholder={`Write your thoughts here... ${selectedEmoji}`}
    className="journal-textarea"
  />
</div>


      <button onClick={handleSave} className="journal-save-btn" disabled={saving} type="button">
        {saving ? "Saving…" : "Save Entry"}
      </button>

      {savedMessage && <div className="journal-saved-msg">{savedMessage}</div>}

      <div className="view-all-container">
        <Link to="/entries" className="nav-link-btn">
          View All Entries
        </Link>
        <Link to="/mood-trends" className="nav-link-btn" aria-label="Mood trends">
          Mood Trends
        </Link>
      </div>
    </div>
  );
}
