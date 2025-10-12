import { useState, useEffect } from "react";
import "./settings.css";
import XPTracker from "./XPTracker"; // reuse the XPTracker component

export const Settings=()=> {
  const [form, setForm] = useState({
    username: "",
    age: "",
    gender: "",
    college: "",
    year: "",
    branch: "",
  });

  const [message, setMessage] = useState("");
  const [xp, setXp] = useState(0);

  // Calculate XP based on filled fields
  useEffect(() => {
    const fields = Object.values(form);
    const filledCount = fields.filter((f) => f !== "").length;
    setXp(filledCount * 5); // 5 XP per filled field
  }, [form]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSave = (e) => {
    e.preventDefault();
    setMessage("Profile saved successfully!");
    // Here you can also send form data to backend or Firebase
  };

  return (
    <div className="settings-container">
      <h2>⚙ User Profile</h2>

      <XPTracker xp={xp} maxXp={30} showConfetti={xp === 30} />

      <form className="settings-form" onSubmit={handleSave}>
        <label>
          Username:
          <input
            type="text"
            name="username"
            placeholder="Enter your username"
            value={form.username}
            onChange={handleChange}
          />
        </label>

        <label>
          Age:
          <input
            type="number"
            name="age"
            placeholder="Enter your age"
            value={form.age}
            onChange={handleChange}
          />
        </label>

        <label>
          Gender:
          <select name="gender" value={form.gender} onChange={handleChange}>
            <option value="">Select gender</option>
            <option value="male">Male</option>
            <option value="female">Female</option>
            <option value="other">Other</option>
          </select>
        </label>

        <label>
          College Name:
          <input
            type="text"
            name="college"
            placeholder="Enter your college name"
            value={form.college}
            onChange={handleChange}
          />
        </label>

        <label>
          Year of Study:
          <select name="year" value={form.year} onChange={handleChange}>
            <option value="">Select year</option>
            <option value="1">1st Year</option>
            <option value="2">2nd Year</option>
            <option value="3">3rd Year</option>
            <option value="4">4th Year</option>
          </select>
        </label>

        <label>
          Branch:
          <input
            type="text"
            name="branch"
            placeholder="Enter your branch"
            value={form.branch}
            onChange={handleChange}
          />
        </label>

        <button type="submit">Save Profile</button>
      </form>
  

      {message && <p className="settings-message">{message}</p>}
    </div>
  );
}