import "./style.css";
import { auth, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Signup = () => {
  const [email,setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const signup = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
      navigate("/home");
    } catch (err) {
      alert(err.message);
    }
  };

  const signupWithGoogle = async () => {
    try {
      await signInWithPopup(auth, googleProvider);
      navigate("/home");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="login-container">
      <h2>Create Account 🚀</h2>
      <input type="email" placeholder="✉ Email" onChange={(e)=>setEmail(e.target.value)}/>
      <input type="password" placeholder="🔑 Password" onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={signup}>Sign Up</button>
      <button onClick={signupWithGoogle}>Sign Up with Google</button>
  
      <p> Already have an account? <Link to="/">Login</Link> </p>
    </div>
  );
};
