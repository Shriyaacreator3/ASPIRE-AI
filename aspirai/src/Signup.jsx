import "./style.css";
import { auth, database, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc} from "firebase/firestore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Signup = () => {
  const [email,setEmail] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const signup = async () => {
    try {
      const userCred=await createUserWithEmailAndPassword(auth, email, password);

      
        await setDoc(doc(database,"users",userCred.user.uid),{
        email : email,
        currentXP : 0,
        name : "user",
        role : "general"})

      navigate("/profile-setup");
    } catch (err) {
      alert(err.message);
    }
  };

  const signupWithGoogle = async () => {
    try {
      const result=await signInWithPopup(auth, googleProvider);

       
        await setDoc(doc(database,"users",result.user.uid),{
        email : result.user.email,
        currentXP : 0,
        name : "user",
        role : "general"})


      navigate("/profile-setup");
    } catch (err) {
      alert(err.message);
    }
  };

  return (
    <div className="signup-container">
      <h2>Create Account 🚀</h2>
      <input type="email" placeholder="✉ Email" onChange={(e)=>setEmail(e.target.value)}/>
      <input type="password" placeholder="🔑 Password" onChange={(e)=>setPassword(e.target.value)} />
      <button onClick={signup}>Sign Up</button>
      <button onClick={signupWithGoogle}>Sign Up with Google</button>
  
      <p> Already have an account? <Link to="/">Login</Link> </p>
    </div>
  );
};
