// Header.jsx
import { useNavigate} from "react-router-dom";
import "./dashboard.css"; // Ensure you use the new CSS file
import { VscHome, VscSettingsGear} from 'react-icons/vsc';
import {FaHeadphones} from 'react-icons/fa';

const Header = () => {
    const navigate = useNavigate();

const navItems = [

    { 
        icon: <VscHome size={19} />, 
        label: 'Home', 
        onClick: () => navigate('/home') 
    },
    { 
        icon: <VscSettingsGear size={19} />, 
        label: 'Settings', 
        onClick: () => navigate('/settings') 
    },
    { 
      icon: <FaHeadphones size={19} />,
      label: 'Lofi Zone', 
      onClick: () => navigate('/lofi'),
    },
    
];
  return (
          <header className="navbar">
                <h1>aspirAI</h1> 
                <div className="navbar-icons">
                    {navItems.map((item) => (
                        <button 
                        key={item.label} 
                        className="nav-item" 
                        onClick={item.onClick}
                        aria-label={item.label} // Accessibility improvement
                        >
                    <span className="nav-icon">{item.icon}</span>
                    <span className="nav-label">{item.label}</span>
                    </button>
                ))}
                </div>
          </header>
  );
};

export default Header;
