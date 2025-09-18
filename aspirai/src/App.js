import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Login} from "./auth";
import { Signup} from "./Signup";
import {Home} from "./home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/signup" element={<Signup />} />  
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
