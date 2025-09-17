import { auth } from "firebase";
import { createUserwithEmailandPassword } from "firebase/auth";
import { useState } from "react";

export const auth = () => {
    const [email,setEmail]=useState("");
    const [password, setPassword]=useState("");

    const signIn = async ()=> {
        await createUserwithEmailandPassword(auth, email, password);
    };

    <div class="login-container">
    <h2>aspirAI 🚀</h2>
    
      <input type="email" id="email" placeholder="✉ Email" required onChange={(e)=>setEmail(e.target.value)}/>
      <input type="password" id="password" placeholder="🔑 Password" required onChange={(e)=>setPassword(e.target.value)} />
      <button type="submit" onClick={signIn}>Enter</button>
    
    </div>

}