import { useState, useEffect } from "react";
import {Link } from "react-router-dom";
// Removed Link import as it requires a Router context that might be missing.
// Using a standard anchor tag <a> instead to prevent the crash.
import "./journal.css"; // Import the CSS file
export default function Entries() {
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    try {
      const savedEntries = JSON.parse(localStorage.getItem("journalEntries")) || [];
      setEntries(savedEntries);
    } catch (error) {
      console.error("Failed to parse journal entries from localStorage", error);
      setEntries([]);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem("journalEntries", JSON.stringify(entries));
  }, [entries]);

  const handleDelete = (id) => {
    const updatedEntries = entries.filter((entry) => entry.id !== id);
    setEntries(updatedEntries);
  };

  return (
      <div className="journal-container">
        <div className="title-container">
          <h2 className="journal-title">📖 All Entries</h2>
        </div>

        <div className="journal-entries">
          {entries.length === 0 && (
            <p className="journal-no-entries">You have no saved entries.</p>
          )}
          {entries.map((entry) => (
            <div key={entry.id} className="journal-entry">
              <div className="entry-content">
                <p className="journal-entry-text">{entry.text}</p>
                <p className="journal-entry-date">{entry.createdAt}</p>
              </div>
              <button onClick={() => handleDelete(entry.id)} className="delete-btn">
                🗑
              </button>
            </div>
          ))}
        </div>
        <div className="back-container">
          {/* Changed Link to a standard anchor tag to fix the error */}
          <Link to ="/journal" className="nav-link-btn">
            Back to Journal
          </Link>
        </div>
      </div>
  );
}