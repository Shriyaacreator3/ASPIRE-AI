import { useState, useEffect } from "react";
import "./settings.css";
import XPTracker from "./XPTracker";
import { auth, database } from "./firebase";
import { onAuthStateChanged } from "firebase/auth";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";

export const Settings = () => {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState("");
  const [userDoc, setUserDoc] = useState(null);

  const [form, setForm] = useState({
    name: "",
    role: "",
    age: "",
    gender: "",
    college: "",
    year: "",
    branch: "",
  });

  // compute XP: 5 points per filled field (including name & role)
  const computeXp = (data) => {
    const fields = ["name", "role", "age", "gender", "college", "year", "branch"];
    const filledCount = fields.reduce((acc, f) => (data[f] && String(data[f]).trim() ? acc + 1 : acc), 0)
    return Math.min(35, filledCount * 5);
  };

  // watch auth state and user document (prefill name+role from profile doc)
  useEffect(() => {
    let unsubDoc = null;
    const unsubAuth = onAuthStateChanged(auth, async (u) => {
      if (!u) {
        setLoading(false);
        setUserDoc(null);
        return;
      }
      const ref = doc(database, "users", u.uid);

      try {
        const snap = await getDoc(ref);
        if (snap.exists()) {
          const data = snap.data();
          setForm((prev) => ({
            ...prev,
            name: data.name || data.displayName || prev.name,
            role: data.role || prev.role,
            age: data.age || prev.age,
            gender: data.gender || prev.gender,
            college: data.college || prev.college,
            year: data.year || prev.year,
            branch: data.branch || prev.branch,
          }));
          setUserDoc({ uid: u.uid, ref });
        } else {
          // create minimal profile doc so values exist for future reads
          await setDoc(ref, {
            uid: u.uid,
            email: u.email || null,
            name: u.displayName || "",
            role: "",
            xp: computeXp({ name: u.displayName || "", role: "" }),
            createdAt: new Date().toISOString(),
          }, { merge: true });
          setForm((prev) => ({ ...prev, name: u.displayName || "", role: "" }));
          setUserDoc({ uid: u.uid, ref });
        }

        // live updates (keeps form in sync if profile is edited elsewhere)
        unsubDoc = onSnapshot(ref, (snap) => {
          if (!snap.exists()) return;
          const d = snap.data();
          setForm((prev) => ({
            ...prev,
            name: d.name || prev.name,
            role: d.role || prev.role,
            age: d.age || prev.age,
            gender: d.gender || prev.gender,
            college: d.college || prev.college,
            year: d.year || prev.year,
            branch: d.branch || prev.branch,
          }));
        });
      } catch (err) {
        console.error("Failed to load profile:", err);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubAuth();
      if (unsubDoc) unsubDoc();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
  };

  const handleSave = async (e) => {
    e?.preventDefault?.();
    if (!userDoc) {
      setMessage("Sign in to save profile.");
      return;
    }
    setSaving(true);
    setMessage("");
    try {
      const xp = computeXp(form);
      await setDoc(userDoc.ref, {
        name: form.name || "",
        role: form.role || "",
        age: form.age || "",
        gender: form.gender || "",
        college: form.college || "",
        year: form.year || "",
        branch: form.branch || "",
        xp,
        updatedAt: new Date().toISOString(),
      }, { merge: true });

      setMessage("Profile saved.");
      setTimeout(() => setMessage(""), 3000);
    } catch (err) {
      console.error("Failed to save profile:", err);
      setMessage("Save failed. Try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="settings-container"><div className="loading">Loading…</div></div>;
  }

  return (
    <div className="settings-container">
      <div className="settings-header">
        <div className="title">
        <h2 className="settings-title">⚙ Profile & Settings</h2>
        </div>
        <div className="xp-wrapper" aria-hidden>
       <XPTracker xp={computeXp(form)} maxXp={35} showConfetti={computeXp(form) >= 35} />
    </div>
      </div>
      <form className="settings-form" onSubmit={handleSave}>
        <label>
          Name
          <input name="name" value={form.name} onChange={handleChange} placeholder="Your full name" />
        </label>

        <label>
          Role
          <input name="role" value={form.role} onChange={handleChange} placeholder="Your role" />
        </label>

        <label>
          Age
          <input name="age" value={form.age} onChange={handleChange} type="number" min="0" placeholder="Age" />
        </label>

        <label>
          Gender
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select gender</option>
            <option value="female">Female</option>
            <option value="male">Male</option>
            <option value="other">Other</option>
            <option value="prefer_not">Prefer not to say</option>
          </select>
        </label>

        <label>
          College
          <input name="college" value={form.college} onChange={handleChange} placeholder="College / University" />
        </label>

        <label>
          Year of study
          <select name="year" value={form.year} onChange={handleChange}>
            <option value="">Select year</option>
            <option value="1">1st</option>
            <option value="2">2nd</option>
            <option value="3">3rd</option>
            <option value="4">4th</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          Branch
          <input name="branch" value={form.branch} onChange={handleChange} placeholder="Branch / Major" />
        </label>

        <div className="form-actions">
          <button type="submit" className="settings-save-btn" disabled={saving}>
            {saving ? "Saving…" : "Save Profile"}
          </button>
          {message && <div className="settings-message">{message}</div>}
        </div>
      </form>
    </div>
  );
};

export default Settings;