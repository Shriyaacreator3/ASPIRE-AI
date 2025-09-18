
import "./style.css";
import { auth } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup,signOut} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    const [email,setEmail]=useState("");
    const [password, setPassword]=useState("");

    const navigate = useNavigate();

    const signIn = async ()=> {
      try{
        await createUserWithEmailAndPassword(auth, email, password);
        navigate("/home");
      }
      catch(err) {
        alert(err.message);
      }
    const signInWithGoogle = async()=>
       try{
        await signInWithPopup(auth,googleProvider);
        navigate("/home");
      }
      catch(err) {
        alert(err.message);
      }
     const logout = async()=>
       try{
        await signOut(auth);
        navigate("/home");
      }
      catch(err) {
        alert(err.message);
      }

    };
 
  return(
    <div className="login-container">
    <h2>aspirAI 🚀</h2>
    
      <input type="email" id="email" placeholder="✉ Email" required onChange={(e)=>setEmail(e.target.value)}/>
      <input type="password" id="password" placeholder="🔑 Password" required onChange={(e)=>setPassword(e.target.value)} />
      <button type="submit" onClick={signIn}>Enter</button>
      <button type="submit" onClick={signInWithGoogle}>Sign In With Google</button>
      <button onClick={logout}>Logout</button>
    
    
    </div>
  );

}
