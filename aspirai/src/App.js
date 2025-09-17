import { BrowserRouter, Routes, Route } from "react-router-dom";
import {Login} from "./auth";
import {Home} from "./home";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Login />} />  
        <Route path="/home" element={<Home />} />
      </Routes>
    </BrowserRouter>
  );
}
