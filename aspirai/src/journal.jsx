import { useState, useEffect } from "react";
import {Link } from "react-router-dom";
import "./journal.css"; // Import the CSS file

export default function Journal() {
  const [entryText, setEntryText] = useState("");
  const [entries, setEntries] = useState([]);

  // Load entries from localStorage on mount
  useEffect(() => {
    try {
      const savedEntries = JSON.parse(localStorage.getItem("journalEntries")) || [];
      setEntries(savedEntries);
    } catch (error) {
      console.error("Failed to parse journal entries from localStorage", error);
      setEntries([]);
    }
  }, []);

  // Save entries to localStorage whenever entries change
  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(entries));
  }, [entries]);

  const handleSave = () => {
    if (!entryText.trim()) return;

    const newEntry = {
      id: Date.now(),
      text: entryText,
      createdAt: new Date().toLocaleString(),
    };

    setEntries([newEntry, ...entries]);
    setEntryText("");
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

      <button onClick={handleSave} className="journal-save-btn">
        Save Entry
      </button>

      <div className="view-all-container">
          {/* Changed Link to a standard anchor tag to fix the error */}
          <Link to="/entries" className="nav-link-btn">
            View All Entries
          </Link>
        </div>
    </div>
  );
}