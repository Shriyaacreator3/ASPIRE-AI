import { auth ,googleProvider} from "firebase";
import { createUserwithEmailandPassword,signInWithPopup,signOut} from "firebase/auth";
import { useState } from "react";

export const auth = () => {
    const [email,setEmail]=useState("");
    const [password, setPassword]=useState("");
    

    const signIn = async ()=> {
        try{
        await createUserwithEmailandPassword(auth, email, password);
        }catch(err){
            console.error(err);
        }
    };
    const signInWithGoogle = async ()=> {
        try{
        await signInWithPopup(auth,googleProvider);
        }catch(err){
            console.error(err);
        }
    };
    const logout = async ()=> {
        try{
        await signOut(auth);
        }catch(err){
            console.error(err);
        }
    };
    

    <div class="login-container">
    <h2>aspirAI 🚀</h2>
    
      <input type="email" id="email" placeholder="✉ Email" required onChange={(e)=>setEmail(e.target.value)}/>
      <input type="password" id="password" placeholder="🔑 Password" required onChange={(e)=>setPassword(e.target.value)} />
      <button type="submit" onClick={signIn}>Enter</button>
      <button type="submit" onClick={signInWithGoogle}>Sign In With Google</button>
      <button onClick={logout}>Logout</button>
    
    
    </div>

}
