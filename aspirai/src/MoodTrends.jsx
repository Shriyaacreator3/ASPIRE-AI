// MoodTrends.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { auth, database } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  ResponsiveContainer,
  LineChart,
  Line,
  Legend,
} from "recharts";
import "./journal.css";

const MOODS = ["Happy", "Good", "Neutral", "Sad", "Angry"];
const MOOD_COLORS = {
  Happy: "#FFD700",   // Gold
  Good: "#32CD32",    // LimeGreen
  Neutral: "#D3D3D3", // LightGray
  Sad: "#1E90FF",     // DodgerBlue
  Angry: "#FF4500",   // OrangeRed
};

function getDatesLastNDays(n) {
  const result = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    result.push(new Date(d.getFullYear(), d.getMonth(), d.getDate())); // midnight
  }
  return result;
}

function getLastSixMonths() {
  const result = [];
  const now = new Date();
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    result.push(d);
  }
  return result;
}

export default function MoodTrends() {
  const [user, setUser] = useState(null);
  const [entries, setEntries] = useState([]);

  useEffect(() => {
    const unsubAuth = onAuthStateChanged(auth, (u) => setUser(u));
    return () => unsubAuth();
  }, []);

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
                ? data.createdAt.toDate()
                : new Date(),
          };
        });
        setEntries(docs);
      },
      (err) => {
        console.error("Failed to load journal entries for trends:", err);
        setEntries([]);
      }
    );

    return () => unsub();
  }, [user]);

  const weekly = (() => {
    const days = getDatesLastNDays(7);
    const dayMap = days.map((d) => {
      const label = d.toLocaleDateString(undefined, { month: "short", day: "numeric" });
      const base = { dateLabel: label };
      MOODS.forEach((m) => (base[m] = 0));
      return base;
    });

    entries.forEach((e) => {
      const eDate = new Date(e.createdAt);
      const midnight = new Date(eDate.getFullYear(), eDate.getMonth(), eDate.getDate());
      const idx = days.findIndex((d) => d.getTime() === midnight.getTime());
      if (idx !== -1) {
        dayMap[idx][e.mood] = (dayMap[idx][e.mood] || 0) + 1;
      }
    });

    return dayMap;
  })();

  const monthly = (() => {
    const months = getLastSixMonths();
    const monthMap = months.map((d) => {
      const label = d.toLocaleDateString(undefined, { month: "short", year: "numeric" });
      const base = { monthLabel: label };
      MOODS.forEach((m) => (base[m] = 0));
      return base;
    });

    entries.forEach((e) => {
      const eDate = new Date(e.createdAt);
      const idx = months.findIndex(
        (m) => m.getFullYear() === eDate.getFullYear() && m.getMonth() === eDate.getMonth()
      );
      if (idx !== -1) {
        monthMap[idx][e.mood] = (monthMap[idx][e.mood] || 0) + 1;
      }
    });

    return monthMap;
  })();

  return (
    <div className="journal-container">
      <div className="header-container">
        <Link to="/journal" className="arrow-btn" aria-label="Back to journal">←</Link>
        <h2 className="journal-title">📊 Mood Trends</h2>
        <div style={{ width: 96 }} />
      </div>

      <section style={{ marginTop: 10 }}>
        <h3 className="recent-entries-title">Weekly Mood Counts (last 7 days)</h3>
        <div style={{ width: "100%", height: 300 }}>
          <ResponsiveContainer>
            <BarChart data={weekly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="dateLabel" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {MOODS.map((m) => (
                <Bar key={m} dataKey={m} stackId="a" fill={MOOD_COLORS[m]} />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </div>
      </section>

      <section style={{ marginTop: 30 }}>
        <h3 className="recent-entries-title">Monthly Mood Counts (last 6 months)</h3>
        <div style={{ width: "100%", height: 320 }}>
          <ResponsiveContainer>
            <LineChart data={monthly}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="monthLabel" />
              <YAxis allowDecimals={false} />
              <Tooltip />
              <Legend />
              {MOODS.map((m) => (
                <Line
                  key={m}
                  type="monotone"
                  dataKey={m}
                  stroke={MOOD_COLORS[m]}
                  strokeWidth={2}
                  dot
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </section>

      <div className="view-all-container" style={{ marginTop: 24 }}>
        <Link to="/journal" className="nav-link-btn">Back to Journal</Link>
      </div>
    </div>
  );
}
