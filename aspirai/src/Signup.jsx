import { auth, database, googleProvider } from "./firebase";
import { createUserWithEmailAndPassword, signInWithPopup } from "firebase/auth";
import { doc, setDoc, updateDoc } from "firebase/firestore";
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import Stepper, { Step } from './Stepper';
import './style.css';

export const Signup = () => {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [name, setName] = useState("");
    const [role, setRole] = useState("");
    const navigate = useNavigate();

    const executeEmailSignup = async () => {
        if (!email || !password) {
            alert("Please enter email and password.");
            return false;
        }
        try {
            const userCred = await createUserWithEmailAndPassword(auth, email, password);
            await setDoc(doc(database, "users", userCred.user.uid), {
                email: email,
                currentXP: 0,
                name: "User", 
                role: "General" 
            });
            return true;
        } catch (err) {
            alert(err.message);
            return false;
        }
    };

    const executeGoogleSignup = async () => {
        try {
            const result = await signInWithPopup(auth, googleProvider);
            await setDoc(doc(database, "users", result.user.uid), {
                email: result.user.email,
                currentXP: 0,
                name: result.user.displayName || "User",
                role: "General"
            }, { merge: true });
            navigate("/home");
            return true;
        } catch (err) {
            alert(err.message);
            return false;
        }
    };

    const executeSaveProfile = async () => {
        if (!name.trim() || !role.trim()) {
            alert("Please fill both Name and Role fields.");
            return false;
        }
        try {
            const uid = auth.currentUser?.uid;
            if (!uid) {
                alert("Authentication failed. Please sign up again.");
                return false;
            }
            await updateDoc(doc(database, "users", uid), { name, role });
            return true;
        } catch (err) {
            alert(err.message);
            return false;
        }
    };

    const handleStepAction = async (step) => {
        switch (step) {
            case 2: return executeEmailSignup();
            case 4: return executeSaveProfile();
            default: return true;
        }
    };

    return (
        <div className="centered-page-container" style={{ backgroundColor: '#E2F0F9' }}>
            <Stepper
                initialStep={1}
                onFinalStepCompleted={() => navigate("/home")}
                onStepAdvance={handleStepAction}
                backButtonText="Back"
                nextButtonText="Continue"
            >
                <Step>
                    <h2 style={{ color: '#DF4C73', marginBottom: '10px' }}>Welcome to AspirAI!</h2>
                    <p style={{ color: '#52525b' }}>Your journey to your dream career starts here.</p>
                </Step>

                <Step>
                    <h3 style={{ color: '#DF4C73'}}>Create Account</h3>
                    <input type="email" placeholder="Email Address" onChange={(e) => setEmail(e.target.value)} className="custom-input" />
                    <input type="password" placeholder="Password" onChange={(e) => setPassword(e.target.value)} className="custom-input" />
                    <div className="separator"><span>OR</span></div>
                 
                    <button className="google-btn" onClick={executeGoogleSignup}>
                           <img 
                           src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg" 
                           alt="Google logo" 
                           className="google-logo"
                           />
                           <span>Sign Up with Google</span>
                    </button>
                    <p className="login-link"> Already have an account? <Link to="/" style={{color: '#286FB4', fontWeight: 'bold'}}>Login</Link> </p>
                </Step>

                <Step>
                    <h3 style={{ color: '#DF4C73' }}>Personalize</h3>
                    <p style={{ color: '#52525b' }}>We would love to know you better!</p>
                    <img style={{ height: '150px', width: '100%', objectFit: 'cover', objectPosition: 'center', borderRadius: '15px'}} 
                        src="/images/cat-name.jpg" />
                    <input
                        type="text"
                        placeholder="👤 Your Full Name"
                        onChange={(e) => setName(e.target.value)}
                        className="custom-input"
                    />
                </Step>

                <Step>
                    <h3 style={{ color: '#DF4C73' }}>Your Goal</h3>
                    <p style={{ color: '#52525b' }}>What do you aspire to become?</p>
                    <img style={{ height: '150px', width: '100%', objectFit: 'cover', objectPosition: 'center', borderRadius: '15px'}} 
                        src="/images/cat-role.jpg" />
                    <input
                        type="text"
                        placeholder="💻 e.g. Software Engineer"
                        onChange={(e) => setRole(e.target.value)}
                        className="custom-input"
                    />
                    <p style={{marginTop: '15px', fontSize: '0.9rem'}}>Click 'Complete' to start your journey!</p>
                </Step>
            </Stepper>
        </div>
    );
};