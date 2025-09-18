
import "./style.css";
import { auth } from "./firebase";
import {signInWithEmailAndPassword,sendPasswordResetEmail} from "firebase/auth";
import { useState } from "react";
import { useNavigate } from "react-router-dom";

export const Login = () => {
    const [email,setEmail]=useState("");
    const [password, setPassword]=useState("");

    const navigate = useNavigate();

    
    const login=async()=>{
        try{
            await signInWithEmailAndPassword(auth,email,password);
            navigate("/home");
        }
        catch(err){
            alert(err.message);
        }
    };
     
    const resetPassword=async()={
        if(!email){
        alert("Please enter your email first");
        return;
        }
        try{
            await sendPasswordResetEmail(auth,email);
            alert("Password reset email sent!");
        }
        catch(err){
            alert(err.message);
        }
    };
 
  return(
    <div className="login-container">
    <h2>aspirAI 🚀</h2>
    
      <input type="email" id="email" placeholder="✉ Email" required onChange={(e)=>setEmail(e.target.value)}/>
      <input type="password" id="password" placeholder="🔑 Password" required onChange={(e)=>setPassword(e.target.value)} />
      <button type="submit" onClick={login}>Login</button>
        
      <button type="submit" onClick={resetPassword}>Forgot Password</button>
      <p> Don't have an account?<Link to="/signup">Sign up here</Link>Link></p>
    </div>
  );

}
