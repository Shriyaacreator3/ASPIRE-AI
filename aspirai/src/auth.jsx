
import "./style.css";
import { auth, database, googleProvider } from "./firebase";
import {signInWithEmailAndPassword, signInWithPopup} from "firebase/auth";

import { doc, setDoc, getDoc} from "firebase/firestore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

export const Login = () => {
    const [email,setEmail]=useState("");
    const [password, setPassword]=useState("");

    const navigate = useNavigate();

    
    const loginWithEmail=async()=>{
        
        try{
            const userCred =await signInWithEmailAndPassword(auth,email,password);
            const userDocRef = doc(database, "users", userCred.user.uid);
            const userSnap = await getDoc(userDocRef);
            if (!userSnap.exists()) {
                alert("User not found. Please register first!");
                return;
                };

            navigate("/profile-setup");
         }


        catch(err){
            alert(err.message);
        }

    }
    const loginWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, googleProvider);
      const user = result.user;

      const userDocRef = doc(database, "users", user.uid);
      const userSnap = await getDoc(userDocRef);

      if (!userSnap.exists()) {
        alert("User not found. Please register first!");
                return;
      }

      navigate("/profile-setup");
    }
    catch(err){
        alert(err.message);
    }
     
  }
  return(
    <div className="login-container">
    <h2>aspirAI 🚀</h2>
    
      <input type="email" id="email" placeholder="✉ Email" required onChange={(e)=>setEmail(e.target.value)}/>
      <input type="password" id="password" placeholder="🔑 Password" required onChange={(e)=>setPassword(e.target.value)} />
      <button type="submit" onClick={ loginWithEmail }>Login</button>
      <button type="submit" onClick={loginWithGoogle}>Login with Google</button>
        
       <div>
        Don't have an account?<Link to="/signup" >Sign up here</Link>
        </div> 
    
    </div>
  );

};
